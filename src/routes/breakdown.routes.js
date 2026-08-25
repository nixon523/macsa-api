import { Router } from 'express';
import { body } from 'express-validator';

import * as breakdownController from '../controllers/breakdown.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS, BREAKDOWN_SEVERITIES } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.breakdownView), breakdownController.listBreakdownReports);
router.get('/abiertos', requirePermission(PERMISSIONS.breakdownView), breakdownController.listOpenBreakdownReports);
router.get('/open', requirePermission(PERMISSIONS.breakdownView), breakdownController.listOpenBreakdownReports);
router.get('/mis-reportes', breakdownController.listMyBreakdownReports);
router.get('/mine', breakdownController.listMyBreakdownReports);

router.post(
  '/',
  requirePermission(PERMISSIONS.breakdownReport),
  body('assetCode').isString().trim().notEmpty().withMessage('El activo es obligatorio.'),
  body('assetName').isString().trim().notEmpty().withMessage('El nombre del activo es obligatorio.'),
  body('areaId').isString().trim().notEmpty().withMessage('El área es obligatoria.'),
  body('description').isString().trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('severity').isIn(BREAKDOWN_SEVERITIES).withMessage(`Severidad inválida. Valores: ${BREAKDOWN_SEVERITIES.join(', ')}`),
  handleValidationErrors,
  breakdownController.createBreakdownReport,
);

const linkWorkOrderValidators = [
  requirePermission(PERMISSIONS.breakdownManage),
  body('workOrderId').isString().trim().notEmpty().withMessage('La OT es obligatoria.'),
  handleValidationErrors,
  breakdownController.linkToWorkOrder,
];
router.post('/:id/vincular-orden-trabajo', ...linkWorkOrderValidators);
router.post('/:id/link-work-order', ...linkWorkOrderValidators);

router.post('/:id/resolver', requirePermission(PERMISSIONS.breakdownManage), breakdownController.resolveBreakdownReport);
router.post('/:id/resolve', requirePermission(PERMISSIONS.breakdownManage), breakdownController.resolveBreakdownReport);

const rejectValidators = [
  requirePermission(PERMISSIONS.breakdownManage),
  body('reason').isString().trim().notEmpty().withMessage('El motivo del rechazo es obligatorio.'),
  handleValidationErrors,
  breakdownController.rejectBreakdownReport,
];
router.post('/:id/rechazar', ...rejectValidators);
router.post('/:id/reject', ...rejectValidators);

export default router;
