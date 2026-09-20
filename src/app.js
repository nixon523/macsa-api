import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    contentSecurityPolicy: env.nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);

app.use(express.json({ limit: '3mb' }));

// Solo mostrar en consola solicitudes con error (>= 400), evitando saturación por polling
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    skip: (_req, res) => res.statusCode < 400,
  }),
);

const globalLimiter = rateLimit({
  windowMs: env.rateLimit.global.windowMs,
  max: env.rateLimit.global.max,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const loginLimiter = rateLimit({
  windowMs: env.rateLimit.login.windowMs,
  max: env.rateLimit.login.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Espere unos minutos.' },
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/autenticacion/login', loginLimiter);

const resetLimiter = rateLimit({
  windowMs: env.rateLimit.passwordReset.windowMs,
  max: env.rateLimit.passwordReset.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes de restablecimiento de contraseña. Espere unos minutos.' },
});
app.use('/api/auth/solicitudes-reinicio-password', resetLimiter);
app.use('/api/autenticacion/solicitudes-reinicio-password', resetLimiter);
app.use('/api/auth/password-reset-requests', resetLimiter);
app.use('/api/autenticacion/password-reset-requests', resetLimiter);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
