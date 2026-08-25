import { Router } from 'express';

import * as dashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.get('/estadisticas', requireAuth, requirePermission(PERMISSIONS.dashboardView), dashboardController.getStats);
router.get('/stats', requireAuth, requirePermission(PERMISSIONS.dashboardView), dashboardController.getStats);

export default router;
