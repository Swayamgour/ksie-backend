import { Router } from 'express';
import { listTransshipments, getTransshipment, createTransshipment, updateTransshipment, deleteTransshipment } from '../controllers/transshipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', listTransshipments);
router.get('/:id', getTransshipment);
router.post('/', authorizeRoles('super_admin', 'operations_manager'), createTransshipment);
router.put('/:id', authorizeRoles('super_admin', 'operations_manager'), updateTransshipment);
router.delete('/:id', authorizeRoles('super_admin'), deleteTransshipment);

export default router;
