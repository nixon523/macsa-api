import { execProc, typed, sql } from '../config/db.js';

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getAllBreakdownReports({ status, startDate, endDate } = {}) {
  return execProc('uspReporteAveriaObtenerTodos', {
    StatusFilter: status || null,
    StartDate: typed(sql.DateTime2, toDateOrNull(startDate)),
    EndDate: typed(sql.DateTime2, toDateOrNull(endDate)),
  });
}

export async function getOpenBreakdownReports() {
  return execProc('uspReporteAveriaObtenerAbiertos');
}

export async function getBreakdownReportsByUser(userId) {
  return execProc('uspReporteAveriaObtenerPorUsuario', { ReporterUserId: userId });
}

export async function createBreakdownReport(payload, user) {
  return execProc('uspReporteAveriaCrear', {
    AssetCode: payload.assetCode,
    AssetName: payload.assetName,
    AreaId: payload.areaId,
    Description: payload.description,
    Severity: payload.severity,
    ReporterUserId: user.userId,
    ReporterUserName: user.displayName,
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
