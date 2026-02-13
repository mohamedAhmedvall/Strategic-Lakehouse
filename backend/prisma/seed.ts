import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { prisma } from '../src/lib/prisma.js';

const seed = async () => {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL.toLowerCase() },
    update: {
      name: env.ADMIN_NAME,
      role: 'ADMIN',
      isActive: true,
      passwordHash
    },
    create: {
      email: env.ADMIN_EMAIL.toLowerCase(),
      name: env.ADMIN_NAME,
      role: 'ADMIN',
      isActive: true,
      passwordHash
    }
  });

  console.log(`Admin ready: ${admin.email}`);
};

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
