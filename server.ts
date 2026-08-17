import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/src/routes/index.js';
import { errorHandler } from './backend/src/middleware/errorHandler.js';
import { runMigrations } from './backend/src/database/migrate.js';
import { seedDatabase } from './backend/src/database/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Run database migrations and seeding on boot
  try {
    await runMigrations();
    await seedDatabase();
  } catch (err) {
    console.error('Database migration/seed warning on boot:', err);
  }

  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Request logger in development
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // REST API Routes
  app.use('/api', apiRouter);

  // Central Error Handler for API routes
  app.use('/api', errorHandler);

  // Vite middleware for development & static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global fallback error handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AllCardStation Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
