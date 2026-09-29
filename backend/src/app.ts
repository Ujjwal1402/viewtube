import express, { Express } from 'express';
import apiRoutes from './routes';
import { requestLogger } from './middleware';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(requestLogger);

  // Mount API endpoints
  app.use('/api', apiRoutes);

  return app;
}

export const app = createApp();
export default app;