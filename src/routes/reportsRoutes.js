import { Router } from 'express';
import { listReportLogs, getReportLog, generateReport } from '../controllers/reportsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', listReportLogs);
router.post('/generate', generateReport);
router.get('/:id', getReportLog);

export default router;
