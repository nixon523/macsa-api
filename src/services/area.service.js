import { execProc } from '../config/db.js';

export async function getAllAreas() {
  return execProc('uspAreaObtenerTodas');
}

export async function createArea({ areaId, name, costCenter }) {
  return execProc('uspAreaCrear', {
    AreaId: areaId || null,
    Name: name,
    CostCenter: costCenter,
  });
}

export async function updateArea(areaId, { name, costCenter }) {
  return execProc('uspAreaActualizar', {
    AreaId: areaId,
    Name: name,
    CostCenter: costCenter,
  });
}
