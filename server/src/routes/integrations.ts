import type { FastifyInstance } from 'fastify';
import { getProvider, listProviderNames } from '../integrations/core/registry.js';

interface ProviderParams {
  provider: string;
}

export async function integrationsRoutes(app: FastifyInstance) {
  app.get('/integrations/providers', async () => {
    return {
      providers: listProviderNames(),
    };
  });

  app.get<{ Params: ProviderParams }>('/integrations/:provider/status', async (request, reply) => {
    const provider = getProvider(request.params.provider);

    if (!provider) {
      return reply.status(404).send({
        error: `Provider "${request.params.provider}" nao existe. Providers disponiveis: ${listProviderNames().join(', ')}.`,
      });
    }

    const status = await provider.getConnectionStatus();
    return status;
  });
}
