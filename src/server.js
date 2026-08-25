import app from './app.js';
import { env } from './config/env.js';
import { getPool, closePool } from './config/db.js';

async function bootstrap() {
  await getPool();
  console.log(`[db] Conexión establecida con ${env.db.database} en ${env.db.server}`);

  const server = app.listen(env.port, () => {
    console.log(`[api] Macsa CMMS API escuchando en http://localhost:${env.port}/api`);
  });

  async function shutdown(signal) {
    console.log(`\n[${signal}] Cerrando servidor...`);
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
