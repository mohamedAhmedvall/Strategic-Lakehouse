import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

const createReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional()
});

router.post('/', async (req, res) => {
  const body = createReviewSchema.parse(req.body);

  const appointment = await prisma.appointment.findUnique({
    where: { id: body.appointmentId }
  });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  if (appointment.patientId !== req.auth!.userId && req.auth!.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const alreadyReviewed = await prisma.review.findUnique({ where: { appointmentId: body.appointmentId } });
  if (alreadyReviewed) {
    return res.status(409).json({ message: 'Review already exists for this appointment' });
  }

  const review = await prisma.review.create({
    data: {
      appointmentId: body.appointmentId,
      doctorProfileId: appointment.doctorProfileId,
      patientId: appointment.patientId,
      rating: body.rating,
      comment: body.comment
    }
  });

  return res.status(201).json({ review });
});

export default router;
