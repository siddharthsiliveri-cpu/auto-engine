import { Router } from 'express';
import {
  saveConfiguration,
  getConfigurations,
  getConfigurationById,
  deleteConfiguration,
  duplicateConfiguration,
} from '../controllers/configuratorController';

const router = Router();

router.post('/save', saveConfiguration);
router.get('/', getConfigurations);
router.get('/:id', getConfigurationById);
router.delete('/:id', deleteConfiguration);
router.post('/:id/duplicate', duplicateConfiguration);

export default router;

