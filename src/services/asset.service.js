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

export async function searchAssets(query, areaId = null, status = null) {
  return execProc('uspActivoBuscar', { 
    Query: query || '',
    AreaId: areaId || null,
    Status: status || null,
  });
}

export async function findAssetBySerial(serial) {
  const rows = await execProc('uspActivoBuscarPorSerie', { Serial: serial });
  return rows[0] ?? null;
}

export async function createAsset(payload, user) {
  return execProc('uspActivoCrear', {
    Name: payload.name,
    Brand: payload.brand ?? null,
    Model: payload.model ?? null,
    AreaId: payload.areaId,
    StationId: payload.stationId ?? null,
    Level: payload.level,
    ParentAssetCode: payload.parentAssetCode || null,
    Status: payload.status ?? 'active',
    Serial: payload.serial || null,
    DynamicAttributes: payload.dynamicAttributes
      ? JSON.stringify(payload.dynamicAttributes)
      : null,
    ImageData: payload.imageData ?? null,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function updateAsset(assetCode, payload, user) {
  return execProc('uspActivoActualizar', {
    AssetCode: assetCode,
    Name: payload.name,
    Brand: payload.brand ?? null,
    Model: payload.model ?? null,
    StationId: payload.stationId ?? null,
    Status: payload.status,
    DynamicAttributes: payload.dynamicAttributes
      ? JSON.stringify(payload.dynamicAttributes)
      : null,
    ImageData: payload.imageData ?? null,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function transferAsset(assetCode, targetAreaId, user) {
  return execProc('uspActivoTraspasar', {
    SourceAssetCode: assetCode,
    TargetAreaId: targetAreaId,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function reactivateAsset(assetCode, user) {
  return execProc('uspActivoReactivar', {
    AssetCode: assetCode,
    UserId: user.userId,
    UserName: user.displayName,
  });
}

export async function toggleAssetStatus(assetCode, { newStatus, reason }, user) {
  return execProc('uspActivoAlternarEstado', {
    AssetCode: assetCode,
    NewStatus: newStatus,
    Reason: reason ?? null,
    UserId: user.userId,
    UserName: user.displayName,
  });
}
