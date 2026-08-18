import { Router } from 'express';
import {
  listAirShipments, getAirShipment, createImportAwb, createExportBooking,
  updateShipmentStatus, deleteAirShipment, trackByAwb,
} from '../controllers/airCargoController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', listAirShipments);
router.get('/track/:awbNumber', trackByAwb);
router.get('/:id', getAirShipment);

router.post('/import', authorizeRoles('super_admin', 'operations_manager'), createImportAwb);
router.post('/export', authorizeRoles('super_admin', 'operations_manager'), createExportBooking);
router.patch('/:id/status', authorizeRoles('super_admin', 'operations_manager', 'customs_officer', 'security_officer'), updateShipmentStatus);
router.delete('/:id', authorizeRoles('super_admin'), deleteAirShipment);

export default router;
