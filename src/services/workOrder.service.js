import { execProc, buildTvp, typed, sql } from '../config/db.js';

const MATERIAL_COLUMNS = [
  { name: 'LineNum', type: sql.Int },
  { name: 'Description', type: sql.NVarChar(200) },
  { name: 'Quantity', type: sql.Decimal(10, 2) },
  { name: 'Unit', type: sql.NVarChar(10) },
];

const WORK_TYPE_COLUMNS = [{ name: 'Value', type: sql.NVarChar(30) }];

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function materialsTvp(materials = []) {
  const rows = materials.map((material, index) => ({
    LineNum: material.lineNum ?? index + 1,
    Description: material.description ?? material.name ?? null,
    Quantity: material.quantity ?? null,
    Unit: material.unit ?? null,
  }));
  return buildTvp('TipoMaterialOrdenTrabajo', MATERIAL_COLUMNS, rows);
}

function workTypesTvp(workTypes = []) {
  const rows = workTypes.map((value) => ({ Value: value }));
  return buildTvp('TipoListaTexto', WORK_TYPE_COLUMNS, rows);
}

export async function getAllWorkOrders({ status, area } = {}) {
  return execProc('uspOrdenTrabajoObtenerTodas', {
    StatusFilter: status || null,
    AreaFilter: area || null,
  });
}

export async function getOpenWorkOrders() {
  return execProc('uspOrdenTrabajoObtenerAbiertas');
}

export async function createWorkOrder(payload, user) {
  return execProc('uspOrdenTrabajoCrear', {
    AssetCode: payload.assetCode,
    AssetName: payload.assetName,
    AreaId: payload.areaId,
    AreaName: payload.areaName,
    Description: payload.description,
    Priority: payload.priority,
    AssignedTo: payload.assignedTo ?? null,
    AssignedStaffCount: payload.assignedStaffCount ?? null,
    EstimatedHours: payload.estimatedHours ?? null,
    ScheduledDate: typed(sql.DateTime2, toDateOrNull(payload.scheduledDate)),
    ReportId: payload.reportId ?? null,
    CreatedByUserId: user.userId,
    CreatedByUserName: user.displayName,
    Materials: materialsTvp(payload.materials),
    WorkTypes: workTypesTvp(payload.workTypes),
  });
}

export async function updateWorkOrderStatus(workOrderId, newStatus, user) {
  return execProc('uspOrdenTrabajoActualizarEstado', {
    WorkOrderId: workOrderId,
    NewStatus: newStatus,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function updateWorkOrderDetails(workOrderId, payload, user) {
  return execProc('uspOrdenTrabajoActualizarDetalles', {
    WorkOrderId: workOrderId,
    Description: payload.description ?? null,
    Priority: payload.priority ?? null,
    AssignedTo: payload.assignedTo ?? null,
    AssignedStaffCount: payload.assignedStaffCount ?? null,
    EstimatedHours: payload.estimatedHours ?? null,
    ActualHours: payload.actualHours ?? null,
    WorkDoneDescription: payload.workDoneDescription ?? null,
    IsCompleted: typeof payload.isCompleted === 'boolean' ? payload.isCompleted : null,
    UnfulfillmentReason: payload.unfulfillmentReason ?? null,
    ReprogramDate: typed(sql.DateTime2, toDateOrNull(payload.reprogramDate)),
    AccHaccpResponsible: payload.accHaccpResponsible ?? null,
    MaintenanceResponsible: payload.maintenanceResponsible ?? null,
    ScheduledDate: typed(sql.DateTime2, toDateOrNull(payload.scheduledDate)),
    UserId: user.userId,
    UserName: user.displayName,
    Materials: payload.materials ? materialsTvp(payload.materials) : materialsTvp([]),
    WorkTypes: payload.workTypes ? workTypesTvp(payload.workTypes) : workTypesTvp([]),
  });
}
