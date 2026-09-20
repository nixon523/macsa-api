import { execProc } from '../config/db.js';

export async function getAllAreas() {
  return execProc('uspAreaObtenerTodas');
}

export async function createArea({ areaId, name, costCenter }, user = {}) {
  return execProc('uspAreaCrear', {
    AreaId: areaId || null,
    Name: name,
    CostCenter: costCenter,
    UserId: user.userId || null,
    UserName: user.displayName || user.username || '',
  });
}

export async function updateArea(areaId, { name, costCenter }, user = {}) {
  return execProc('uspAreaActualizar', {
    AreaId: areaId,
    Name: name,
    CostCenter: costCenter || null,
    UserId: user.userId || null,
    UserName: user.displayName || user.username || '',
  });
}

export async function deleteArea(areaId, user = {}) {
  return execProc('uspAreaEliminar', {
    AreaId: areaId,
    UserId: user.userId || null,
    UserName: user.displayName || user.username || '',
  });
}
