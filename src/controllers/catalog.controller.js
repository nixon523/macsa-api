import asyncHandler from '../utils/asyncHandler.js';
import * as catalogService from '../services/catalog.service.js';

export const getCatalogs = asyncHandler(async (_req, res) => {
  const catalogs = await catalogService.getDynamicCatalogs();
  res.json(catalogs);
});

// ----------------------------------------------------------------------------
// Controladores de Unidades de Medida
// ----------------------------------------------------------------------------
export const listUnitsOfMeasure = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
  const units = await catalogService.listUnitsOfMeasure(includeInactive);
  res.json(units);
});

export const createUnitOfMeasure = asyncHandler(async (req, res) => {
  const { code, name, codigo, nombre } = req.body;
  const unit = await catalogService.createUnitOfMeasure({
    code: (code ?? codigo ?? '').trim(),
    name: (name ?? nombre ?? '').trim(),
  });
  res.status(201).json(unit);
});

export const updateUnitOfMeasure = asyncHandler(async (req, res) => {
  const { code, name, codigo, nombre, isActive, activo } = req.body;
  const unit = await catalogService.updateUnitOfMeasure(req.params.id, {
    code: (code ?? codigo ?? '').trim(),
    name: (name ?? nombre ?? '').trim(),
    isActive: isActive !== undefined ? Boolean(isActive) : activo !== undefined ? Boolean(activo) : true,
  });
  res.json(unit);
});

export const deleteUnitOfMeasure = asyncHandler(async (req, res) => {
  const result = await catalogService.deleteUnitOfMeasure(req.params.id);
  res.json(result);
});

// ----------------------------------------------------------------------------
// Controladores de Atributos de Catálogo
// ----------------------------------------------------------------------------
export const listAttributeCatalog = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
  const attributes = await catalogService.listAttributeCatalog(includeInactive);
  res.json(attributes);
});

export const createAttributeCatalog = asyncHandler(async (req, res) => {
  const { name, description, defaultUnitId, nombre, descripcion } = req.body;
  const attribute = await catalogService.createAttributeCatalog({
    name: (name ?? nombre ?? '').trim(),
    description: description ?? descripcion ?? null,
    defaultUnitId: defaultUnitId ?? null,
  });
  res.status(201).json(attribute);
});

export const updateAttributeCatalog = asyncHandler(async (req, res) => {
  const { name, description, defaultUnitId, nombre, descripcion, isActive, activo } = req.body;
  const attribute = await catalogService.updateAttributeCatalog(req.params.id, {
    name: (name ?? nombre ?? '').trim(),
    description: description ?? descripcion ?? null,
    defaultUnitId: defaultUnitId ?? null,
    isActive: isActive !== undefined ? Boolean(isActive) : activo !== undefined ? Boolean(activo) : true,
  });
  res.json(attribute);
});

export const deleteAttributeCatalog = asyncHandler(async (req, res) => {
  const result = await catalogService.deleteAttributeCatalog(req.params.id);
  res.json(result);
});

// ----------------------------------------------------------------------------
// Controladores de Marcas de Activos
// ----------------------------------------------------------------------------
export const listBrands = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
  const brands = await catalogService.listBrands(includeInactive);
  res.json(brands);
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, nombre, descripcion } = req.body;
  const brand = await catalogService.createBrand({
    name: (name ?? nombre ?? '').trim(),
    description: description ?? descripcion ?? null,
  });
  res.status(201).json(brand);
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { name, description, nombre, descripcion, isActive, activo } = req.body;
  const brand = await catalogService.updateBrand(req.params.id, {
    name: (name ?? nombre ?? '').trim(),
    description: description ?? descripcion ?? null,
    isActive: isActive !== undefined ? Boolean(isActive) : activo !== undefined ? Boolean(activo) : true,
  });
  res.json(brand);
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const result = await catalogService.deleteBrand(req.params.id);
  res.json(result);
});
