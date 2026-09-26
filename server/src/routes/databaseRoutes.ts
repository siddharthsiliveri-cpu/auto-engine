import { Router } from 'express';
import {
  getDatabaseOverview,
  getViewData,
  runStoredProcedure,
  runTriggerDemo,
  getAggregates,
  getAuditLogs,
} from '../controllers/databaseController';

const router = Router();

router.get('/overview', getDatabaseOverview);
router.get('/view/vehicle-components', getViewData);
router.post('/stored-procedure/calculate-completion', runStoredProcedure);
router.post('/trigger/test-audit', runTriggerDemo);
router.get('/aggregates', getAggregates);
router.get('/audit-logs', getAuditLogs);

export default router;
