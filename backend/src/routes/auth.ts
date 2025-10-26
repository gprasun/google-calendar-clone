import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticateSession } from '@/middleware/sessionAuth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authenticateSession, AuthController.getProfile);
router.put('/profile', authenticateSession, AuthController.updateProfile);
router.put('/change-password', authenticateSession, AuthController.changePassword);
router.delete('/account', authenticateSession, AuthController.deleteAccount);
router.post('/logout', authenticateSession, AuthController.logout);

export default router;
