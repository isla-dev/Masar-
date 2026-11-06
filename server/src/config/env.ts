import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 5000),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  // Public origin the backend itself is reachable at — used to build absolute
  // URLs for uploaded files (thumbnails, lecture content, certificates) so
  // they resolve correctly even though the frontend runs on a different
  // origin/port in development. In production this should be your API's
  // public domain (e.g. https://api.example.com).
  API_BASE_URL: process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`,

  DATABASE_URL: required('DATABASE_URL'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 200),

  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER ?? 'chargily',

  // Chargily Pay (CIB + EDAHABIA, DZD) — get keys from https://pay.chargily.com
  CHARGILY_API_KEY: process.env.CHARGILY_API_KEY ?? '',
  CHARGILY_MODE: (process.env.CHARGILY_MODE as 'test' | 'live') ?? 'test',
};
