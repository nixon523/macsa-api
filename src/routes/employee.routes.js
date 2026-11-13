import { Router } from 'express';
import { body } from 'express-validator';

import * as employeeController from '../controllers/employee.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAnyPermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

const canReadEmployees = requireAnyPermission(
  PERMISSIONS.employeeManage,
  PERMISSIONS.workOrderCreate,
  PERMISSIONS.userManage,
);
const canManageEmployees = requireAnyPermission(
  PERMISSIONS.employeeManage,
  PERMISSIONS.userManage,
);

// ----------------------------------------------------------------------------
// Catálogo de Puestos (debe definirse antes de /:id para evitar colisiones de ruta)
// ----------------------------------------------------------------------------
router.get('/puestos', canReadEmployees, employeeController.listPositions);
router.post(
  '/puestos',
  canManageEmployees,
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  employeeController.createPosition,
);
router.put(
  '/puestos/:id',
  canManageEmployees,
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  employeeController.updatePosition,
);
router.delete('/puestos/:id', canManageEmployees, employeeController.deletePosition);

// ----------------------------------------------------------------------------
// CRUD Empleados
// ----------------------------------------------------------------------------
router.get('/', canReadEmployees, employeeController.listEmployees);
router.post(
  '/',
  canManageEmployees,
  body('fullName').isString().trim().notEmpty().withMessage('El nombre completo es obligatorio.'),
  body('position').isString().trim().notEmpty().withMessage('El puesto o cargo es obligatorio.'),
  handleValidationErrors,
  employeeController.createEmployee,
);
router.put(
  '/:id',
  canManageEmployees,
  body('fullName').isString().trim().notEmpty().withMessage('El nombre completo es obligatorio.'),
  body('position').isString().trim().notEmpty().withMessage('El puesto o cargo es obligatorio.'),
  handleValidationErrors,
  employeeController.updateEmployee,
);
router.post('/:id/estado', canManageEmployees, employeeController.toggleEmployeeStatus);

export default router;
