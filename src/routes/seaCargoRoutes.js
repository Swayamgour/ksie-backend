import { Router } from 'express';
import {
  listContainers, getContainer, createContainer, updateContainerStatus, deleteContainer, trackByContainerNumber,
  listGateOperations, getGateOperation, recordGateOperation, clearSecurity,
  listWeighments, getWeighment, recordWeighment,
  listStuffingRecords, getStuffingRecord, startStuffing, updateStuffingRecord, fileSfMessage, sealContainer,
  listReeferOperations, getReeferOperation, createReeferOperation, updateReeferMonitoring,
} from '../controllers/seaCargoController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

const opsOnly = authorizeRoles('super_admin', 'operations_manager');
const securityOnly = authorizeRoles('super_admin', 'security_officer');

// Containers
router.get('/containers', listContainers);
router.post('/containers', opsOnly, createContainer);
router.get('/containers/track/:containerNumber', trackByContainerNumber);
router.get('/containers/:id', getContainer);
router.patch('/containers/:id/status', opsOnly, updateContainerStatus);
router.delete('/containers/:id', authorizeRoles('super_admin'), deleteContainer);

// Vehicle Gate Process
router.get('/gate-operations', listGateOperations);
router.post('/gate-operations', opsOnly, recordGateOperation);
router.get('/gate-operations/:id', getGateOperation);
router.patch('/gate-operations/:id/security-clearance', securityOnly, clearSecurity);

// Weighment
router.get('/weighments', listWeighments);
router.post('/weighments', opsOnly, recordWeighment);
router.get('/weighments/:id', getWeighment);

// Export Container Stuffing
router.get('/stuffing', listStuffingRecords);
router.post('/stuffing', opsOnly, startStuffing);
router.get('/stuffing/:id', getStuffingRecord);
router.put('/stuffing/:id', opsOnly, updateStuffingRecord);
router.patch('/stuffing/:id/file-sf', opsOnly, fileSfMessage);
router.patch('/stuffing/:id/seal', opsOnly, sealContainer);

// Reefer Container Management
router.get('/reefer', listReeferOperations);
router.post('/reefer', opsOnly, createReeferOperation);
router.get('/reefer/:id', getReeferOperation);
router.patch('/reefer/:id/monitor', opsOnly, updateReeferMonitoring);

export default router;
