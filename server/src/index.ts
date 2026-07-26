import { env } from './env.js';
import { buildServer } from './server.js';

const app = buildServer();

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then((address) => {
    app.log.info(`HubLevel server listening at ${address}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
