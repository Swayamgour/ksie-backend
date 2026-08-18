import { Router } from 'express';
import { listManifests, getManifest, uploadManifest, updateManifest, deleteManifest } from '../controllers/manifestController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

router.get('/', listManifests);
router.get('/:id', getManifest);
router.post('/', authorizeRoles('super_admin', 'operations_manager'), uploadManifest);
router.put('/:id', authorizeRoles('super_admin', 'operations_manager'), updateManifest);
router.delete('/:id', authorizeRoles('super_admin'), deleteManifest);

export default router;
