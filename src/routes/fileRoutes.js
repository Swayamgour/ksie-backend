import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { uploadSingle } from '../middleware/upload.js';
import { uploadFile } from '../controllers/fileController.js';

const router=Router();
router.use(authenticate);
router.post('/',authorizeRoles('super_admin','operations_manager','customs_officer','security_officer','billing_officer'),uploadSingle,uploadFile);
export default router;
