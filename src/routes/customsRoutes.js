import { Router } from 'express';
import {
  listDeclarations, getDeclaration, createDeclaration, updateDeclaration, deleteDeclaration,
  fileWithIcegate, updateFilingStatus,
  listDocuments, getDocument, uploadDocument, verifyDocument, deleteDocument,
} from '../controllers/customsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

const customsOnly = authorizeRoles('super_admin', 'customs_officer');

// Declarations (Bill of Entry / Shipping Bill / IGM / SF)
router.get('/declarations', listDeclarations);
router.post('/declarations', customsOnly, createDeclaration);
router.get('/declarations/:id', getDeclaration);
router.put('/declarations/:id', customsOnly, updateDeclaration);
router.post('/declarations/:id/file-icegate', customsOnly, fileWithIcegate);
router.patch('/declarations/:id/filing-status', customsOnly, updateFilingStatus);
router.delete('/declarations/:id', authorizeRoles('super_admin'), deleteDeclaration);

// Documents
router.get('/documents', listDocuments);
router.post('/documents', customsOnly, uploadDocument);
router.get('/documents/:id', getDocument);
router.patch('/documents/:id/verify', customsOnly, verifyDocument);
router.delete('/documents/:id', authorizeRoles('super_admin'), deleteDocument);

export default router;
