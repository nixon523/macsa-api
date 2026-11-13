import asyncHandler from '../utils/asyncHandler.js';
import * as catalogService from '../services/catalog.service.js';

export const getCatalogs = asyncHandler(async (_req, res) => {
  const catalogs = await catalogService.getDynamicCatalogs();
  res.json(catalogs);
});
