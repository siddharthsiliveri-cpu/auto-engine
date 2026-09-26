import { Request, Response } from 'express';
import prisma from '../prisma';

export const getComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, status, supplierId } = req.query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = { code: String(category).toUpperCase() };
    }

    if (status) {
      whereClause.status = String(status).toUpperCase();
    }

    if (search) {
      const q = String(search);
      whereClause.OR = [
        { name: { contains: q } },
        { partNumber: { contains: q } },
        { manufacturer: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (supplierId) {
      whereClause.suppliers = {
        some: { supplierId: String(supplierId) },
      };
    }

    const components = await prisma.component.findMany({
      where: whereClause,
      include: {
        category: true,
        suppliers: {
          include: { supplier: true },
        },
        specifications: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: components.length, data: components });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.componentCategory.findMany({
      include: {
        _count: {
          select: { components: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { components: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComponentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        category: true,
        suppliers: {
          include: { supplier: true },
        },
        specifications: true,
        variants: {
          include: {
            variant: {
              include: { model: true },
            },
          },
        },
      },
    });

    if (!component) {
      res.status(404).json({ success: false, message: 'Component not found' });
      return;
    }

    res.json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      partNumber,
      name,
      description,
      manufacturer,
      weightKg,
      costUsd,
      meshType,
      supplierId,
      specifications = [],
    } = req.body;

    const component = await prisma.component.create({
      data: {
        categoryId,
        partNumber,
        name,
        description,
        manufacturer,
        weightKg: Number(weightKg),
        costUsd: Number(costUsd),
        meshType: meshType || 'body_panels',
        status: 'APPROVED',
        suppliers: supplierId
          ? {
              create: {
                supplierId,
                leadTimeDays: 21,
                unitCost: Number(costUsd) * 0.85,
              },
            }
          : undefined,
        specifications: {
          create: specifications.map((s: any) => ({
            specKey: s.specKey,
            specValue: s.specValue,
            unit: s.unit || null,
          })),
        },
      },
      include: {
        category: true,
        suppliers: { include: { supplier: true } },
        specifications: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        tableName: 'Component',
        recordId: component.id,
        action: 'INSERT',
        changedBy: req.user?.id,
        newValues: JSON.stringify(component),
      },
    });

    res.status(201).json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
