import { Request, Response } from 'express';
import prisma from '../prisma';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryMethod = 'WHITE_GLOVE',
      paymentMethod = 'WIRE_TRANSFER',
      items = [],
      notes,
    } = req.body;

    if (!customerName || !customerEmail || !items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Customer name, email, and at least one order item are required',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in or register to place your automotive build order.',
      });
      return;
    }

    const userId = req.user.id;
    const finalCustomerEmail = req.user.email || customerEmail;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.totalPrice) * (Number(item.quantity) || 1)), 0);

    // Generate unique order number and VIN
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AE-ORD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const vin = `1AE${Date.now().toString(16).toUpperCase().slice(-6)}${randomSuffix}US`;
    
    // Estimated delivery: 5 to 6 days from date of ordering (Express White-Glove Handover)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName,
          customerEmail: finalCustomerEmail,
          customerPhone: customerPhone || null,
          deliveryAddress: deliveryAddress || 'Factory Handover Experience Center',
          deliveryMethod,
          paymentMethod,
          totalAmount: Math.round(totalAmount),
          status: 'CONFIRMED',
          vin,
          estimatedDelivery,
          notes: notes || null,
        },
      });

      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            itemType: item.type || 'VEHICLE',
            vehicleName: item.vehicleModelName || item.name || 'Bespoke Custom Vehicle',
            variantName: item.variantName || null,
            configCode: item.configCode || null,
            basePrice: Number(item.basePrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            modificationsJson: item.modifications ? JSON.stringify(item.modifications) : null,
            paintColor: item.paintColor || null,
            paintFinish: item.paintFinish || null,
            wheelStyle: item.wheelStyle || null,
            tyreStyle: item.tyreStyle || null,
            spoilerStyle: item.spoilerStyle || null,
            caliperColor: item.caliperColor || null,
            interiorTrim: item.interiorTrim || null,
            exhaustStyle: item.exhaustStyle || null,
            quantity: Number(item.quantity) || 1,
          },
        });
      }

      // Log in AuditLog
      await tx.auditLog.create({
        data: {
          tableName: 'Order',
          recordId: order.id,
          action: 'INSERT',
          changedBy: userId,
          newValues: JSON.stringify({
            orderNumber,
            customerName,
            totalAmount,
            itemsCount: items.length,
            status: 'CONFIRMED',
          }),
        },
      });

      return order;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true },
    });

    res.status(201).json({
      success: true,
      data: fullOrder,
      message: 'Automotive build order successfully confirmed and placed into production schedule',
    });
  } catch (error: any) {
    console.error('Failed to create order:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error processing order' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === 'ADMIN';

    // Unauthenticated visitors / guests cannot see any customer orders
    if (!req.user) {
      res.json({ success: true, data: [] });
      return;
    }

    let where: any = {};
    if (!isAdmin) {
      // Non-admin customer: strictly limited to their own user id or email
      where = {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ customerEmail: userEmail }] : []),
        ],
      };
    }
    // Admin sees all customer orders across the platform

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Failed to get orders:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching orders' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (req.user && req.user.role !== 'ADMIN') {
      const isOwner = (order.userId === req.user.id) || (order.customerEmail?.toLowerCase() === req.user.email?.toLowerCase());
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied: Order belongs to another account.' });
        return;
      }
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Failed to get order by id:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching order' });
  }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = ((req.query.q as string) || '').trim();
    if (!query) {
      res.status(400).json({ success: false, message: 'Please provide an Order Number or VIN to track' });
      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query } },
          { vin: { equals: query } },
          { id: { equals: query } },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'No vehicle order found matching the provided reference number' });
      return;
    }

    // Account isolation: If logged-in customer is tracking, ensure it's their own order
    if (req.user && req.user.role !== 'ADMIN') {
      const isOwner = (order.userId === req.user.id) || (order.customerEmail?.toLowerCase() === req.user.email?.toLowerCase());
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied: This vehicle order belongs to another customer account.' });
        return;
      }
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Failed to track order:', error);
    res.status(500).json({ success: false, message: 'Internal server error tracking order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Administrator privileges required' });
      return;
    }

    const id = req.params.id as string;
    const { status, estimatedDelivery, notes } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (estimatedDelivery) data.estimatedDelivery = new Date(estimatedDelivery);
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        tableName: 'Order',
        recordId: id,
        action: 'UPDATE',
        changedBy: req.user.id,
        newValues: JSON.stringify({
          status: updated.status,
          estimatedDelivery: updated.estimatedDelivery,
          notes: updated.notes,
        }),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `Order ${updated.orderNumber} successfully updated to ${updated.status}`,
    });
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error updating order' });
  }
};
