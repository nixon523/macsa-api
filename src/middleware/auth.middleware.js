import { verifyToken } from '../security/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';

export async function requireAuth(req, _res, next) {
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
    req.sessionTokenId = payload.jti;

    // Control de concurrencia: si el token tiene identificador de sesión, verificar si sigue activa
    if (payload.jti && payload.sub) {
      try {
        const active = await authService.isSessionActive(payload.sub, payload.jti);
        if (!active) {
          return next(
            ApiError.unauthorized(
              'Tu sesión ha finalizado porque se inició sesión en otro dispositivo (máximo 2 sesiones permitidas).',
              'SESSION_SUPERSEDED',
            ),
          );
        }
      } catch (err) {
        // Si hay una falla transitoria al consultar BD, loggear y permitir continuar
        console.warn('[auth] Advertencia al verificar sesion activa:', err.message);
      }
    }

    return next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Token inválido o expirado.'));
  }
}
