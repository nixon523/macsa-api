import { Router } from 'express';
import { body, query } from 'express-validator';

import * as kardexController from '../controllers/kardex.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requirePermission(PERMISSIONS.kardexView),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  handleValidationErrors,
  kardexController.listKardexLogs,
);

router.get('/entidad/:entityId', requirePermission(PERMISSIONS.kardexView), kardexController.listByEntity);
router.get('/entity/:entityId', requirePermission(PERMISSIONS.kardexView), kardexController.listByEntity);

export default router;
