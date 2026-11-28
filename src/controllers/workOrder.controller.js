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
  const row = result[0] ?? result ?? {};
  const woId = row.WorkOrderId || row.workOrderId || row.id || row.WorkOrderNumber || row.workOrderNumber || '';
  res.status(201).json({
    ...row,
    id: woId,
    workOrderId: woId,
    WorkOrderId: woId,
    workOrderNumber: woId,
    WorkOrderNumber: woId,
  });
});

export const updateWorkOrderStatus = asyncHandler(async (req, res) => {
  const { newStatus } = req.body;
  if (newStatus === 'completed') {
    const hasApprove =
      req.user.role === 'admin' ||
      req.user.role === 'jefe' ||
      (Array.isArray(req.user.permissions) && req.user.permissions.includes('work_order.approve'));
    if (!hasApprove) {
      return res.status(403).json({
        message: 'Solo el Jefe de Mantenimiento o un usuario con permiso de aprobación puede cerrar y aprobar la orden de trabajo.',
      });
    }
  }

  await workOrderService.updateWorkOrderStatus(
    req.params.id,
    newStatus,
    req.user,
    req.body,
  );
  res.json({ message: 'Estado de la OT actualizado correctamente.' });
});

export const updateWorkOrderDetails = asyncHandler(async (req, res) => {
  await workOrderService.updateWorkOrderDetails(req.params.id, req.body, req.user);
  res.json({ message: 'OT actualizada correctamente.' });
});
