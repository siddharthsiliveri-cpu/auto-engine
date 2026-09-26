import { Request, Response } from 'express';
import prisma from '../prisma';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const whereClause: any = {};
    if (projectId) whereClause.projectId = String(projectId);

    const reviews = await prisma.engineeringReview.findMany({
      where: whereClause,
      include: {
        project: true,
        reviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, title, reviewType, score, comments, status = 'APPROVED' } = req.body;
    let reviewerId = req.user?.id;

    if (!reviewerId) {
      const defaultEngineer = await prisma.user.findFirst({
        where: { role: { name: 'ENGINEER' } },
      });
      reviewerId = defaultEngineer?.id;
    }

    const review = await prisma.engineeringReview.create({
      data: {
        projectId,
        reviewerId: reviewerId!,
        title,
        reviewType,
        score: score ? Number(score) : null,
        comments,
        status,
      },
      include: {
        project: true,
        reviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        tableName: 'EngineeringReview',
        recordId: review.id,
        action: 'INSERT',
        changedBy: reviewerId,
        newValues: JSON.stringify(review),
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
