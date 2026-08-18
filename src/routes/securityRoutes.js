import { Router } from 'express';
import {
  listScreenings, getScreening, createScreening, updateScreening, recordScreeningResult, approveScreening,
  listAuditLogs, getAuditLog, createAuditLog, updateAuditLog, securityDashboard,
} from '../controllers/securityController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

const securityOnly = authorizeRoles('super_admin', 'security_officer');

router.get('/dashboard', securityDashboard);

// Screening
router.get('/screenings', listScreenings);
router.post('/screenings', securityOnly, createScreening);
router.get('/screenings/:id', getScreening);
router.put('/screenings/:id', securityOnly, updateScreening);
router.patch('/screenings/:id/result', securityOnly, recordScreeningResult);
router.patch('/screenings/:id/approve', securityOnly, approveScreening);

// Audit Logs / Compliance
router.get('/audit-logs', listAuditLogs);
router.post('/audit-logs', securityOnly, createAuditLog);
router.get('/audit-logs/:id', getAuditLog);
router.put('/audit-logs/:id', securityOnly, updateAuditLog);

export default router;
