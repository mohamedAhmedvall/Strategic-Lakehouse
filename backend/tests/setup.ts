import { prisma } from '../src/lib/prisma.js';

const cleanDb = async () => {
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany();
};

beforeAll(async () => {
  await prisma.$connect();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
