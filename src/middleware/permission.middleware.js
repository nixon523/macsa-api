import { ApiError } from '../utils/ApiError.js';
import { hasPermission } from '../security/rolePermissions.js';

export function requirePermission(requiredPermission) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!hasPermission(req.user.role, req.user.permissions, requiredPermission)) {
      return next(ApiError.forbidden(`Se requiere el permiso "${requiredPermission}".`));
    }
    return next();
  };
}

export function requireAnyPermission(...allowedPermissions) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    const ok = allowedPermissions.some((perm) =>
      hasPermission(req.user.role, req.user.permissions, perm),
    );
    if (!ok) {
      return next(ApiError.forbidden('No cuentas con permisos suficientes para esta operación.'));
    }
    return next();
  };
}

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Rol insuficiente para esta operación.'));
    }
    return next();
  };
}
