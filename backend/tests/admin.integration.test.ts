import bcrypt from 'bcryptjs';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

describe('admin workflow', () => {
  it('allows admin to approve doctor registrations and delete users', async () => {
    const adminPassword = 'Admin12345!';
    await prisma.user.create({
      data: {
        email: 'admin@maurisante.mr',
        name: 'Admin',
        role: 'ADMIN',
        passwordHash: await bcrypt.hash(adminPassword, 10)
      }
    });

    const doctorSignup = await request(app).post('/api/auth/signup').send({
      name: 'Dr Test',
      email: 'dr.test@maurisante.mr',
      password: 'Password123!',
      role: 'DOCTOR',
      specialty: 'Cardiologie',
      city: 'Nouakchott',
      location: 'Tevragh Zeina',
      licenseNumber: 'LIC-001'
    });

    expect(doctorSignup.status).toBe(201);
    expect(doctorSignup.body.user.doctorProfile.approvalStatus).toBe('PENDING');

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@maurisante.mr',
      password: adminPassword
    });

    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.tokens.accessToken as string;

    const pending = await request(app)
      .get('/api/admin/doctor-registrations?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(pending.status).toBe(200);
    expect(pending.body.registrations).toHaveLength(1);

    const doctorProfileId = pending.body.registrations[0].id as string;

    const approved = await request(app)
      .patch(`/api/admin/doctor-registrations/${doctorProfileId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    expect(approved.status).toBe(200);
    expect(approved.body.registration.approvalStatus).toBe('APPROVED');

    const patientSignup = await request(app).post('/api/auth/signup').send({
      name: 'Patient A',
      email: 'patient.a@maurisante.mr',
      password: 'Password123!',
      role: 'PATIENT'
    });

    expect(patientSignup.status).toBe(201);
    const patientId = patientSignup.body.user.id as string;

    const deleted = await request(app)
      .delete(`/api/admin/users/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleted.status).toBe(204);

    const users = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(users.status).toBe(200);
    expect(users.body.users.some((u: { id: string }) => u.id === patientId)).toBe(false);
  });

  it('blocks non-admin from admin endpoints', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Patient',
      email: 'patient.block@maurisante.mr',
      password: 'Password123!',
      role: 'PATIENT'
    });

    const login = await request(app).post('/api/auth/login').send({
      email: 'patient.block@maurisante.mr',
      password: 'Password123!'
    });

    const token = login.body.tokens.accessToken as string;
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
