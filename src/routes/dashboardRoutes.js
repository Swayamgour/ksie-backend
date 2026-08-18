import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getDashboardSummary);

export default router;
