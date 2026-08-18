import { Router } from 'express';
import {
  listWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse,
  listRacks, getRack, createRack, updateRack, deleteRack,
  listCargoStorage, getCargoStorage, storeCargo, updateCargoStorage, releaseCargo, reportDamage, cargoAgingReport,
} from '../controllers/warehouseController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

const opsOnly = authorizeRoles('super_admin', 'operations_manager');

// Warehouses
router.get('/', listWarehouses);
router.post('/', opsOnly, createWarehouse);
router.get('/:id', getWarehouse);
router.put('/:id', opsOnly, updateWarehouse);
router.delete('/:id', authorizeRoles('super_admin'), deleteWarehouse);

// Racks / Bins
router.get('/racks/all', listRacks);
router.post('/racks', opsOnly, createRack);
router.get('/racks/:id', getRack);
router.put('/racks/:id', opsOnly, updateRack);
router.delete('/racks/:id', authorizeRoles('super_admin'), deleteRack);

// Cargo Storage / Inventory Control
router.get('/storage/all', listCargoStorage);
router.post('/storage', opsOnly, storeCargo);
router.get('/storage/aging-report', cargoAgingReport);
router.get('/storage/:id', getCargoStorage);
router.put('/storage/:id', opsOnly, updateCargoStorage);
router.patch('/storage/:id/release', opsOnly, releaseCargo);
router.patch('/storage/:id/report-damage', opsOnly, reportDamage);

export default router;
