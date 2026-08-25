import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import areaRoutes from './area.routes.js';
import assetRoutes from './asset.routes.js';
import deletionRequestRoutes from './deletionRequest.routes.js';
import workOrderRoutes from './workOrder.routes.js';
import breakdownRoutes from './breakdown.routes.js';
import preventiveRoutes from './preventive.routes.js';
import kardexRoutes from './kardex.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas principales en Español
router.use('/autenticacion', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/areas', areaRoutes);
router.use('/activos', assetRoutes);
router.use('/solicitudes-baja', deletionRequestRoutes);
router.use('/ordenes-trabajo', workOrderRoutes);
router.use('/reportes-averia', breakdownRoutes);
router.use('/planes-preventivos', preventiveRoutes);
router.use('/kardex', kardexRoutes);
router.use('/dashboard', dashboardRoutes);

// Alias de compatibilidad
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/deletion-requests', deletionRequestRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/breakdown-reports', breakdownRoutes);
router.use('/preventive-schedules', preventiveRoutes);

export default router;
