import { execProc } from '../config/db.js';

export async function getDashboardStats() {
  const rows = await execProc('uspDashboardObtenerEstadisticas');
  return rows[0] ?? {};
}

export async function getMaintenanceByCostCenter(query = {}) {
  const { startDate, endDate, onlyWithMaintenance } = query;
  return execProc('uspReporteMantenimientosPorCentroCosto', {
    FechaInicio: startDate ? new Date(startDate) : null,
    FechaFin: endDate ? new Date(endDate) : null,
    SoloConMantenimiento: onlyWithMaintenance === 'true' || onlyWithMaintenance === '1' ? 1 : 0,
  });
}

export async function getMaintenanceByCostCenterDetails(query = {}) {
  const { costCenter, areaId, startDate, endDate } = query;
  return execProc('uspReporteMantenimientosPorCentroCostoDetalle', {
    CentroCosto: costCenter || null,
    AreaId: areaId || null,
    FechaInicio: startDate ? new Date(startDate) : null,
    FechaFin: endDate ? new Date(endDate) : null,
  });
}
