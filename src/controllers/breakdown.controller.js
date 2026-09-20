import asyncHandler from '../utils/asyncHandler.js';
import * as breakdownService from '../services/breakdown.service.js';

export const listBreakdownReports = asyncHandler(async (req, res) => {
  res.json(await breakdownService.getAllBreakdownReports(req.query));
});

export const listOpenBreakdownReports = asyncHandler(async (_req, res) => {
  res.json(await breakdownService.getOpenBreakdownReports());
});

export const listMyBreakdownReports = asyncHandler(async (req, res) => {
  res.json(await breakdownService.getBreakdownReportsByUser(req.user.userId));
});

export const createBreakdownReport = asyncHandler(async (req, res) => {
  const result = await breakdownService.createBreakdownReport(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const linkToWorkOrder = asyncHandler(async (req, res) => {
  await breakdownService.linkBreakdownReportToWorkOrder(
    Number(req.params.id),
    String(req.body.workOrderId),
    req.user,
  );
  res.json({ message: 'Avería vinculada a la OT correctamente.' });
});

export const resolveBreakdownReport = asyncHandler(async (req, res) => {
  await breakdownService.resolveBreakdownReport(Number(req.params.id), req.user);
  res.json({ message: 'Avería marcada como atendida.' });
});

export const rejectBreakdownReport = asyncHandler(async (req, res) => {
  await breakdownService.rejectBreakdownReport(
    Number(req.params.id),
    req.body?.reason,
    req.user,
  );
  res.json({ message: 'Reporte de avería rechazado.' });
});
