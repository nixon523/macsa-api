import asyncHandler from '../utils/asyncHandler.js';
import * as areaService from '../services/area.service.js';

export const listAreas = asyncHandler(async (_req, res) => {
  res.json(await areaService.getAllAreas());
});

export const createArea = asyncHandler(async (req, res) => {
  const result = await areaService.createArea(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const updateArea = asyncHandler(async (req, res) => {
  await areaService.updateArea(req.params.areaId, req.body, req.user);
  res.json({ message: 'Área actualizada correctamente.' });
});

export const deleteArea = asyncHandler(async (req, res) => {
  await areaService.deleteArea(req.params.areaId, req.user);
  res.json({ message: 'Área eliminada correctamente.' });
});
