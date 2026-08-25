import { execProc, typed, sql } from '../config/db.js';

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getPendingDeletionRequests({ startDate, endDate } = {}) {
  return execProc('uspSolicitudBajaObtenerPendientes', {
    StartDate: typed(sql.DateTime2, toDateOrNull(startDate)),
    EndDate: typed(sql.DateTime2, toDateOrNull(endDate)),
  });
}

export async function getAllDeletionRequests({ startDate, endDate } = {}) {
  return execProc('uspSolicitudBajaObtenerTodas', {
    StartDate: typed(sql.DateTime2, toDateOrNull(startDate)),
    EndDate: typed(sql.DateTime2, toDateOrNull(endDate)),
  });
}

export async function getPendingDeletionRequestsByAsset(assetCode) {
  return execProc('uspSolicitudBajaObtenerPendientePorActivo', { AssetCode: assetCode });
}

export async function createDeletionRequest({ assetCode, reason }, user) {
  return execProc('uspSolicitudBajaCrear', {
    AssetCode: assetCode,
    Reason: reason,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function approveDeletionRequest(requestId, reason, user) {
  return execProc('uspSolicitudBajaAprobar', {
    RequestId: requestId,
    ApproverUserId: user.userId,
    ApproverUserName: user.displayName,
    ApproveReason: reason ?? null,
  });
}

export async function rejectDeletionRequest(requestId, reason, user) {
  return execProc('uspSolicitudBajaRechazar', {
    RequestId: requestId,
    RejectedByUserId: user.userId,
    RejectedByUserName: user.displayName,
    RejectReason: reason ?? null,
  });
}
