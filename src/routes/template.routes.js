import { Router } from 'express';
import { body } from 'express-validator';
import * as templateController from '../controllers/template.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.assetView), templateController.listTemplates);
router.get('/:id', requirePermission(PERMISSIONS.assetView), templateController.getTemplateDetail);

router.post(
  '/desde-activo',
  requirePermission(PERMISSIONS.assetCreate),
  body('sourceAssetCode').isString().trim().notEmpty().withMessage('El código de activo origen es obligatorio.'),
  body('name').isString().trim().notEmpty().withMessage('El nombre de la plantilla es obligatorio.'),
  handleValidationErrors,
  templateController.saveTemplateFromAsset,
);

router.post(
  '/:id/instanciar',
  requirePermission(PERMISSIONS.assetCreate),
  body('targetAreaId').isString().trim().notEmpty().withMessage('El área destino es obligatoria.'),
  handleValidationErrors,
  templateController.instantiateTemplate,
);

router.delete('/:id', requirePermission(PERMISSIONS.assetCreate), templateController.deleteTemplate);

export default router;
