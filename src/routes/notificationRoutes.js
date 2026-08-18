import { Router } from 'express';
import { listNotifications, getNotification, sendNotification, markAsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', listNotifications);
router.post('/', sendNotification);
router.get('/:id', getNotification);
router.patch('/:id/read', markAsRead);

export default router;
