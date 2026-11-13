import { execProc, typed, sql } from '../config/db.js';
import { parsePagination } from '../utils/pagination.js';

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getAllBreakdownReports(query = {}) {
  const { status, startDate, endDate } = query;
  const { limit, offset } = parsePagination(query);
  return execProc('uspReporteAveriaObtenerTodos', {
    StatusFilter: status || null,
    StartDate: typed(sql.DateTime2, toDateOrNull(startDate)),
    EndDate: typed(sql.DateTime2, toDateOrNull(endDate)),
    Limit: limit,
    Offset: offset,
  });
}

export async function getOpenBreakdownReports() {
  return execProc('uspReporteAveriaObtenerAbiertos');
}

export async function getBreakdownReportsByUser(userId) {
  return execProc('uspReporteAveriaObtenerPorUsuario', { ReporterUserId: userId });
}

export async function createBreakdownReport(payload, user) {
  const image =
    payload.imageData ||
    payload.imagenUrl ||
    payload.imageUrl ||
    payload.imagen ||
    null;

  return execProc('uspReporteAveriaCrear', {
    AssetCode: payload.assetCode,
    AssetName: payload.assetName,
    AreaId: payload.areaId,
    Description: payload.description,
    Severity: payload.severity,
    ReporterUserId: user.userId,
    ReporterUserName: user.displayName,
    ImageData: image ? typed(sql.NVarChar(sql.MAX), image) : null,
  });
}

export async function linkBreakdownReportToWorkOrder(reportId, workOrderId, user) {
  return execProc('uspReporteAveriaVincularOrdenTrabajo', {
    ReportId: reportId,
    WorkOrderId: workOrderId,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function resolveBreakdownReport(reportId, user) {
  return execProc('uspReporteAveriaResolver', {
    ReportId: reportId,
    ResolvedByUserId: user.userId,
    ResolvedByUserName: user.displayName,
  });
}

export async function rejectBreakdownReport(reportId, reason, user) {
  return execProc('uspReporteAveriaRechazar', {
    ReportId: reportId,
    Reason: reason ?? null,
    RejectedByUserId: user.userId,
    RejectedByUserName: user.displayName,
  });
}
