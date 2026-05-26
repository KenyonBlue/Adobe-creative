import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const projectRoot = path.resolve(__dirname, '../..');

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  openaiApiKey:
    process.env.OPENAI_API_KEY ||
    process.env['adobe-fde-creative-automation-poc'] ||
    '',
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
  storageRoot: path.resolve(process.env.STORAGE_ROOT || path.join(projectRoot, 'storage')),
  outputsRoot: path.resolve(process.env.OUTPUTS_ROOT || path.join(projectRoot, 'outputs')),
  uploadsRoot: path.resolve(process.env.UPLOADS_ROOT || path.join(projectRoot, 'uploads')),
  projectRoot,
};

export const ASPECT_RATIOS = {
  '1x1': { width: 1080, height: 1080, label: '1:1' },
  '9x16': { width: 1080, height: 1920, label: '9:16' },
  '16x9': { width: 1920, height: 1080, label: '16:9' },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;
