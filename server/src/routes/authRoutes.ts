import { Router } from 'express';
import { register, login, getMe, switchPersona } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJwt, getMe);
router.post('/switch-persona', switchPersona);

export default router;
