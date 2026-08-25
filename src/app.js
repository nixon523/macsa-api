import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',') }));
app.use(express.json({ limit: '3mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

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

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
