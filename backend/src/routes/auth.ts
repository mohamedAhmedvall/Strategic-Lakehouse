import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { hashToken, refreshTokenExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/tokens.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['PATIENT', 'DOCTOR']),
  specialty: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(120).optional(),
  location: z.string().min(2).max(200).optional(),
  licenseNumber: z.string().min(3).max(120).optional()
}).superRefine((value, ctx) => {
  if (value.role === 'DOCTOR') {
    if (!value.specialty) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['specialty'], message: 'Specialty is required for doctors' });
    }
    if (!value.city) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['city'], message: 'City is required for doctors' });
    }
    if (!value.location) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['location'], message: 'Location is required for doctors' });
    }
    if (!value.licenseNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['licenseNumber'], message: 'License number is required for doctors' });
    }
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

const formatUser = (user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  doctorProfile: null | {
    id: string;
    specialty: string;
    city: string;
    location: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  doctorProfile: user.doctorProfile
});

const issueTokens = async (userId: string, role: Role) => {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId, role });

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiryDate()
    }
  });

  return { accessToken, refreshToken };
};

router.post('/signup', async (req, res) => {
  const body = signupSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ message: 'Email already used' });
  }

  if (body.role === 'DOCTOR') {
    const licenseExists = await prisma.doctorProfile.findUnique({ where: { licenseNumber: body.licenseNumber! } });
    if (licenseExists) {
      return res.status(409).json({ message: 'License number already used' });
    }
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash,
        role: body.role
      }
    });

    if (body.role === 'DOCTOR') {
      await tx.doctorProfile.create({
        data: {
          userId: user.id,
          specialty: body.specialty!,
          city: body.city!,
          location: body.location!,
          licenseNumber: body.licenseNumber!
        }
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        doctorProfile: {
          select: {
            id: true,
            specialty: true,
            city: true,
            location: true,
            approvalStatus: true
          }
        }
      }
    });
  });

  const tokens = await issueTokens(created.id, created.role);

  return res.status(201).json({
    user: formatUser(created),
    tokens
  });
});

router.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
    include: {
      doctorProfile: {
        select: {
          id: true,
          specialty: true,
          city: true,
          location: true,
          approvalStatus: true
        }
      }
    }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(body.password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const tokens = await issueTokens(user.id, user.role);

  return res.json({
    user: formatUser(user),
    tokens
  });
});

router.post('/refresh', async (req, res) => {
  const body = refreshSchema.parse(req.body);

  let payload: { sub: string; role: Role };
  try {
    payload = verifyRefreshToken(body.refreshToken) as { sub: string; role: Role };
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const tokenHash = hashToken(body.refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: 'Refresh token expired or revoked' });
  }

  if (stored.userId !== payload.sub || !stored.user.isActive) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  const accessToken = signAccessToken({ sub: stored.user.id, role: stored.user.role });
  const refreshToken = signRefreshToken({ sub: stored.user.id, role: stored.user.role });

  await prisma.refreshToken.create({
    data: {
      userId: stored.user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiryDate()
    }
  });

  return res.json({ tokens: { accessToken, refreshToken } });
});

router.post('/logout', requireAuth, async (req, res) => {
  const body = refreshSchema.safeParse(req.body);
  if (body.success) {
    const tokenHash = hashToken(body.data.refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, userId: req.auth!.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
  return res.status(204).send();
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    include: {
      doctorProfile: {
        select: {
          id: true,
          specialty: true,
          city: true,
          location: true,
          approvalStatus: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: formatUser(user) });
});

export default router;
