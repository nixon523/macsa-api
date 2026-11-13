import { Router } from 'express';
import { body, query } from 'express-validator';

import * as orController from '../controllers/operationReport.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission, requireAnyPermission } from '../middleware/permission.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../security/rolePermissions.js';

const router = Router();

router.use(requireAuth);

const canViewOperationReports = requireAnyPermission(
  PERMISSIONS.operationReportView,
  PERMISSIONS.assetView,
  PERMISSIONS.dashboardView,
);

const canEditOperationReports = requireAnyPermission(
  PERMISSIONS.operationReportEdit,
  PERMISSIONS.assetEdit,
);

// --- Equipos de proceso ---
router.get('/equipos', canViewOperationReports, orController.listarEquipos);

router.patch(
  '/equipos/:codigoActivo/proceso',
  requirePermission(PERMISSIONS.assetEdit),
  body('esEquipoProceso').isBoolean().withMessage('esEquipoProceso debe ser booleano.'),
  handleValidationErrors,
  orController.toggleEquipoProceso,
);

// --- Reportes de operación ---
router.post(
  '/',
  canEditOperationReports,
  body('codigoActivo').isString().notEmpty().withMessage('codigoActivo es obligatorio.'),
  body('fechaOperacion').isDate().withMessage('fechaOperacion debe ser una fecha válida (YYYY-MM-DD).'),
  body('horasOperacion').isFloat({ min: 0, max: 24 }).withMessage('horasOperacion debe ser entre 0 y 24.'),
  body('horasTotalesJornada').optional().isFloat({ min: 0.1, max: 24 }),
  body('horasParoFalla').optional().isFloat({ min: 0 }),
  body('horasParoMantPrev').optional().isFloat({ min: 0 }),
  body('horasParoMantCorr').optional().isFloat({ min: 0 }),
  body('horasParoPlanificado').optional().isFloat({ min: 0 }),
  body('horasParoExterno').optional().isFloat({ min: 0 }),
  body('unidadesProducidas').optional({ nullable: true }).isFloat({ min: 0 }),
  body('unidadesEsperadas').optional({ nullable: true }).isFloat({ min: 0 }),
  body('unidadesConformes').optional({ nullable: true }).isFloat({ min: 0 }),
  body('rendimientoDirectoPct').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body('calidadDirectoPct').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  handleValidationErrors,
  orController.registrarReporte,
);

// --- Reportería y Analítica Avanzada ---
router.get('/analitica/historial-activo/:codigoActivo', canViewOperationReports, orController.obtenerHistorialActivo);
router.get('/analitica/estacionalidad', canViewOperationReports, orController.obtenerEstacionalidad);
router.get('/analitica/top-fallas', canViewOperationReports, orController.obtenerTopFallas);
router.get('/analitica/consumo-repuestos', canViewOperationReports, orController.obtenerConsumoRepuestos);
router.get('/analitica/oee-general', canViewOperationReports, orController.obtenerOEEGeneral);
router.get('/activo/:codigoActivo', canViewOperationReports, orController.obtenerPorActivo);

router.get(
  '/semana',
  canViewOperationReports,
  query('areaId').notEmpty().withMessage('areaId es obligatorio.'),
  query('lunes').isDate().withMessage('lunes debe ser una fecha válida (YYYY-MM-DD).'),
  handleValidationErrors,
  orController.obtenerPorSemana,
);

router.get('/metricas/:codigoActivo', canViewOperationReports, orController.obtenerMetricas);

export default router;
