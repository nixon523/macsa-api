import { Router } from 'express';
import { body } from 'express-validator';

import * as workOrderController from '../controllers/workOrder.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS, WORK_ORDER_PRIORITIES, WORK_ORDER_STATUSES } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.workOrderView), workOrderController.listWorkOrders);
router.get('/abiertas', requirePermission(PERMISSIONS.workOrderView), workOrderController.listOpenWorkOrders);
router.get('/open', requirePermission(PERMISSIONS.workOrderView), workOrderController.listOpenWorkOrders);

const materialRules = body('materials').optional().isArray().custom((materials) => {
  for (const material of materials ?? []) {
    if (!material.description || !Number.isFinite(Number(material.quantity))) {
      throw new Error('Cada material requiere description y quantity numérico.');
    }
  }
  return true;
});

router.post(
  '/',
  requirePermission(PERMISSIONS.workOrderCreate),
  body('assetName').isString().trim().notEmpty().withMessage('El nombre del activo es obligatorio.'),
  body('description').isString().trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('priority').optional().isIn(WORK_ORDER_PRIORITIES),
  materialRules,
  handleValidationErrors,
  workOrderController.createWorkOrder,
);

const statusValidators = [
  requirePermission(PERMISSIONS.workOrderCreate),
  body('newStatus').isIn(WORK_ORDER_STATUSES).withMessage('Estado inválido.'),
  handleValidationErrors,
  workOrderController.updateWorkOrderStatus,
];
router.patch('/:id/estado', ...statusValidators);
router.patch('/:id/status', ...statusValidators);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.workOrderCreate),
  body('description').isString().trim().notEmpty(),
  body('priority').isIn(WORK_ORDER_PRIORITIES),
  materialRules,
  handleValidationErrors,
  workOrderController.updateWorkOrderDetails,
);

export default router;
