import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { config } from './config';
import apiRoutes from './routes/index';

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(config.storageRoot, { recursive: true }),
    fs.mkdir(config.outputsRoot, { recursive: true }),
    fs.mkdir(config.uploadsRoot, { recursive: true }),
  ]);
}

async function main() {
  await ensureDirectories();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRoutes);

  app.use('/api/outputs', express.static(config.outputsRoot));
  app.use('/api/uploads', express.static(config.uploadsRoot));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.listen(config.port, () => {
    console.log(`Creative Automation API running on http://localhost:${config.port}`);
    console.log(`Outputs: ${path.resolve(config.outputsRoot)}`);
    console.log(`Uploads: ${path.resolve(config.uploadsRoot)}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
