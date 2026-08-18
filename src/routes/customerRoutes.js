import { Router } from 'express';
import { getAllCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/:id', getCustomer);
router.post('/', authorizeRoles('super_admin', 'operations_manager'), createCustomer);
router.put('/:id', authorizeRoles('super_admin', 'operations_manager'), updateCustomer);
router.delete('/:id', authorizeRoles('super_admin'), deleteCustomer);

export default router;
