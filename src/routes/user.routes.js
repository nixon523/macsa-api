import { Router } from 'express';
import { body } from 'express-validator';

import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS, VALID_ROLES } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth, requirePermission(PERMISSIONS.userManage));

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);

router.post(
  '/',
  body('username').isString().trim().notEmpty().withMessage('El nombre de usuario es obligatorio.'),
  body('displayName').optional({ values: 'falsy' }).isString().trim(),
  body('roleCode').isIn(VALID_ROLES).withMessage('El rol especificado no es válido.'),
  body('password').isString().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('permissions').optional().isArray(),
  handleValidationErrors,
  userController.createUser,
);

router.put(
  '/:id',
  body('displayName').optional({ values: 'falsy' }).isString().trim(),
  body('roleCode').optional().isIn(VALID_ROLES).withMessage('El rol especificado no es válido.'),
  body('newPassword').optional({ values: 'falsy' }).isString().isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
  body('permissions').optional().isArray(),
  handleValidationErrors,
  userController.updateUser,
);

const toggleDisabledValidators = [
  body('disabled').isBoolean(),
  handleValidationErrors,
  userController.toggleUserDisabled,
];
router.patch('/:id/deshabilitado', ...toggleDisabledValidators);
router.patch('/:id/disabled', ...toggleDisabledValidators);

export default router;
