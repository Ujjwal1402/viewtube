import { createServer } from 'vite';
import { app } from './backend/src/app';
import { ENV } from './backend/src/config/env';
import { errorHandler } from './backend/src/middleware';

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // 1. Mount Vite middleware to serve HTML/React
    app.use(vite.middlewares);
  } else {
    const express = await import('express');
    const path = await import('path');
    app.use(express.default.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  // 2. Mount central error handler AT THE VERY END
  app.use(errorHandler);

  const port = ENV.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[ViewTube Full-Stack Server] running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});