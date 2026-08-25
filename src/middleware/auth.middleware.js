import { verifyToken } from '../security/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Token no proporcionado.'));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
    return next();
  } catch {
    return next(ApiError.unauthorized('Token inválido o expirado.'));
  }
}
