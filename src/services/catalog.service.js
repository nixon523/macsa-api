import { execProc } from '../config/db.js';
import {
  ASSET_LEVELS,
  ASSET_STATUSES,
  BREAKDOWN_SEVERITIES,
  BREAKDOWN_STATUSES,
  MAINTENANCE_TYPES,
  PREVENTIVE_FREQUENCIES_CATALOG,
  PREVENTIVE_STATUSES,
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
} from '../security/rolePermissions.js';

export async function getDynamicCatalogs() {
  const result = await execProc('uspCatalogosObtener');
  const [rolesRows = [], permissionsRows = [], rolePermRows = [], positionsRows = []] =
    Array.isArray(result) && Array.isArray(result[0]) ? result : [result, [], [], []];

  const rolePermissions = {};
  for (const row of rolePermRows) {
    const roleCode = row.CodigoRol;
    const permCode = row.CodigoPermiso;
    if (!rolePermissions[roleCode]) {
      rolePermissions[roleCode] = [];
    }
    rolePermissions[roleCode].push(permCode);
  }

  return {
    roles: rolesRows.map((r) => ({
      code: r.CodigoRol,
      name: r.Nombre,
      permissions: rolePermissions[r.CodigoRol] ?? [],
    })),
    permissions: permissionsRows.map((p) => p.CodigoPermiso),
    rolePermissions,
    positions: positionsRows.map((p) => ({
      id: p.PuestoId,
      name: p.Nombre,
      isMaintenance: Boolean(p.EsMantenimiento),
    })),
    enums: {
      assetLevels: ASSET_LEVELS,
      assetStatuses: ASSET_STATUSES,
      workOrderPriorities: WORK_ORDER_PRIORITIES,
      workOrderStatuses: WORK_ORDER_STATUSES,
      breakdownSeverities: BREAKDOWN_SEVERITIES,
      breakdownStatuses: BREAKDOWN_STATUSES,
      maintenanceTypes: MAINTENANCE_TYPES.filter((t) => /[A-ZÁÉÍÓÚ]/.test(t[0])),
      preventiveFrequencies: PREVENTIVE_FREQUENCIES_CATALOG,
      preventiveStatuses: PREVENTIVE_STATUSES,
    },
  };
}
