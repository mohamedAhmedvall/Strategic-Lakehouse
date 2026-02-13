import { DoctorApprovalStatus, Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

const statusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});

router.get('/doctor-registrations', async (req, res) => {
  const parsed = z.object({
    status: z.nativeEnum(DoctorApprovalStatus).optional()
  }).safeParse(req.query);

  const status = parsed.success ? parsed.data.status : undefined;

  const registrations = await prisma.doctorProfile.findMany({
    where: status ? { approvalStatus: status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          isActive: true
        }
      }
    }
  });

  return res.json({ registrations });
});

router.patch('/doctor-registrations/:doctorProfileId/status', async (req, res) => {
  const { doctorProfileId } = req.params;
  const body = statusSchema.parse(req.body);

  const existing = await prisma.doctorProfile.findUnique({ where: { id: doctorProfileId } });
  if (!existing) {
    return res.status(404).json({ message: 'Doctor registration not found' });
  }

  const updated = await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
      approvalStatus: body.status,
      approvedAt: body.status === 'APPROVED' ? new Date() : null,
      approvedByUserId: req.auth!.userId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          isActive: true
        }
      }
    }
  });

  return res.json({ registration: updated });
});

router.get('/users', async (req, res) => {
  const parsed = z.object({ role: z.nativeEnum(Role).optional() }).safeParse(req.query);
  const role = parsed.success ? parsed.data.role : undefined;

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      doctorProfile: {
        select: {
          id: true,
          specialty: true,
          city: true,
          approvalStatus: true
        }
      }
    }
  });

  return res.json({ users });
});

router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  if (userId === req.auth!.userId) {
    return res.status(400).json({ message: 'Admin cannot delete self' });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return res.status(404).json({ message: 'User not found' });
  }

  await prisma.user.delete({ where: { id: userId } });
  return res.status(204).send();
});

export default router;
