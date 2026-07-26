import Fastify from 'fastify';
import { env } from './env.js';
import { connectionsRoutes } from './routes/connections.js';
import { healthRoutes } from './routes/health.js';
import { integrationsRoutes } from './routes/integrations.js';
import { metaIntegrationsRoutes } from './routes/metaIntegrations.js';

export function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  app.register(healthRoutes);
  app.register(integrationsRoutes);
  app.register(metaIntegrationsRoutes);
  app.register(connectionsRoutes);

  return app;
}
