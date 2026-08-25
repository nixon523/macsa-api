import { Router } from 'express';
import { body } from 'express-validator';

import * as preventiveController from '../controllers/preventive.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import {
  PERMISSIONS,
  PREVENTIVE_FREQUENCIES,
  PREVENTIVE_FREQUENCIES_CATALOG,
  PREVENTIVE_STATUSES,
} from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requirePermission(PERMISSIONS.preventiveView),
  preventiveController.listPreventiveSchedules,
);

const materialRules = body('materials').optional().isArray().custom((materials) => {
  for (const material of materials ?? []) {
    const hasName = typeof (material.name ?? material.description) === 'string';
    if (!hasName || !Number.isFinite(Number(material.quantity))) {
      throw new Error('Cada material requiere name y quantity.');
    }
  }
  return true;
});

router.post(
  '/',
  requirePermission(PERMISSIONS.workOrderCreate),
  body('title').optional({ values: 'falsy' }).isString().trim(),
  body('assetCode').isString().trim().notEmpty().withMessage('El activo es obligatorio.'),
  body('areaId').isString().trim().notEmpty().withMessage('El área es obligatoria.'),
  body('maintenanceType').isString().trim().notEmpty().withMessage('El tipo de mantenimiento es obligatorio.'),
  body('frequency')
    .isString()
    .trim()
    .notEmpty()
    .custom((val) => {
      const match = PREVENTIVE_FREQUENCIES.some((f) => f.toLowerCase() === val.toLowerCase());
      if (!match) {
        throw new Error(`Frecuencia inválida. Valores: ${PREVENTIVE_FREQUENCIES_CATALOG.map((f) => f.label).join(', ')}`);
      }
      return true;
    }),
  body('startDate').isISO8601().withMessage('startDate debe ser una fecha válida.'),
  materialRules,
  handleValidationErrors,
  preventiveController.createPreventiveSchedule,
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.assetEdit),
  body('amendmentDocNumber').optional({ values: 'falsy' }).isString().trim(),
  materialRules,
  handleValidationErrors,
  preventiveController.amendPreventiveSchedule,
);

const executionValidators = [
  requirePermission(PERMISSIONS.workOrderCreate),
  body('workOrderId').isString().trim().notEmpty().withMessage('La OT es obligatoria.'),
  handleValidationErrors,
  preventiveController.recordExecution,
];
router.post('/:id/ejecuciones', ...executionValidators);
router.post('/:id/executions', ...executionValidators);

const statusValidators = [
  requirePermission(PERMISSIONS.assetEdit),
  body('newStatus')
    .custom((val) => {
      const match = PREVENTIVE_STATUSES.some((s) => s.toLowerCase() === (val ?? '').toString().toLowerCase());
      if (!match) {
        throw new Error(`Estado inválido. Valores: ${PREVENTIVE_STATUSES.join(', ')}`);
      }
      return true;
    }),
  handleValidationErrors,
  preventiveController.toggleStatus,
];
router.patch('/:id/estado', ...statusValidators);
router.patch('/:id/status', ...statusValidators);

export default router;
