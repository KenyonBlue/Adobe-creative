import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';
import { CampaignBrief } from '../models/campaign-brief.model';
import { pipelineService } from '../services/pipeline.service';
import { campaignHistoryService } from '../services/campaign-history.service';
import { ValidationError } from '../utils/validators';

const router = Router();

// --- Campaign routes ---

router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const brief = req.body as CampaignBrief;
    const report = await pipelineService.run(brief);
    res.status(201).json({ status: 'completed', report });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Pipeline error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Pipeline execution failed',
    });
  }
});

router.get('/campaigns', async (_req: Request, res: Response) => {
  const campaigns = await campaignHistoryService.listCampaigns();
  res.json(campaigns);
});

router.get('/campaigns/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const report = await campaignHistoryService.loadReport(slug);
  if (!report) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json({ status: 'completed', report });
});

// --- Asset upload routes ---

const uploadStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(config.uploadsRoot, { recursive: true });
    cb(null, config.uploadsRoot);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.avif', '.gif', '.heic', '.heif', '.tiff', '.tif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  },
});

router.post('/assets/upload', upload.array('assets', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const uploaded = files.map((file) => ({
    originalName: file.originalname,
    path: `uploads/${file.filename}`,
    size: file.size,
  }));

  res.status(201).json({ uploaded });
});

export default router;
