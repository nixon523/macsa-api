import asyncHandler from '../utils/asyncHandler.js';
import * as workOrderService from '../services/workOrder.service.js';

export const listWorkOrders = asyncHandler(async (req, res) => {
  res.json(await workOrderService.getAllWorkOrders(req.query));
});

export const listOpenWorkOrders = asyncHandler(async (_req, res) => {
  res.json(await workOrderService.getOpenWorkOrders());
});

export const createWorkOrder = asyncHandler(async (req, res) => {
  const result = await workOrderService.createWorkOrder(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const updateWorkOrderStatus = asyncHandler(async (req, res) => {
  await workOrderService.updateWorkOrderStatus(
    Number(req.params.id),
    req.body.newStatus,
    req.user,
  );
  res.json({ message: 'Estado de la OT actualizado correctamente.' });
});

export const updateWorkOrderDetails = asyncHandler(async (req, res) => {
  await workOrderService.updateWorkOrderDetails(Number(req.params.id), req.body, req.user);
  res.json({ message: 'OT actualizada correctamente.' });
});
