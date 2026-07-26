import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env.js';
import { connectionsRoutes } from './routes/connections.js';
import { healthRoutes } from './routes/health.js';
import { integrationsRoutes } from './routes/integrations.js';
import { metaIntegrationsRoutes } from './routes/metaIntegrations.js';

// Allowlist explicita - nunca wildcard, especialmente em producao. localhost:5173 so entra fora
// de producao (dev local do frontend Vite); FRONTEND_URL e o dominio real do frontend deployado.
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();
  if (env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173');
  }
  if (env.FRONTEND_URL) {
    origins.add(env.FRONTEND_URL.replace(/\/$/, ''));
  }
  return origins;
}

export function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  const allowedOrigins = buildAllowedOrigins();

  // CORS precisa ser registrado antes das rotas para interceptar o preflight OPTIONS de qualquer
  // uma delas.
  app.register(cors, {
    origin(origin, callback) {
      // Sem header Origin (curl, chamada servidor-a-servidor, healthcheck) - permitir; nao e uma
      // requisicao de browser sujeita a CORS.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: false,
  });

  app.register(healthRoutes);
  app.register(integrationsRoutes);
  app.register(metaIntegrationsRoutes);
  app.register(connectionsRoutes);

  return app;
}
