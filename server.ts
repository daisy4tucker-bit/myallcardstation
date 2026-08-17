import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/src/routes/index.js';
import { errorHandler } from './backend/src/middleware/errorHandler.js';
import { runMigrations } from './backend/src/database/migrate.js';
import { seedDatabase } from './backend/src/database/seed.js';

let __filename: string;
let __dirname: string;

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  // Fallback for CommonJS bundled version
  __filename = process.argv[1] || process.cwd();
  __dirname = path.dirname(__filename);
}

// Ensure we're in the right directory for production
if (process.env.NODE_ENV === 'production') {
  // When bundled, __dirname points to dist/, so go up one level
  if (__dirname.includes('dist')) {
    __dirname = path.dirname(__dirname);
  }
}

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
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      console.log('Attempting to serve index.html from:', indexPath);
      res.sendFile(indexPath);
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
