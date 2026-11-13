import { execProc } from '../config/db.js';
import { parsePagination } from '../utils/pagination.js';

export async function getEmployees({ onlyActive = true, isMaintenance = null, areaId = null, searchQuery = null, limit = null, offset = 0 } = {}) {
  return execProc('uspEmpleadoListar', {
    SoloActivos: onlyActive ? 1 : 0,
    EsMantenimiento: isMaintenance !== null && isMaintenance !== undefined ? (isMaintenance ? 1 : 0) : null,
    AreaId: areaId || null,
    Busqueda: searchQuery || null,
    Limit: limit,
    Offset: offset,
  });
}

export async function createEmployee(payload, user) {
  const positionId = payload.positionId ?? payload.puestoId ?? null;
  return execProc('uspEmpleadoCrear', {
    NombreCompleto: payload.fullName,
    AreaId: payload.areaId || null,
    Puesto: payload.position ?? null,
    PuestoId: positionId !== null && positionId !== '' ? Number(positionId) : null,
    EsMantenimiento: payload.isMaintenance !== false ? 1 : 0,
    UsuarioId: user.userId,
    NombreUsuario: user.displayName,
  });
}

export async function updateEmployee(employeeId, payload, user) {
  const positionId = payload.positionId ?? payload.puestoId ?? null;
  return execProc('uspEmpleadoActualizar', {
    EmpleadoId: Number(employeeId),
    NombreCompleto: payload.fullName,
    AreaId: payload.areaId || null,
    Puesto: payload.position ?? null,
    PuestoId: positionId !== null && positionId !== '' ? Number(positionId) : null,
    EsMantenimiento: payload.isMaintenance !== false ? 1 : 0,
    Activo: payload.isActive !== false ? 1 : 0,
    UsuarioId: user.userId,
    NombreUsuario: user.displayName,
  });
}

export async function toggleEmployeeStatus(employeeId, active, user) {
  return execProc('uspEmpleadoCambiarEstado', {
    EmpleadoId: Number(employeeId),
    Activo: active ? 1 : 0,
    UsuarioId: user.userId,
    NombreUsuario: user.displayName,
  });
}

// ----------------------------------------------------------------------------
// Catálogo de Puestos / Cargos
// ----------------------------------------------------------------------------
export async function getPositions({ onlyActive = true } = {}) {
  return execProc('uspPuestoListar', {
    SoloActivos: onlyActive ? 1 : 0,
  });
}

export async function createPosition(payload, user) {
  return execProc('uspPuestoCrear', {
    Nombre: payload.name || payload.nombre,
    EsMantenimiento: payload.isMaintenance !== false ? 1 : 0,
    UsuarioId: user.userId,
    NombreUsuario: user.displayName,
  });
}

export async function updatePosition(positionId, payload, user) {
  return execProc('uspPuestoActualizar', {
    PuestoId: Number(positionId),
    Nombre: payload.name || payload.nombre,
    EsMantenimiento: payload.isMaintenance !== false ? 1 : 0,
    UsuarioId: user.userId,
    NombreUsuario: user.displayName,
  });
}

export async function deletePosition(positionId, user) {
  return execProc('uspPuestoEliminar', {
    PuestoId: Number(positionId),
    UsuarioId: user.userId,
    NombreUsuario: user.displayName,
  });
}
