const REQUIRED_KEYS = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Variables de entorno faltantes: ${missing.join(', ')}. Copia .env.example a .env y complétalo.`,
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  db: {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
    },
    pool: {
      max: Number(process.env.DB_POOL_MAX ?? 10),
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  rateLimit: {
    login: {
      windowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MIN ?? 15) * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 10),
    },
    global: {
      windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MIN ?? 1) * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_GLOBAL_MAX ?? 300),
    },
  },
};
