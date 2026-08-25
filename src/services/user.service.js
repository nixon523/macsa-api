import { execProc } from '../config/db.js';
import { hashPassword } from '../security/password.js';

export async function getAllUsers() {
  return execProc('uspUsuarioObtenerTodos');
}

export async function getUserById(userId) {
  const rows = await execProc('uspUsuarioObtenerPorId', { UserId: userId });
  return rows[0] ?? null;
}

export async function createUser({ username, displayName, roleCode, password }) {
  const credentials = hashPassword(password);
  return execProc('uspUsuarioCrear', {
    Username: username,
    DisplayName: displayName,
    RoleCode: roleCode,
    PasswordSalt: credentials.salt,
    PasswordHash: credentials.hash,
    PasswordIterations: credentials.iterations,
  });
}

export async function updateUser(userId, { displayName, roleCode, newPassword }) {
  const inputs = {
    UserId: userId,
    DisplayName: displayName ?? undefined,
    NewRoleCode: roleCode ?? null,
    NewSalt: undefined,
    NewHash: undefined,
    NewIterations: undefined,
  };

  if (newPassword) {
    const credentials = hashPassword(newPassword);
    inputs.NewSalt = credentials.salt;
    inputs.NewHash = credentials.hash;
    inputs.NewIterations = credentials.iterations;
  }

  return execProc('uspUsuarioActualizar', inputs);
}

export async function toggleUserDisabled(userId, disabled) {
  return execProc('uspUsuarioAlternarDeshabilitado', { UserId: userId, Disabled: Boolean(disabled) });
}
