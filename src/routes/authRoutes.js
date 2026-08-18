import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, me, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  authenticate,
  authorizeRoles('super_admin'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('roleId').isMongoId().withMessage('Valid roleId is required'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, me);

router.post(
  '/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  changePassword
);

export default router;
