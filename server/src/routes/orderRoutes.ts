import { Router } from 'express';
import { createOrder, getOrders, getOrderById, trackOrder, updateOrderStatus } from '../controllers/orderController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Track order by Order Number or VIN (with optional auth for account verification)
router.get('/track', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJwt(req, res, next);
  }
  next();
}, trackOrder);

// Order creation: if auth token present, attaches user
router.post('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJwt(req, res, next);
  }
  next();
}, createOrder);

// List orders (Admins see all customer orders; customers see their own)
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJwt(req, res, next);
  }
  next();
}, getOrders);

// Admin update order delivery status and estimated handover
router.patch('/:id/status', authenticateJwt, updateOrderStatus);

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJwt(req, res, next);
  }
  next();
}, getOrderById);

export default router;
