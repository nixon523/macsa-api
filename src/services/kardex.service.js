import { execProc, typed, sql } from '../config/db.js';

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function appendKardexLog({ action, module, entityId, details }, user) {
  return execProc('uspKardexAgregar', {
    Action: action,
    Module: module,
    EntityId: entityId,
    Details: details ?? null,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function getAllKardexLogs({
  module,
  action,
  userId,
  startDate,
  endDate,
  limit = 200,
} = {}) {
  return execProc('uspKardexObtenerTodos', {
    ModuleFilter: module || null,
    ActionFilter: action || null,
    UserFilter: userId ?? null,
    StartDate: typed(sql.DateTime2, toDateOrNull(startDate)),
    EndDate: typed(sql.DateTime2, toDateOrNull(endDate)),
    Limit: limit,
  });
}

export async function getKardexLogsByEntity(entityId) {
  return execProc('uspKardexObtenerPorEntidad', { EntityId: entityId });
}
