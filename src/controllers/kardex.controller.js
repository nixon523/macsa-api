import asyncHandler from '../utils/asyncHandler.js';
import * as kardexService from '../services/kardex.service.js';

export const listKardexLogs = asyncHandler(async (req, res) => {
  res.json(await kardexService.getAllKardexLogs(req.query));
});

export const listByEntity = asyncHandler(async (req, res) => {
  res.json(await kardexService.getKardexLogsByEntity(req.params.entityId));
});

export const appendKardexLog = asyncHandler(async (req, res) => {
  const result = await kardexService.appendKardexLog(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});
