import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import {
  listVehicles, getVehicle, createVehicle, updateVehicle, trackVehicle,
  listVessels, getVessel, createVessel, updateVessel,
  listDeliveryOrders, getDeliveryOrder, createDeliveryOrder, approveDeliveryOrder, issueDeliveryOrder,
  listUldAllocations, allocateUld, listFlightLoading, loadFlight,
  listCargoMovements, recordCargoMovement, listAuditLogs,
} from '../controllers/operationsController.js';

const router = Router();
router.use(authenticate);
const ops = authorizeRoles('super_admin', 'operations_manager');
const admin = authorizeRoles('super_admin');

router.get('/vehicles', listVehicles); router.post('/vehicles', ops, createVehicle); router.get('/vehicles/:id', getVehicle); router.patch('/vehicles/:id', ops, updateVehicle); router.post('/vehicles/:vehicleNumber/location', ops, trackVehicle);
router.get('/vessels', listVessels); router.post('/vessels', ops, createVessel); router.get('/vessels/:id', getVessel); router.patch('/vessels/:id', ops, updateVessel);
router.get('/delivery-orders', listDeliveryOrders); router.post('/delivery-orders', ops, createDeliveryOrder); router.get('/delivery-orders/:id', getDeliveryOrder); router.patch('/delivery-orders/:id/approve', ops, approveDeliveryOrder); router.patch('/delivery-orders/:id/issue', ops, issueDeliveryOrder);
router.get('/uld-allocations', listUldAllocations); router.post('/uld-allocations', ops, allocateUld);
router.get('/flight-loading', listFlightLoading); router.post('/flight-loading', ops, loadFlight);
router.get('/cargo-movements', listCargoMovements); router.post('/cargo-movements', ops, recordCargoMovement);
router.get('/audit-logs', admin, listAuditLogs);
export default router;
