import { execProc, buildTvp, typed, sql } from '../config/db.js';
import { parsePagination } from '../utils/pagination.js';

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

export async function getAllWorkOrders(query = {}) {
  const { status, area } = query;
  const { limit, offset } = parsePagination(query);
  return execProc('uspOrdenTrabajoObtenerTodas', {
    StatusFilter: status || null,
    AreaFilter: area || null,
    Limit: limit,
    Offset: offset,
  });
}

export async function getOpenWorkOrders() {
  return execProc('uspOrdenTrabajoObtenerAbiertas');
}

export async function createWorkOrder(payload, user) {
  return execProc('uspOrdenTrabajoCrear', {
    AssetCode: payload.assetCode ? payload.assetCode.trim() : null,
    AssetName: payload.assetName ? payload.assetName.trim() : null,
    AreaId: payload.areaId ? payload.areaId.trim() : null,
    AreaName: payload.areaName ? payload.areaName.trim() : null,
    Description: payload.description,
    Priority: payload.priority || 'medium',
    AssignedTo: payload.assignedTo ?? null,
    AssignedStaffCount: payload.assignedStaffCount ?? null,
    EstimatedHours: payload.estimatedHours ?? null,
    ScheduledDate: typed(sql.DateTime2, toDateOrNull(payload.scheduledDate)),
    ReportId: payload.reportId ?? null,
    CreatedByUserId: user.userId,
    CreatedByUserName: user.username || user.displayName || 'SISTEMA',
    Materials: materialsTvp(payload.materials),
    WorkTypes: workTypesTvp(payload.workTypes),
  });
}

export async function updateWorkOrderStatus(workOrderId, newStatus, user, extra = {}) {
  return execProc('uspOrdenTrabajoActualizarEstado', {
    WorkOrderId: workOrderId,
    NewStatus: newStatus,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
    MotivoPausa: extra.motivoPausa || extra.pauseReason || null,
    MotivoReprogramacion: extra.motivoReprogramacion || extra.unfulfillmentReason || null,
    FechaReprogramacion: typed(sql.DateTime2, toDateOrNull(extra.fechaReprogramacion || extra.reprogramDate)),
    HorasReales: extra.horasReales != null ? Number(extra.horasReales) : null,
    TrabajoRealizado: extra.trabajoRealizado || extra.workDoneDescription || null,
    Observaciones: extra.observaciones || null,
  });
}

export async function updateWorkOrderDetails(workOrderId, payload, user) {
  // Calculo automatico del personal asignado si se proporcionan nombres
  let staffCount = payload.assignedStaffCount ?? null;
  if (staffCount == null && payload.assignedTo && typeof payload.assignedTo === 'string') {
    const list = payload.assignedTo.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) {
      staffCount = list.length;
    }
  }

  return execProc('uspOrdenTrabajoActualizarDetalles', {
    WorkOrderId: workOrderId,
    Description: payload.description ?? null,
    Priority: payload.priority ?? null,
    AssignedTo: payload.assignedTo ?? null,
    AssignedStaffCount: staffCount,
    EstimatedHours: payload.estimatedHours ?? null,
    ActualHours: payload.actualHours ?? null,
    WorkDoneDescription: payload.workDoneDescription ?? null,
    IsCompleted: typeof payload.isCompleted === 'boolean' ? payload.isCompleted : null,
    UnfulfillmentReason: payload.unfulfillmentReason ?? null,
    ReprogramDate: typed(sql.DateTime2, toDateOrNull(payload.reprogramDate)),
    AccHaccpResponsible: payload.accHaccpResponsible ?? null,
    MaintenanceResponsible: payload.maintenanceResponsible ?? null,
    ResponsableJefeArea: payload.areaHeadResponsible ?? payload.responsableJefeArea ?? null,
    ResponsableJefeMantenimiento: payload.maintenanceHeadResponsible ?? payload.responsableJefeMantenimiento ?? null,
    ScheduledDate: typed(sql.DateTime2, toDateOrNull(payload.scheduledDate)),
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
    Materials: payload.materials ? materialsTvp(payload.materials) : materialsTvp([]),
    WorkTypes: payload.workTypes ? workTypesTvp(payload.workTypes) : workTypesTvp([]),
  });
}
