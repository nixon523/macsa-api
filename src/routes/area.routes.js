import { Router } from 'express';
import { body } from 'express-validator';

import * as areaController from '../controllers/area.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.assetView), areaController.listAreas);

router.post(
  '/',
  requirePermission(PERMISSIONS.assetCreate),
  body('name').isString().trim().notEmpty().withMessage('El nombre del área es obligatorio.'),
  body('costCenter').isString().trim().notEmpty().withMessage('El centro de coste es obligatorio.'),
  handleValidationErrors,
  areaController.createArea,
);

router.put(
  '/:areaId',
  requirePermission(PERMISSIONS.assetEdit),
  body('name').isString().trim().notEmpty().withMessage('El nombre del área es obligatorio.'),
  body('costCenter').isString().trim().notEmpty().withMessage('El centro de coste es obligatorio.'),
  handleValidationErrors,
  areaController.updateArea,
);

export default router;
