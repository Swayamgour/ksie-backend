import { Router } from 'express';
import { getAllUsers, getUser, updateUser, deleteUser, toggleUserStatus } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate, authorizeRoles('super_admin'));

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
