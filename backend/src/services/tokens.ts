import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AccessTokenPayload = {
  sub: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
};

export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const signRefreshToken = (payload: AccessTokenPayload) => {
  return jwt.sign(
    { ...payload, nonce: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d` }
  );
};

export const verifyRefreshToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessTokenPayload;
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const refreshTokenExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + env.JWT_REFRESH_TTL_DAYS);
  return date;
};
