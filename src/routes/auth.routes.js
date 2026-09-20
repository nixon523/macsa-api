import { Router } from 'express';
import { body } from 'express-validator';

import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.post(
  '/login',
  body('username').isString().trim().notEmpty().withMessage('El usuario es obligatorio.'),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria.'),
  handleValidationErrors,
  authController.login,
);

const resetRequestValidators = [
  body('username').isString().trim().notEmpty().withMessage('El usuario es obligatorio.'),
  handleValidationErrors,
  authController.requestPasswordReset,
];
router.post('/solicitudes-reinicio-password', ...resetRequestValidators);
router.post('/password-reset-requests', ...resetRequestValidators);

router.get('/yo', requireAuth, authController.me);
router.get('/me', requireAuth, authController.me);

const changePasswordValidators = [
  requireAuth,
  body('currentPassword')
    .optional({ values: 'falsy' })
    .isString(),
  body('newPassword')
    .isString()
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
  handleValidationErrors,
  authController.changePassword,
];
router.put('/yo/password', ...changePasswordValidators);
router.put('/me/password', ...changePasswordValidators);

router.get(
  '/solicitudes-reinicio-password',
  requireAuth,
  requirePermission(PERMISSIONS.userManage),
  authController.pendingPasswordResets,
);
router.get(
  '/password-reset-requests',
  requireAuth,
  requirePermission(PERMISSIONS.userManage),
  authController.pendingPasswordResets,
);

const resolveResetValidators = [
  requireAuth,
  requirePermission(PERMISSIONS.userManage),
  body('userId').isInt().withMessage('userId del solicitante es obligatorio.'),
  handleValidationErrors,
  authController.resolvePasswordReset,
];
router.post('/solicitudes-reinicio-password/:id/resolver', ...resolveResetValidators);
router.post('/password-reset-requests/:id/resolve', ...resolveResetValidators);

export default router;
