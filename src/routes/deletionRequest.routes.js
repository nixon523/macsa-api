import { Router } from 'express';
import { body } from 'express-validator';

import * as deletionController from '../controllers/deletionRequest.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.assetDeleteApprove), deletionController.listAll);

router.get('/pendientes', requirePermission(PERMISSIONS.assetDeleteApprove), deletionController.listPending);
router.get('/pending', requirePermission(PERMISSIONS.assetDeleteApprove), deletionController.listPending);

router.get(
  '/activo/:assetCode',
  requirePermission(PERMISSIONS.assetView),
  deletionController.listPendingByAsset,
);
router.get(
  '/asset/:assetCode',
  requirePermission(PERMISSIONS.assetView),
  deletionController.listPendingByAsset,
);

router.post(
  '/',
  requirePermission(PERMISSIONS.assetDeleteRequest),
  body('assetCode').isString().trim().notEmpty().withMessage('El activo es obligatorio.'),
  body('reason').isString().trim().notEmpty().withMessage('El motivo es obligatorio.'),
  handleValidationErrors,
  deletionController.createDeletionRequest,
);

router.post(
  '/:id/aprobar',
  requirePermission(PERMISSIONS.assetDeleteApprove),
  deletionController.approveDeletionRequest,
);
router.post(
  '/:id/approve',
  requirePermission(PERMISSIONS.assetDeleteApprove),
  deletionController.approveDeletionRequest,
);

const rejectValidators = [
  requirePermission(PERMISSIONS.assetDeleteApprove),
  body('reason').isString().trim().notEmpty().withMessage('El motivo del rechazo es obligatorio.'),
  handleValidationErrors,
  deletionController.rejectDeletionRequest,
];
router.post('/:id/rechazar', ...rejectValidators);
router.post('/:id/reject', ...rejectValidators);

export default router;
