import asyncHandler from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboard.service.js';

export const getStats = asyncHandler(async (_req, res) => {
  res.json(await dashboardService.getDashboardStats());
});

export const getMaintenanceByCostCenter = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getMaintenanceByCostCenter(req.query));
});

export const getMaintenanceByCostCenterDetails = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getMaintenanceByCostCenterDetails(req.query));
});
