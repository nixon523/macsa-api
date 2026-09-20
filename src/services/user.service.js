import { execProc, buildTvp, sql } from '../config/db.js';
import { hashPassword } from '../security/password.js';

const PERMISSION_COLUMNS = [{ name: 'Valor', type: sql.NVarChar(50) }];

function permissionsTvp(permissions = []) {
  const rows = permissions.map((p) => ({ Valor: String(p) }));
  return buildTvp('TipoListaTexto', PERMISSION_COLUMNS, rows);
}

function mapUserRow(row) {
  if (!row) return null;
  const permissions = Array.isArray(row.permissions)
    ? row.permissions
    : (row.PermissionsCsv ?? row.permissionsCsv)
      ? (row.PermissionsCsv ?? row.permissionsCsv).split(',').filter(Boolean)
      : [];
  return {
    ...row,
    permissions,
  };
}

export async function getAllUsers() {
  const rows = await execProc('uspUsuarioObtenerTodos');
  return rows.map(mapUserRow);
}

export async function getUserById(userId) {
  const rows = await execProc('uspUsuarioObtenerPorId', { UserId: userId });
  return mapUserRow(rows[0]) ?? null;
}

export async function createUser({ username, displayName, roleCode, password, permissions }) {
  const credentials = hashPassword(password);
  const perms = Array.isArray(permissions) ? permissions : [];
  const inputs = {
    Username: username,
    DisplayName: displayName,
    RoleCode: roleCode,
    PasswordSalt: credentials.salt,
    PasswordHash: credentials.hash,
    PasswordIterations: credentials.iterations,
    MustChangePassword: 1,
    HasCustomPermissions: perms.length > 0 ? 1 : 0,
    Permissions: permissionsTvp(perms),
  };

  return execProc('uspUsuarioCrear', inputs);
}

export async function updateUser(userId, { displayName, roleCode, newPassword, permissions }) {
  const perms = Array.isArray(permissions) ? permissions : [];
  const inputs = {
    UserId: userId,
    DisplayName: displayName ?? undefined,
    NewRoleCode: roleCode ?? null,
    NewSalt: undefined,
    NewHash: undefined,
    NewIterations: undefined,
    MustChangePassword: undefined,
    HasCustomPermissions: Array.isArray(permissions) ? 1 : 0,
    Permissions: permissionsTvp(perms),
  };

  if (newPassword) {
    const credentials = hashPassword(newPassword);
    inputs.NewSalt = credentials.salt;
    inputs.NewHash = credentials.hash;
    inputs.NewIterations = credentials.iterations;
    inputs.MustChangePassword = 1;
  }

  return execProc('uspUsuarioActualizar', inputs);
}

export async function toggleUserDisabled(userId, disabled) {
  return execProc('uspUsuarioAlternarDeshabilitado', { UserId: userId, Disabled: Boolean(disabled) });
}
