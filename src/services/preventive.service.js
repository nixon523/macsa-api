import { execProc, buildTvp, typed, sql } from '../config/db.js';

const MATERIAL_COLUMNS = [
  { name: 'LineNum', type: sql.Int },
  { name: 'Name', type: sql.NVarChar(200) },
  { name: 'Quantity', type: sql.Decimal(10, 2) },
  { name: 'Unit', type: sql.NVarChar(10) },
];

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function materialsTvp(materials = []) {
  const rows = materials.map((material, index) => ({
    LineNum: material.lineNum ?? index + 1,
    Name: material.name ?? material.description ?? null,
    Quantity: material.quantity ?? null,
    Unit: material.unit ?? null,
  }));
  return buildTvp('TipoMaterialPreventivo', MATERIAL_COLUMNS, rows);
}

export async function getAllPreventiveSchedules({ area, status } = {}) {
  return execProc('uspPlanPreventivoObtenerTodos', {
    AreaFilter: area || null,
    StatusFilter: status || null,
  });
}

export async function createPreventiveSchedule(payload, user) {
  return execProc('uspPlanPreventivoCrear', {
    Title: payload.title,
    AssetCode: payload.assetCode,
    AssetName: payload.assetName,
    AreaId: payload.areaId,
    AreaName: payload.areaName,
    MaintenanceType: payload.maintenanceType,
    Frequency: payload.frequency,
    Description: payload.description ?? null,
    EstimatedHours: payload.estimatedHours ?? null,
    StartDate: typed(sql.DateTime2, toDateOrNull(payload.startDate)),
    NextDate: typed(sql.DateTime2, toDateOrNull(payload.nextDate)),
    LastCompleted: typed(sql.DateTime2, toDateOrNull(payload.lastCompleted)),
    LastWorkOrderId: payload.lastWorkOrderId || null,
    Status: payload.status ?? 'active',
    Notes: payload.notes ?? null,
    CreatedByUserId: user.userId,
    CreatedByUserName: user.displayName,
    Materials: materialsTvp(payload.materials),
  });
}

export async function amendPreventiveSchedule(scheduleId, payload, user) {
  return execProc('uspPlanPreventivoModificar', {
    ScheduleId: scheduleId,
    Title: payload.title,
    MaintenanceType: payload.maintenanceType ?? null,
    Frequency: payload.frequency ?? null,
    Description: payload.description ?? null,
    EstimatedHours: payload.estimatedHours ?? null,
    StartDate: typed(sql.DateTime2, toDateOrNull(payload.startDate)),
    NextDate: typed(sql.DateTime2, toDateOrNull(payload.nextDate)),
    Notes: payload.notes ?? null,
    AmendmentDocNumber: payload.amendmentDocNumber ?? null,
    AuthorizedByManager: Boolean(payload.authorizedByManager),
    AmendmentReason: payload.amendmentReason ?? null,
    UserId: user.userId,
    UserName: user.displayName,
    Materials: materialsTvp(payload.materials),
  });
}

export async function recordPreventiveExecution(scheduleId, workOrderId, user) {
  return execProc('uspPlanPreventivoRegistrarEjecucion', {
    ScheduleId: scheduleId,
    WorkOrderId: workOrderId,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function togglePreventiveScheduleStatus(scheduleId, payload, user) {
  return execProc('uspPlanPreventivoAlternarEstado', {
    ScheduleId: scheduleId,
    NewStatus: payload.newStatus,
    AmendmentDocNumber: payload.amendmentDocNumber ?? null,
    AuthorizedByManager: Boolean(payload.authorizedByManager),
    Reason: payload.reason ?? null,
    UserId: user.userId,
    UserName: user.displayName,
  });
}
