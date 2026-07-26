import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAdmin } from '../auth/requireAdmin.js';
import { upsertMetaConnection } from '../integrations/core/connectionsRepository.js';
import { metaProvider } from '../integrations/meta/metaProvider.js';
import { listMetaAdAccounts, MetaApiError } from '../integrations/meta/metaApiClient.js';

const createConnectionSchema = z.object({
  client_id: z.string().uuid('client_id deve ser um UUID valido.'),
  ad_account_id: z.string().min(1, 'ad_account_id e obrigatorio.'),
});

export async function metaIntegrationsRoutes(app: FastifyInstance) {
  // Lista as contas de anuncio acessiveis pelo META_SYSTEM_USER_TOKEN configurado no servidor -
  // nao recebe nem usa nenhuma credencial vinda do cliente da API.
  app.get('/integrations/meta/accounts', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const accounts = await metaProvider.listAccounts({ hublevelClientId: '' });
      return { accounts };
    } catch (error) {
      request.log.error(error);
      const message = error instanceof MetaApiError ? error.message : 'Falha ao listar contas Meta Ads.';
      return reply.status(502).send({ error: message });
    }
  });

  // Vincula um ad_account_id (ja existente/acessivel via system user token) a um client_id do
  // HubLevel. Nao aceita nenhum token no corpo da requisicao - a credencial usada e sempre a do
  // servidor.
  app.post('/integrations/meta/connections', { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = createConnectionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues.map((issue) => issue.message).join(' ') });
    }

    const { client_id: clientId, ad_account_id: adAccountId } = parsed.data;

    let accessibleAccounts;
    try {
      accessibleAccounts = await listMetaAdAccounts();
    } catch (error) {
      request.log.error(error);
      const message = error instanceof MetaApiError ? error.message : 'Falha ao validar contas Meta Ads acessiveis.';
      return reply.status(502).send({ error: message });
    }

    const account = accessibleAccounts.find((row) => row.id === adAccountId || row.account_id === adAccountId);
    if (!account) {
      return reply.status(400).send({ error: `Conta "${adAccountId}" nao esta acessivel pelo system user configurado.` });
    }

    const connection = await upsertMetaConnection({
      clientId,
      externalAccountId: account.id,
      externalAccountName: account.name,
      currencyCode: account.currency ?? null,
      timezone: account.timezone_name ?? null,
      actorId: request.authUser!.id,
    });

    return reply.status(201).send({ connection });
  });
}
