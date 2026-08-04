import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../auth/requireAdmin.js';
import {
  getClientIntegrationById,
  insertSyncLog,
  markSyncError,
  markSyncSuccess,
} from '../integrations/core/connectionsRepository.js';
import { fromDbProviderCode } from '../integrations/core/providerDbCode.js';
import { getProvider } from '../integrations/core/registry.js';
import { ProviderNotImplementedError } from '../integrations/core/types.js';
import { MetaApiError } from '../integrations/meta/metaApiClient.js';

interface SyncParams {
  id: string;
}

// Endpoint generico (nao especifico de Meta) - resolve o provider certo a partir da linha de
// client_integrations e delega para provider.syncAccount(...). Hoje so Meta tem sync real; Google
// vai cair em ProviderNotImplementedError, que e tratado aqui como uma falha de sync normal (log
// gravado, integracao marcada como erro), nao como um crash do servidor.
export async function connectionsRoutes(app: FastifyInstance) {
  app.post<{ Params: SyncParams }>('/integrations/connections/:id/sync', { preHandler: requireAdmin }, async (request, reply) => {
    const connection = await getClientIntegrationById(request.params.id);
    if (!connection) {
      return reply.status(404).send({ error: 'Integracao nao encontrada.' });
    }

    const providerName = fromDbProviderCode(connection.provider);
    const provider = providerName ? getProvider(providerName) : null;

    if (!providerName || !provider) {
      return reply.status(400).send({ error: `Provider "${connection.provider}" desconhecido.` });
    }

    if (!connection.external_account_id) {
      return reply.status(400).send({ error: 'Esta integracao ainda nao tem uma conta de anuncio vinculada.' });
    }

    const actorId = request.authUser!.id;

    try {
      const result = await provider.syncAccount(connection.external_account_id, {
        hublevelClientId: connection.client_id,
        clientIntegrationId: connection.id,
        currencyCode: connection.currency_code ?? undefined,
        actorId,
      });

      const hasRows = result.rowsSaved > 0;

      await markSyncSuccess(connection.id, actorId);
      await insertSyncLog({
        clientIntegrationId: connection.id,
        clientId: connection.client_id,
        provider: connection.provider,
        status: 'success',
        message: hasRows ? 'Sincronizacao concluida.' : 'Sync completed with no metrics returned',
        errorMessage: null,
        metadata: {
          provider: connection.provider,
          externalAccountId: connection.external_account_id,
          dateFrom: result.dateFrom,
          dateTo: result.dateTo,
          rowsFetched: result.rowsFetched,
          rowsNormalized: result.rowsNormalized,
          rowsSaved: result.rowsSaved,
          ...(hasRows ? {} : { reason: 'no_metrics_returned' }),
        },
        actorId,
      });

      return { ok: true };
    } catch (error) {
      request.log.error(error);

      const errorCode =
        error instanceof MetaApiError ? String(error.code ?? 'meta_api_error')
        : error instanceof ProviderNotImplementedError ? 'not_implemented'
        : 'internal_error';

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar integracao.';

      await markSyncError(connection.id, actorId, errorCode, errorMessage);
      await insertSyncLog({
        clientIntegrationId: connection.id,
        clientId: connection.client_id,
        provider: connection.provider,
        status: 'failed',
        message: null,
        errorMessage,
        metadata: { errorCode },
        actorId,
      });

      return reply.status(502).send({ error: errorMessage });
    }
  });
}
