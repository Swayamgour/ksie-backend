import { Router } from 'express';
import { listTrackingEvents, getTrackingEvent, addTrackingEvent, publicTrack } from '../controllers/trackingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

// Public tracking (no auth) — customer-facing "Shipment Tracking" screen
router.get('/public/:number', publicTrack);

router.use(authenticate);
router.get('/', listTrackingEvents);
router.post('/', authorizeRoles('super_admin', 'operations_manager', 'security_officer', 'customs_officer'), addTrackingEvent);
router.get('/:id', getTrackingEvent);

export default router;
