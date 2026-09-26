import { Router } from 'express';
import { getModels, getModelByCode, getVariantById } from '../controllers/vehicleController';

const router = Router();

router.get('/models', getModels);
router.get('/models/:code', getModelByCode);
router.get('/variants/:id', getVariantById);

export default router;
