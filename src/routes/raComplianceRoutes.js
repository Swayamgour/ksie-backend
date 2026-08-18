import { Router } from 'express';
import { listRaRecords, getRaRecord, createRaRecord, updateRaRecord, verifyRaRecord, deleteRaRecord } from '../controllers/raComplianceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', listRaRecords);
router.get('/:id', getRaRecord);
router.post('/', authorizeRoles('super_admin', 'security_officer'), createRaRecord);
router.put('/:id', authorizeRoles('super_admin', 'security_officer'), updateRaRecord);
router.patch('/:id/verify', authorizeRoles('super_admin', 'security_officer'), verifyRaRecord);
router.delete('/:id', authorizeRoles('super_admin'), deleteRaRecord);

export default router;
