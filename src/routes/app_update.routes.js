import { Router } from 'express';
import * as appUpdateController from '../controllers/app_update.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

// Consultas públicas para que la app móvil verifique actualizaciones antes/durante el login
router.get('/version-android', appUpdateController.getLatestAndroidVersion);
router.get('/android-version', appUpdateController.getLatestAndroidVersion);

// Registro de nueva versión (protegido para administradores)
router.post(
  '/version-android',
  requireAuth,
  requirePermission(PERMISSIONS.userManage),
  appUpdateController.registerAndroidVersion,
);

export default router;
