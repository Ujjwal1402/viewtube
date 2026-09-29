import { Router } from 'express';
import videoRoutes from './video.routes';
import commentRoutes from './comment.routes';
import authRoutes from './auth.routes';
import liveChatRoutes from './liveChat.routes';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'ViewTube API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

apiRouter.use('/videos', videoRoutes);
apiRouter.use('/', commentRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/live', liveChatRoutes);

export default apiRouter;
