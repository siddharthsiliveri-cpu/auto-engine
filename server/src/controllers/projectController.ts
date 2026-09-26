import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.automotiveProject.findMany({
      include: {
        vehicleModels: {
          include: {
            variants: {
              include: {
                specifications: true,
              },
            },
          },
        },
        projectMembers: {
          include: {
            user: {
              include: { role: true },
            },
          },
        },
        milestones: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const project = await prisma.automotiveProject.findUnique({
      where: { id },
      include: {
        vehicleModels: {
          include: {
            variants: {
              include: {
                specifications: true,
                components: {
                  include: {
                    component: {
                      include: {
                        category: true,
                        suppliers: {
                          include: { supplier: true },
                        },
                        specifications: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        projectMembers: {
          include: {
            user: {
              include: { role: true },
            },
          },
        },
        milestones: {
          orderBy: { targetDate: 'asc' },
        },
        reviews: {
          include: {
            reviewer: true,
          },
          orderBy: { reviewDate: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectCode, name, description, budget, startDate, targetEndDate, status = 'CONCEPT' } = req.body;

    const project = await prisma.automotiveProject.create({
      data: {
        projectCode,
        name,
        description,
        budget: Number(budget),
        startDate: new Date(startDate),
        targetEndDate: new Date(targetEndDate),
        status,
        completionPercentage: 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        tableName: 'AutomotiveProject',
        recordId: project.id,
        action: 'INSERT',
        changedBy: req.user?.id,
        newValues: JSON.stringify(project),
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { isCompleted } = req.body;

    const milestoneBefore = await prisma.projectMilestone.findUnique({ where: { id } });
    if (!milestoneBefore) {
      res.status(404).json({ success: false, message: 'Milestone not found' });
      return;
    }

    const updatedMilestone = await prisma.projectMilestone.update({
      where: { id },
      data: {
        isCompleted: Boolean(isCompleted),
        completedAt: Boolean(isCompleted) ? new Date() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tableName: 'ProjectMilestone',
        recordId: id,
        action: 'UPDATE',
        changedBy: req.user?.id,
        oldValues: JSON.stringify({ isCompleted: milestoneBefore.isCompleted, title: milestoneBefore.title }),
        newValues: JSON.stringify({ isCompleted: updatedMilestone.isCompleted, completedAt: updatedMilestone.completedAt }),
      },
    });

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: milestoneBefore.projectId },
    });

    const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
    const completedWeight = milestones
      .filter((m) => m.isCompleted)
      .reduce((sum, m) => sum + m.weight, 0);

    const completionPercentage = totalWeight > 0 ? Number(((completedWeight / totalWeight) * 100).toFixed(1)) : 0;

    await prisma.automotiveProject.update({
      where: { id: milestoneBefore.projectId },
      data: {
        completionPercentage,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Milestone status updated and project completion recalculated',
      data: {
        milestone: updatedMilestone,
        projectCompletionPercentage: completionPercentage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateProjectCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: id },
    });

    const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
    const completedWeight = milestones
      .filter((m) => m.isCompleted)
      .reduce((sum, m) => sum + m.weight, 0);

    const completionPercentage = totalWeight > 0 ? Number(((completedWeight / totalWeight) * 100).toFixed(1)) : 0;

    const project = await prisma.automotiveProject.update({
      where: { id },
      data: { completionPercentage, updatedAt: new Date() },
    });

    res.json({
      success: true,
      procedure: 'calculate_project_completion',
      projectId: id,
      completionPercentage,
      project,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
