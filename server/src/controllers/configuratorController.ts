import { Request, Response } from 'express';
import prisma from '../prisma';

export const saveConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { variantId, name, components = [], paintColor } = req.body;
    const userId = req.user?.id;

    if (!variantId || !name) {
      res.status(400).json({ success: false, message: 'Variant ID and Configuration name are required' });
      return;
    }

    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await prisma.user.findFirst();
      effectiveUserId = defaultUser?.id;
    }

    const variant = await prisma.vehicleVariant.findUnique({
      where: { id: variantId },
      include: { specifications: true },
    });

    if (!variant) {
      res.status(404).json({ success: false, message: 'Vehicle variant not found' });
      return;
    }

    const componentIds = components.map((c: any) => (typeof c === 'string' ? c : c.componentId));
    const selectedComponents = await prisma.component.findMany({
      where: { id: { in: componentIds } },
    });

    let totalPrice = variant.basePrice;
    let totalWeight = variant.specifications?.curbWeightKg || 1920;
    let calculatedRange = variant.specifications?.rangeKm || 520;

    for (const comp of selectedComponents) {
      totalPrice += comp.costUsd * 0.15;
      totalWeight += comp.weightKg * 0.05;
      if (comp.name.includes('105 kWh')) {
        calculatedRange += 90;
      }
    }

    const configCode = `CFG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const savedConfig = await prisma.$transaction(async (tx) => {
      const config = await tx.vehicleConfiguration.create({
        data: {
          variantId,
          userId: effectiveUserId!,
          configCode,
          name,
          totalPrice: Math.round(totalPrice),
          totalWeight: Math.round(totalWeight),
          calculatedRange: Math.round(calculatedRange),
          status: 'SAVED',
        },
      });

      for (const item of components) {
        const compId = typeof item === 'string' ? item : item.componentId;
        const color = typeof item === 'object' ? item.colorOverride || paintColor : paintColor;
        await tx.configurationComponent.create({
          data: {
            configurationId: config.id,
            componentId: compId,
            colorOverride: color || null,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tableName: 'VehicleConfiguration',
          recordId: config.id,
          action: 'INSERT',
          changedBy: effectiveUserId,
          newValues: JSON.stringify({ configCode, name, totalPrice, variantId }),
        },
      });

      return config;
    });

    const fullConfig = await prisma.vehicleConfiguration.findUnique({
      where: { id: savedConfig.id },
      include: {
        variant: {
          include: { model: true, specifications: true },
        },
        components: {
          include: {
            component: {
              include: { category: true, specifications: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle configuration saved to database successfully via ACID transaction',
      data: fullConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConfigurations = async (req: Request, res: Response): Promise<void> => {
  try {
    const configs = await prisma.vehicleConfiguration.findMany({
      include: {
        variant: {
          include: { model: true, specifications: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        components: {
          include: {
            component: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: configs.length, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConfigurationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const config = await prisma.vehicleConfiguration.findUnique({
      where: { id },
      include: {
        variant: {
          include: { model: true, specifications: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        components: {
          include: {
            component: {
              include: {
                category: true,
                specifications: true,
                suppliers: { include: { supplier: true } },
              },
            },
          },
        },
      },
    });

    if (!config) {
      res.status(404).json({ success: false, message: 'Configuration not found' });
      return;
    }

    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.vehicleConfiguration.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Configuration not found' });
      return;
    }

    await prisma.vehicleConfiguration.delete({ where: { id } });
    res.json({ success: true, message: 'Configuration deleted successfully from database' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const source = await prisma.vehicleConfiguration.findUnique({
      where: { id },
      include: { components: true },
    });

    if (!source) {
      res.status(404).json({ success: false, message: 'Source configuration not found' });
      return;
    }

    const newCode = `CFG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const duplicate = await prisma.$transaction(async (tx) => {
      const copy = await tx.vehicleConfiguration.create({
        data: {
          variantId: source.variantId,
          userId: source.userId,
          configCode: newCode,
          name: `${source.name} (Copy)`,
          totalPrice: source.totalPrice,
          totalWeight: source.totalWeight,
          calculatedRange: source.calculatedRange,
          status: 'SAVED',
        },
      });

      for (const comp of source.components) {
        await tx.configurationComponent.create({
          data: {
            configurationId: copy.id,
            componentId: comp.componentId,
            colorOverride: comp.colorOverride,
            customNotes: comp.customNotes,
          },
        });
      }

      return copy;
    });

    const fullDuplicate = await prisma.vehicleConfiguration.findUnique({
      where: { id: duplicate.id },
      include: {
        variant: { include: { model: true, specifications: true } },
        components: { include: { component: { include: { category: true } } } },
      },
    });

    res.status(201).json({ success: true, message: 'Configuration duplicated successfully', data: fullDuplicate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

