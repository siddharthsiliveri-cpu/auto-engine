import { Router } from 'express';
import {
  getComponents,
  getCategories,
  getSuppliers,
  getComponentById,
  createComponent,
} from '../controllers/componentController';
import { authenticateJwt } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

router.get('/', getComponents);
router.get('/categories', getCategories);
router.get('/suppliers', getSuppliers);
router.get('/:id', getComponentById);
router.post('/', authenticateJwt, requireRoles(['ADMIN', 'ENGINEER']), createComponent);

export default router;
