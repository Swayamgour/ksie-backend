import { Router } from 'express';
import { getAllRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', getAllRoles);
router.get('/:id', getRole);
router.post('/', authorizeRoles('super_admin'), createRole);
router.put('/:id', authorizeRoles('super_admin'), updateRole);
router.delete('/:id', authorizeRoles('super_admin'), deleteRole);

export default router;
