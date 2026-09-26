import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { authenticateJwt } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

router.get('/', getReviews);
router.post('/', authenticateJwt, requireRoles(['ADMIN', 'PROJECT_MANAGER', 'ENGINEER']), createReview);

export default router;
