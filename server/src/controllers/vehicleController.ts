import { Request, Response } from 'express';
import prisma from '../prisma';

export const getModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const models = await prisma.vehicleModel.findMany({
      include: {
        project: true,
        variants: {
          include: {
            specifications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: models.length, data: models });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModelByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code);
    const model = await prisma.vehicleModel.findUnique({
      where: { modelCode: code },
      include: {
        project: true,
        variants: {
          include: {
            specifications: true,
            components: {
              include: {
                component: {
                  include: {
                    category: true,
                    specifications: true,
                    suppliers: {
                      include: { supplier: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!model) {
      res.status(404).json({ success: false, message: 'Vehicle model not found' });
      return;
    }

    res.json({ success: true, data: model });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVariantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const variant = await prisma.vehicleVariant.findUnique({
      where: { id },
      include: {
        model: {
          include: { project: true },
        },
        specifications: true,
        components: {
          include: {
            component: {
              include: {
                category: true,
                specifications: true,
                suppliers: {
                  include: { supplier: true },
                },
              },
            },
          },
        },
      },
    });

    if (!variant) {
      res.status(404).json({ success: false, message: 'Vehicle variant not found' });
      return;
    }

    res.json({ success: true, data: variant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
