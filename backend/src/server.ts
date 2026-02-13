import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const boot = async () => {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

boot().catch(async (err) => {
  console.error('Failed to boot backend', err);
  await prisma.$disconnect();
  process.exit(1);
});
