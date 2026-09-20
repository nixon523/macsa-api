import { execProc } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyPassword, generateTemporaryPassword } from '../security/password.js';

const MAX_FAILED_ATTEMPTS = 5;

export async function login(username, password) {
  const rows = await execProc('uspUsuarioObtenerParaLogin', { Username: username });
  const user = rows[0];

  if (!user) {
    throw ApiError.unauthorized('Credenciales inválidas.');
  }

  if (user.Disabled) {
    throw ApiError.forbidden('La cuenta está deshabilitada. Contacte al administrador.');
  }

  if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
    throw ApiError.locked(
      `Cuenta bloqueada por intentos fallidos hasta ${new Date(user.LockedUntil).toLocaleString()}.`,
    );
  }

  const passwordOk = verifyPassword(
    password,
    user.PasswordSalt,
    user.PasswordHash,
    user.PasswordIterations,
  );

  if (!passwordOk) {
    await execProc('uspLoginRegistrarFallo', { UserId: user.UserId });
    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - ((user.FailedLoginAttempts ?? 0) + 1));
    throw ApiError.unauthorized(
      remaining > 0
        ? `Credenciales inválidas. Intentos restantes: ${remaining}.`
        : 'Credenciales inválidas. La cuenta queda bloqueada por 5 minutos.',
    );
  }

  await execProc('uspLoginReiniciarIntentos', { UserId: user.UserId });

  const permissions = (user.PermissionsCsv ?? user.permissionsCsv)
    ? (user.PermissionsCsv ?? user.permissionsCsv).split(',').filter(Boolean)
    : [];

  return {
    userId: user.UserId,
    username: user.Username,
    displayName: user.DisplayName,
    roleCode: user.RoleCode,
    permissions,
    mustChangePassword: Boolean(user.MustChangePassword),
    passwordResetRequested: Boolean(user.PasswordResetRequested),
  };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const rows = await execProc('uspUsuarioObtenerPorId', { UserId: userId });
  const user = rows[0];

  if (!user) {
    throw ApiError.notFound('Usuario no encontrado.');
  }

  // Si el usuario no está en flujo forzado de cambio inicial, currentPassword es estrictamente obligatorio
  if (!user.MustChangePassword) {
    if (!currentPassword) {
      throw ApiError.badRequest('La contraseña actual es obligatoria.');
    }
    const currentOk = verifyPassword(
      currentPassword,
      user.PasswordSalt,
      user.PasswordHash,
      user.PasswordIterations,
    );
    if (!currentOk) {
      throw ApiError.unauthorized('La contraseña actual es incorrecta.');
    }
  } else if (currentPassword) {
    const currentOk = verifyPassword(
      currentPassword,
      user.PasswordSalt,
      user.PasswordHash,
      user.PasswordIterations,
    );
    if (!currentOk) {
      throw ApiError.unauthorized('La contraseña actual es incorrecta.');
    }
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
    throw ApiError.badRequest('La nueva contraseña debe tener al menos 8 caracteres.');
  }

  if (currentPassword && currentPassword === newPassword) {
    throw ApiError.badRequest('La nueva contraseña debe ser distinta a la contraseña actual.');
  }

  const credentials = hashPassword(newPassword);
  return execProc('uspUsuarioCambiarPassword', {
    UserId: userId,
    PasswordSalt: credentials.salt,
    PasswordHash: credentials.hash,
    PasswordIterations: credentials.iterations,
  });
}

export async function requestPasswordReset(username) {
  return execProc('uspSolicitudReinicioPasswordCrear', { Username: username });
}

export async function pendingPasswordResets() {
  return execProc('uspSolicitudReinicioPasswordListarPendientes');
}

export async function resolvePasswordReset(requestId, targetUserId) {
  const temporaryPassword = generateTemporaryPassword();
  const credentials = hashPassword(temporaryPassword);

  // 1. Asignar nueva clave temporal al usuario
  await execProc('uspUsuarioReiniciarTemporal', {
    UserId: targetUserId,
    PasswordSalt: credentials.salt,
    PasswordHash: credentials.hash,
    PasswordIterations: credentials.iterations,
  });

  // 2. Marcar la solicitud como resuelta
  if (requestId) {
    try {
      await execProc('uspSolicitudReinicioPasswordMarcarResuelta', { RequestId: requestId });
    } catch {
      // Si la solicitud ya estaba marcada o no existe registro huérfano, continuar
    }
  }

  return { temporaryPassword };
}
