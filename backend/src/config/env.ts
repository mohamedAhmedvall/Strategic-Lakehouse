import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseNumber(process.env.PORT, 4000),
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL ?? '15m',
  JWT_REFRESH_TTL_DAYS: parseNumber(process.env.JWT_REFRESH_TTL_DAYS, 30),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'admin@maurisante.mr',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'Admin12345!',
  ADMIN_NAME: process.env.ADMIN_NAME ?? 'MauriSante Admin'
};
