import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateMilestone,
  calculateProjectCompletion,
} from '../controllers/projectController';
import { authenticateJwt } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authenticateJwt, requireRoles(['ADMIN', 'PROJECT_MANAGER']), createProject);
router.patch('/milestones/:id', authenticateJwt, requireRoles(['ADMIN', 'PROJECT_MANAGER', 'ENGINEER']), updateMilestone);
router.post('/:id/calculate-completion', calculateProjectCompletion);

export default router;
