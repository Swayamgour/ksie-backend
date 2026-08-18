import { Router } from 'express';
import { listCouriers, getCourier, bookCourier, updateCourier, updateCourierStatus, deleteCourier } from '../controllers/courierController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', listCouriers);
router.get('/:id', getCourier);
router.post('/', authorizeRoles('super_admin', 'operations_manager'), bookCourier);
router.put('/:id', authorizeRoles('super_admin', 'operations_manager'), updateCourier);
router.patch('/:id/status', authorizeRoles('super_admin', 'operations_manager', 'customs_officer'), updateCourierStatus);
router.delete('/:id', authorizeRoles('super_admin'), deleteCourier);

export default router;
