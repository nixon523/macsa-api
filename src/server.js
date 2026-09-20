import app from './app.js';
import { env } from './config/env.js';
import { getPool, closePool } from './config/db.js';

async function bootstrap() {
  await getPool();
  console.log([db] Conexión establecida con  en );

  const server = app.listen(env.port, () => {
    console.log([api] Macsa CMMS API escuchando en http://localhost:/api);
  });

  // Protección DoS / Slowloris para Windows Server / IIS
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;
  server.keepAliveTimeout = 61000;

  async function shutdown(signal) {
    console.log(\n[] Cerrando servidor...);
    server.close();
    await closePool();
    process.exit(0);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[fatal] No se pudo iniciar la API:', error.message);
  process.exit(1);
});
