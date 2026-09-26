import { Router } from 'express';
import {
  saveConfiguration,
  getConfigurations,
  getConfigurationById,
} from '../controllers/configuratorController';

const router = Router();

router.post('/save', saveConfiguration);
router.get('/', getConfigurations);
router.get('/:id', getConfigurationById);

export default router;
