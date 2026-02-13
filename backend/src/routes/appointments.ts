import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

const createAppointmentSchema = z.object({
  doctorProfileId: z.string().uuid(),
  forWho: z.string().min(2).max(120),
  startAt: z.string().datetime(),
  endAt: z.string().datetime()
}).refine((body) => new Date(body.endAt) > new Date(body.startAt), {
  message: 'endAt must be after startAt',
  path: ['endAt']
});

router.post('/', async (req, res) => {
  if (req.auth!.role !== 'PATIENT') {
    return res.status(403).json({ message: 'Only patients can create appointments' });
  }

  const body = createAppointmentSchema.parse(req.body);

  const doctor = await prisma.doctorProfile.findUnique({ where: { id: body.doctorProfileId } });
  if (!doctor || doctor.approvalStatus !== 'APPROVED') {
    return res.status(400).json({ message: 'Doctor is not available for booking' });
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.auth!.userId,
        doctorProfileId: body.doctorProfileId,
        forWho: body.forWho,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt)
      },
      include: {
        doctor: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Slot already booked' });
    }
    throw error;
  }
});

router.get('/me', async (req, res) => {
  const where = req.auth!.role === 'DOCTOR'
    ? { doctor: { userId: req.auth!.userId } }
    : { patientId: req.auth!.userId };

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { startAt: 'asc' },
    include: {
      doctor: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      patient: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return res.json({ appointments });
});

router.patch('/:appointmentId/status', async (req, res) => {
  const { appointmentId } = req.params;
  const body = z.object({ status: z.enum(['UPCOMING', 'COMPLETED', 'CANCELLED']) }).parse(req.body);

  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
  });

  if (!appt) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const isOwnerPatient = appt.patientId === req.auth!.userId;
  const isOwnerDoctor = appt.doctor.userId === req.auth!.userId;
  const isAdmin = req.auth!.role === 'ADMIN';

  if (!isOwnerPatient && !isOwnerDoctor && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: body.status }
  });

  return res.json({ appointment: updated });
});

export default router;
