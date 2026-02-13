import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const query = z.object({
    city: z.string().optional(),
    specialty: z.string().optional(),
    q: z.string().optional()
  }).parse(req.query);

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      approvalStatus: 'APPROVED',
      city: query.city || undefined,
      specialty: query.specialty || undefined,
      OR: query.q ? [
        { specialty: { contains: query.q, mode: 'insensitive' } },
        { city: { contains: query.q, mode: 'insensitive' } },
        { location: { contains: query.q, mode: 'insensitive' } },
        { user: { name: { contains: query.q, mode: 'insensitive' } } }
      ] : undefined
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      },
      reviews: {
        select: { rating: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const data = doctors.map((doc) => {
    const reviewCount = doc.reviews.length;
    const averageRating = reviewCount === 0 ? null : doc.reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviewCount;

    return {
      id: doc.id,
      name: doc.user.name,
      specialty: doc.specialty,
      city: doc.city,
      location: doc.location,
      approvalStatus: doc.approvalStatus,
      reviewCount,
      averageRating
    };
  });

  return res.json({ doctors: data });
});

router.get('/:doctorProfileId/reviews', async (req, res) => {
  const { doctorProfileId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { doctorProfileId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    }
  });

  return res.json({ reviews });
});

export default router;
