import { Router } from 'express';
import { body, query } from 'express-validator';

import * as orController from '../controllers/operationReport.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

// --- Equipos de proceso ---
// Listar equipos de proceso (lectura: asset.view)
router.get(
  '/equipos',
  requirePermission(PERMISSIONS.assetView),
  orController.listarEquipos,
);

// Marcar/desmarcar como equipo de proceso (edición: asset.edit)
router.patch(
  '/equipos/:codigoActivo/proceso',
  requirePermission(PERMISSIONS.assetEdit),
  body('esEquipoProceso').isBoolean().withMessage('esEquipoProceso debe ser booleano.'),
  handleValidationErrors,
  orController.toggleEquipoProceso,
);

// --- Reportes de operación ---
// Registrar/actualizar reporte de un día (requiere permiso especial o asset.edit)
router.post(
  '/',
  requirePermission(PERMISSIONS.assetEdit),
  body('codigoActivo').isString().notEmpty().withMessage('codigoActivo es obligatorio.'),
  body('fechaOperacion').isDate().withMessage('fechaOperacion debe ser una fecha válida (YYYY-MM-DD).'),
  body('horasOperacion').isFloat({ min: 0, max: 24 }).withMessage('horasOperacion debe ser entre 0 y 24.'),
  body('horasTotalesJornada').optional().isFloat({ min: 0.1, max: 24 }),
  body('horasParoFalla').optional().isFloat({ min: 0 }),
  body('horasParoMantPrev').optional().isFloat({ min: 0 }),
  body('horasParoMantCorr').optional().isFloat({ min: 0 }),
  body('horasParoPlanificado').optional().isFloat({ min: 0 }),
  body('horasParoExterno').optional().isFloat({ min: 0 }),
  handleValidationErrors,
  orController.registrarReporte,
);

// Reportes históricos por activo
router.get(
  '/activo/:codigoActivo',
  requirePermission(PERMISSIONS.assetView),
  orController.obtenerPorActivo,
);

// Reporte semanal por área
router.get(
  '/semana',
  requirePermission(PERMISSIONS.assetView),
  query('areaId').notEmpty().withMessage('areaId es obligatorio.'),
  query('lunes').isDate().withMessage('lunes debe ser una fecha válida (YYYY-MM-DD).'),
  handleValidationErrors,
  orController.obtenerPorSemana,
);

// Métricas de disponibilidad por activo
router.get(
  '/metricas/:codigoActivo',
  requirePermission(PERMISSIONS.assetView),
  orController.obtenerMetricas,
);

export default router;
