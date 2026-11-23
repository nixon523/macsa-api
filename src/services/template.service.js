import { execProc } from '../config/db.js';

export async function listTemplates(includeInactive = false) {
  return execProc('uspPlantillaActivoListar', {
    IncludeInactive: includeInactive ? 1 : 0,
  });
}

export async function getTemplateDetail(templateId) {
  const result = await execProc('uspPlantillaActivoObtenerDetalle', {
    PlantillaId: Number(templateId),
  });
  // Si sql.js retorna múltiples recordsets o arreglo
  if (Array.isArray(result)) {
    // Si es un arreglo simple de filas, la primera es el header y el resto nodos, o si es agrupado
    // execProc retorna las filas del primer SELECT o concatenado
    return result;
  }
  return result;
}

export async function saveTemplateFromAsset(sourceAssetCode, { name, description }, user) {
  const rows = await execProc('uspPlantillaActivoGuardarDesdeActivo', {
    CodigoActivoOrigen: sourceAssetCode,
    NombrePlantilla: name,
    Descripcion: description ?? null,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
  return rows[0] ?? { success: true };
}

export async function instantiateTemplate(templateId, { targetAreaId, newRootName, newSerial, observations, copyAttributes }, user) {
  const rows = await execProc('uspPlantillaActivoInstanciar', {
    PlantillaId: Number(templateId),
    AreaDestinoId: targetAreaId,
    NuevoNombreRaiz: newRootName || null,
    NuevoSerialRaiz: newSerial || null,
    Observaciones: observations || null,
    CopiarAtributos: copyAttributes !== false ? 1 : 0,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
  return rows[0] ?? { success: true };
}

export async function deleteTemplate(templateId, user) {
  const rows = await execProc('uspPlantillaActivoEliminar', {
    PlantillaId: Number(templateId),
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
  return rows[0] ?? { success: true };
}
