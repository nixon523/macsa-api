import { Router } from 'express';
import { body } from 'express-validator';

import * as assetController from '../controllers/asset.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { uploadAssetImageMiddleware } from '../middleware/upload.middleware.js';
import { PERMISSIONS, ASSET_LEVELS, ASSET_STATUSES } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.assetView), assetController.listAssetsByParent);

router.get('/buscar', requirePermission(PERMISSIONS.assetView), assetController.searchAssets);
router.get('/search', requirePermission(PERMISSIONS.assetView), assetController.searchAssets);

router.get('/serie/:serial', requirePermission(PERMISSIONS.assetView), assetController.findBySerial);
router.get('/serial/:serial', requirePermission(PERMISSIONS.assetView), assetController.findBySerial);

router.get('/area/:areaId', requirePermission(PERMISSIONS.assetView), assetController.listAssetsByArea);

// Endpoint de subida de imagen para activos
router.post(
  '/upload-imagen',
  requirePermission(PERMISSIONS.assetCreate),
  uploadAssetImageMiddleware,
  assetController.uploadAssetImage,
);
router.post(
  '/upload-image',
  requirePermission(PERMISSIONS.assetCreate),
  uploadAssetImageMiddleware,
  assetController.uploadAssetImage,
);

router.post(
  '/',
  requirePermission(PERMISSIONS.assetCreate),
  body('name').isString().trim().notEmpty().withMessage('El nombre del activo es obligatorio.'),
  body('areaId').isString().trim().notEmpty().withMessage('El área es obligatoria.'),
  body('level').isIn(ASSET_LEVELS).withMessage(`Nivel inválido. Valores: ${ASSET_LEVELS.join(', ')}`),
  body('status').optional().isIn(ASSET_STATUSES),
  handleValidationErrors,
  assetController.createAsset,
);

const transferValidators = [
  requirePermission(PERMISSIONS.assetTransfer),
  body('targetAreaId').isString().trim().notEmpty().withMessage('El área destino es obligatoria.'),
  handleValidationErrors,
  assetController.transferAsset,
];
router.post('/:assetCode/traspasar', ...transferValidators);
router.post('/:assetCode/transfer', ...transferValidators);

router.post('/:assetCode/reactivar', requirePermission(PERMISSIONS.assetTransfer), assetController.reactivateAsset);
router.post('/:assetCode/reactivate', requirePermission(PERMISSIONS.assetTransfer), assetController.reactivateAsset);

const statusValidators = [
  requirePermission(PERMISSIONS.assetEdit),
  body('newStatus')
    .isIn(ASSET_STATUSES)
    .withMessage(`Estado inválido. Valores: ${ASSET_STATUSES.join(', ')}`),
  handleValidationErrors,
  assetController.toggleAssetStatus,
];
router.patch('/:assetCode/estado', ...statusValidators);
router.patch('/:assetCode/status', ...statusValidators);

router.put(
  '/:assetCode',
  requirePermission(PERMISSIONS.assetEdit),
  body('name').isString().trim().notEmpty(),
  body('status').isIn(ASSET_STATUSES),
  handleValidationErrors,
  assetController.updateAsset,
);

export default router;
