import Fastify from 'fastify';
import { env } from './env.js';
import { healthRoutes } from './routes/health.js';
import { integrationsRoutes } from './routes/integrations.js';

export function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  app.register(healthRoutes);
  app.register(integrationsRoutes);

  return app;
}
