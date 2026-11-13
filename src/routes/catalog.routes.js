import { Router } from 'express';
import { getCatalogs } from '../controllers/catalog.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCatalogs);

export default router;
