import { execProc } from '../config/db.js';

export async function getAssetsByParent(parentAssetCode, areaId = null) {
  return execProc('uspActivoObtenerHijos', { 
    ParentAssetCode: parentAssetCode || null,
    AreaId: areaId || null,
  });
}

export async function getAssetsByArea(areaId, includeAll = false) {
  if (includeAll) {
    return execProc('uspActivoBuscar', { AreaId: areaId, Query: '' });
  }
  return execProc('uspActivoObtenerRaicesPorArea', { AreaId: areaId });
}

export async function searchAssets(query, areaId = null, status = null, { limit = 200, offset = 0 } = {}) {
  return execProc('uspActivoBuscar', { 
    Query: query || '',
    AreaId: areaId || null,
    Status: status || null,
    Limit: limit ?? 200,
    Offset: offset ?? 0,
  });
}

export async function findAssetBySerial(serial) {
  const rows = await execProc('uspActivoBuscarPorSerie', { Serial: serial });
  return rows[0] ?? null;
}

export async function createAsset(payload, user) {
  const rows = await execProc('uspActivoCrear', {
    Name: payload.name,
    Brand: payload.brand ?? null,
    Model: payload.model ?? null,
    AreaId: payload.areaId,
    StationId: payload.stationId ?? '',
    Level: payload.level,
    ParentAssetCode: payload.parentAssetCode || null,
    Status: payload.status ?? 'active',
    Serial: payload.serial || null,
    DynamicAttributes: payload.dynamicAttributes
      ? JSON.stringify(payload.dynamicAttributes)
      : null,
    ImageData: payload.imageData ?? null,
    Observaciones: payload.observations ?? payload.observaciones ?? null,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
  const row = rows[0] ?? {};
  const code = row.CodigoActivo ?? row.codigoActivo ?? row.NewAssetCode ?? row.assetCode ?? '';
  return [{
    ...row,
    assetCode: code,
    CodigoActivo: code,
    newAssetCode: code,
    NewAssetCode: code,
  }];
}

export async function updateAsset(assetCode, payload, user) {
  return execProc('uspActivoActualizar', {
    AssetCode: assetCode,
    Name: payload.name,
    Brand: payload.brand ?? null,
    Model: payload.model ?? null,
    StationId: payload.stationId ?? null,
    Serial: payload.serial ?? null,
    Status: payload.status,
    DynamicAttributes: payload.dynamicAttributes
      ? JSON.stringify(payload.dynamicAttributes)
      : null,
    ImageData: payload.imageData ?? null,
    Observaciones: payload.observations ?? payload.observaciones ?? null,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
}

export async function cloneAssetTree(sourceAssetCode, { targetAreaId, newRootName, newSerial, observations, copyAttributes }, user) {
  return execProc('uspActivoClonarArbol', {
    CodigoActivoOrigen: sourceAssetCode,
    AreaDestinoId: targetAreaId,
    NuevoNombreRaiz: newRootName || null,
    NuevoSerialRaiz: newSerial || null,
    Observaciones: observations || null,
    CopiarAtributos: copyAttributes !== false ? 1 : 0,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
}

export async function transferAsset(assetCode, targetAreaId, user) {
  return execProc('uspActivoTraspasar', {
    SourceAssetCode: assetCode,
    TargetAreaId: targetAreaId,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
}

export async function reactivateAsset(assetCode, user) {
  return execProc('uspActivoReactivar', {
    AssetCode: assetCode,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
}

export async function toggleAssetStatus(assetCode, { newStatus, reason }, user) {
  return execProc('uspActivoAlternarEstado', {
    AssetCode: assetCode,
    NewStatus: newStatus,
    Reason: reason ?? null,
    UserId: user.userId,
    UserName: user.username || user.displayName || 'SISTEMA',
  });
}
