import { Router } from 'express';
import { listMasters, getMaster, createMaster, updateMaster, deleteMaster } from '../controllers/masterController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', listMasters);
router.post('/', authorizeRoles('super_admin'), createMaster);
router.get('/:id', getMaster);
router.put('/:id', authorizeRoles('super_admin'), updateMaster);
router.delete('/:id', authorizeRoles('super_admin'), deleteMaster);

export default router;
