import asyncHandler from '../utils/asyncHandler.js';
import * as assetService from '../services/asset.service.js';
import { ApiError } from '../utils/ApiError.js';

export const listAssetsByParent = asyncHandler(async (req, res) => {
  const parent = req.query.parent || req.query.parentAssetCode || req.query.parentAssetId || null;
  const areaId = req.query.areaId || req.query.area || null;
  res.json(await assetService.getAssetsByParent(parent, areaId));
});

export const listAssetsByArea = asyncHandler(async (req, res) => {
  const includeAll = req.query.all === 'true' || req.query.includeChildren === 'true';
  res.json(await assetService.getAssetsByArea(req.params.areaId, includeAll));
});

export const searchAssets = asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  const areaId = req.query.areaId || req.query.area || null;
  const status = req.query.status || null;
  res.json(await assetService.searchAssets(query.trim(), areaId, status));
});

export const findBySerial = asyncHandler(async (req, res) => {
  const asset = await assetService.findAssetBySerial(req.params.serial);
  if (!asset) {
    throw ApiError.notFound('No se encontro un activo con ese numero de serie.');
  }
  res.json(asset);
});

export const createAsset = asyncHandler(async (req, res) => {
  const result = await assetService.createAsset(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const updateAsset = asyncHandler(async (req, res) => {
  await assetService.updateAsset(req.params.assetCode, req.body, req.user);
  res.json({ message: 'Activo actualizado correctamente.' });
});

export const transferAsset = asyncHandler(async (req, res) => {
  const { targetAreaId } = req.body;
  const result = await assetService.transferAsset(req.params.assetCode, targetAreaId, req.user);
  res.json({
    message: 'Traspaso realizado correctamente.',
    ...(result[0] ?? {}),
  });
});

export const reactivateAsset = asyncHandler(async (req, res) => {
  await assetService.reactivateAsset(req.params.assetCode, req.user);
  res.json({ message: 'Activo reactivado correctamente.' });
});

export const toggleAssetStatus = asyncHandler(async (req, res) => {
  await assetService.toggleAssetStatus(req.params.assetCode, req.body, req.user);
  res.json({ message: 'Estado del activo actualizado correctamente.' });
});
