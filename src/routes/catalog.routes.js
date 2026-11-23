import { Router } from 'express';
import { body } from 'express-validator';
import * as catalogController from '../controllers/catalog.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAnyPermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

const canReadCatalogs = requireAnyPermission(
  PERMISSIONS.assetView,
  PERMISSIONS.assetCreate,
  PERMISSIONS.assetEdit,
  PERMISSIONS.workOrderCreate,
  PERMISSIONS.userManage,
);

const canManageCatalogs = requireAnyPermission(
  PERMISSIONS.assetCreate,
  PERMISSIONS.assetEdit,
  PERMISSIONS.userManage,
);

// Catálogos unificados
router.get('/', canReadCatalogs, catalogController.getCatalogs);

// ----------------------------------------------------------------------------
// CRUD Unidades de Medida
// ----------------------------------------------------------------------------
router.get('/unidades', canReadCatalogs, catalogController.listUnitsOfMeasure);

router.post(
  '/unidades',
  canManageCatalogs,
  body('code').optional().isString().trim(),
  body('codigo').optional().isString().trim(),
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  catalogController.createUnitOfMeasure,
);

router.put(
  '/unidades/:id',
  canManageCatalogs,
  body('code').optional().isString().trim(),
  body('codigo').optional().isString().trim(),
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  catalogController.updateUnitOfMeasure,
);

router.delete('/unidades/:id', canManageCatalogs, catalogController.deleteUnitOfMeasure);

// ----------------------------------------------------------------------------
// CRUD Atributos de Activos
// ----------------------------------------------------------------------------
router.get('/atributos', canReadCatalogs, catalogController.listAttributeCatalog);

router.post(
  '/atributos',
  canManageCatalogs,
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  catalogController.createAttributeCatalog,
);

router.put(
  '/atributos/:id',
  canManageCatalogs,
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  catalogController.updateAttributeCatalog,
);

router.delete('/atributos/:id', canManageCatalogs, catalogController.deleteAttributeCatalog);

// ----------------------------------------------------------------------------
// CRUD Marcas de Activos
// ----------------------------------------------------------------------------
router.get('/marcas', canReadCatalogs, catalogController.listBrands);

router.post(
  '/marcas',
  canManageCatalogs,
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  catalogController.createBrand,
);

router.put(
  '/marcas/:id',
  canManageCatalogs,
  body('name').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  handleValidationErrors,
  catalogController.updateBrand,
);

router.delete('/marcas/:id', canManageCatalogs, catalogController.deleteBrand);

export default router;
