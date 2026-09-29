import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  JWT_SECRET: process.env.JWT_SECRET || 'viewtube_jwt_development_secret_key_change_in_production',
  STORAGE_DIR: process.env.STORAGE_DIR || './public/videos',
};
