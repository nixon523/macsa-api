import asyncHandler from '../utils/asyncHandler.js';
import * as templateService from '../services/template.service.js';
import { ApiError } from '../utils/ApiError.js';

export const listTemplates = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
  const templates = await templateService.listTemplates(includeInactive);
  res.json(templates);
});

export const getTemplateDetail = asyncHandler(async (req, res) => {
  const detail = await templateService.getTemplateDetail(req.params.id);
  res.json(detail);
});

export const saveTemplateFromAsset = asyncHandler(async (req, res) => {
  const { sourceAssetCode, name, description } = req.body;
  if (!sourceAssetCode || !name) {
    throw ApiError.badRequest('El código del activo de origen y el nombre de la plantilla son obligatorios.');
  }
  const result = await templateService.saveTemplateFromAsset(sourceAssetCode, { name, description }, req.user);
  res.status(201).json(result);
});

export const instantiateTemplate = asyncHandler(async (req, res) => {
  const { targetAreaId, newRootName, newSerial, observations, copyAttributes } = req.body;
  if (!targetAreaId) {
    throw ApiError.badRequest('El área de destino es obligatoria.');
  }
  const result = await templateService.instantiateTemplate(req.params.id, {
    targetAreaId,
    newRootName,
    newSerial,
    observations,
    copyAttributes,
  }, req.user);
  res.status(201).json(result);
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const result = await templateService.deleteTemplate(req.params.id, req.user);
  res.json(result);
});
