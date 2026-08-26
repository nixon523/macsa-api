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
  body('username').isString().trim().notEmpty(),
  body('displayName').isString().trim().notEmpty(),
  body('roleCode').isIn(VALID_ROLES),
  body('password').isString().isLength({ min: 4 }),
  body('permissions').optional().isArray(),
  handleValidationErrors,
  userController.createUser,
);

router.put(
  '/:id',
  body('displayName').optional().isString().trim().notEmpty(),
  body('roleCode').optional().isIn(VALID_ROLES),
  body('newPassword').optional().isString().isLength({ min: 4 }),
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
