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
  const [
    rolesRows = [],
    permissionsRows = [],
    rolePermRows = [],
    positionsRows = [],
    unitsRows = [],
    attributesRows = [],
    brandsRows = [],
  ] = Array.isArray(result) && Array.isArray(result[0])
    ? result
    : [result, [], [], [], [], [], []];

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
    unitsOfMeasure: unitsRows.map((u) => ({
      id: u.id ?? u.UnidadMedidaId,
      code: u.code ?? u.Codigo,
      name: u.name ?? u.Nombre,
    })),
    attributeCatalog: attributesRows.map((a) => ({
      id: a.id ?? a.AtributoId,
      name: a.name ?? a.Nombre,
      description: a.description ?? a.Descripcion,
      defaultUnitId: a.defaultUnitId ?? a.UnidadMedidaIdDefecto,
      defaultUnitCode: a.defaultUnitCode,
    })),
    brands: brandsRows.map((b) => ({
      id: b.id ?? b.MarcaId,
      name: b.name ?? b.Nombre,
      description: b.description ?? b.Descripcion,
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

// ----------------------------------------------------------------------------
// Catálogo de Unidades de Medida
// ----------------------------------------------------------------------------
export async function listUnitsOfMeasure(includeInactive = false) {
  const rows = await execProc('uspUnidadMedidaListar', { IncludeInactive: includeInactive ? 1 : 0 });
  return rows.map((u) => ({
    id: u.id ?? u.UnidadMedidaId,
    code: u.code ?? u.Codigo,
    name: u.name ?? u.Nombre,
    isActive: Boolean(u.isActive ?? u.Activo),
  }));
}

export async function createUnitOfMeasure({ code, name }) {
  const rows = await execProc('uspUnidadMedidaCrear', { Codigo: code, Nombre: name });
  const row = rows[0] ?? {};
  return {
    id: row.id ?? row.UnidadMedidaId,
    code: row.code ?? row.Codigo,
    name: row.name ?? row.Nombre,
    isActive: Boolean(row.isActive ?? row.Activo),
  };
}

export async function updateUnitOfMeasure(id, { code, name, isActive = true }) {
  const rows = await execProc('uspUnidadMedidaActualizar', {
    UnidadMedidaId: parseInt(id, 10),
    Codigo: code,
    Nombre: name,
    Activo: isActive ? 1 : 0,
  });
  const row = rows[0] ?? {};
  return {
    id: row.id ?? row.UnidadMedidaId,
    code: row.code ?? row.Codigo,
    name: row.name ?? row.Nombre,
    isActive: Boolean(row.isActive ?? row.Activo),
  };
}

export async function deleteUnitOfMeasure(id) {
  const rows = await execProc('uspUnidadMedidaEliminar', { UnidadMedidaId: parseInt(id, 10) });
  return rows[0] ?? { success: 1 };
}

// ----------------------------------------------------------------------------
// Catálogo de Atributos de Activos
// ----------------------------------------------------------------------------
export async function listAttributeCatalog(includeInactive = false) {
  const rows = await execProc('uspAtributoCatalogoListar', { IncludeInactive: includeInactive ? 1 : 0 });
  return rows.map((a) => ({
    id: a.id ?? a.AtributoId,
    name: a.name ?? a.Nombre,
    description: a.description ?? a.Descripcion,
    defaultUnitId: a.defaultUnitId ?? a.UnidadMedidaIdDefecto,
    defaultUnitCode: a.defaultUnitCode,
    defaultUnitName: a.defaultUnitName,
    isActive: Boolean(a.isActive ?? a.Activo),
  }));
}

export async function createAttributeCatalog({ name, description = null, defaultUnitId = null }) {
  const rows = await execProc('uspAtributoCatalogoCrear', {
    Nombre: name,
    Descripcion: description,
    UnidadMedidaIdDefecto: defaultUnitId ? parseInt(defaultUnitId, 10) : null,
  });
  const row = rows[0] ?? {};
  return {
    id: row.id ?? row.AtributoId,
    name: row.name ?? row.Nombre,
    description: row.description ?? row.Descripcion,
    defaultUnitId: row.defaultUnitId ?? row.UnidadMedidaIdDefecto,
    defaultUnitCode: row.defaultUnitCode,
    isActive: Boolean(row.isActive ?? row.Activo),
  };
}

export async function updateAttributeCatalog(id, { name, description = null, defaultUnitId = null, isActive = true }) {
  const rows = await execProc('uspAtributoCatalogoActualizar', {
    AtributoId: parseInt(id, 10),
    Nombre: name,
    Descripcion: description,
    UnidadMedidaIdDefecto: defaultUnitId ? parseInt(defaultUnitId, 10) : null,
    Activo: isActive ? 1 : 0,
  });
  const row = rows[0] ?? {};
  return {
    id: row.id ?? row.AtributoId,
    name: row.name ?? row.Nombre,
    description: row.description ?? row.Descripcion,
    defaultUnitId: row.defaultUnitId ?? row.UnidadMedidaIdDefecto,
    defaultUnitCode: row.defaultUnitCode,
    isActive: Boolean(row.isActive ?? row.Activo),
  };
}

export async function deleteAttributeCatalog(id) {
  const rows = await execProc('uspAtributoCatalogoEliminar', { AtributoId: parseInt(id, 10) });
  return rows[0] ?? { success: 1 };
}

// ----------------------------------------------------------------------------
// Catálogo de Marcas
// ----------------------------------------------------------------------------
export async function listBrands(includeInactive = false) {
  const rows = await execProc('uspMarcaListar', { IncludeInactive: includeInactive ? 1 : 0 });
  return rows.map((b) => ({
    id: b.id ?? b.MarcaId,
    name: b.name ?? b.Nombre,
    description: b.description ?? b.Descripcion,
    isActive: Boolean(b.isActive ?? b.Activo),
    totalAssetsAssociated: b.TotalActivosAsociados ?? 0,
  }));
}

export async function createBrand({ name, description = null }) {
  const rows = await execProc('uspMarcaCrear', {
    Nombre: name,
    Descripcion: description,
  });
  const row = rows[0] ?? {};
  return {
    id: row.id ?? row.MarcaId,
    name: row.name ?? row.Nombre,
    description: row.description ?? row.Descripcion,
    isActive: Boolean(row.isActive ?? row.Activo),
  };
}

export async function updateBrand(id, { name, description = null, isActive = true }) {
  const rows = await execProc('uspMarcaActualizar', {
    MarcaId: parseInt(id, 10),
    Nombre: name,
    Descripcion: description,
    Activo: isActive ? 1 : 0,
  });
  const row = rows[0] ?? {};
  return {
    id: row.id ?? row.MarcaId,
    name: row.name ?? row.Nombre,
    description: row.description ?? row.Descripcion,
    isActive: Boolean(row.isActive ?? row.Activo),
  };
}

export async function deleteBrand(id) {
  const rows = await execProc('uspMarcaEliminar', { MarcaId: parseInt(id, 10) });
  return rows[0] ?? { success: 1 };
}
