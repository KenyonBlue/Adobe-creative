import sharp from 'sharp';
import { ImageGenerationProvider, GenerationOptions } from './image-generation.provider';

export class MockImageProvider implements ImageGenerationProvider {
  getName(): string {
    return 'mock';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateImage(prompt: string, options?: GenerationOptions): Promise<Buffer> {
    const width = options?.width ?? 1024;
    const height = options?.height ?? 1024;

    const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue1}, 65%, 45%);stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(${hue2}, 55%, 35%);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect x="0" y="0" width="100%" height="30%" fill="rgba(0,0,0,0.15)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(width / 20)}" 
              fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.9">
          AI Generated Asset
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${Math.floor(width / 35)}" 
              fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.6">
          (Mock Provider)
        </text>
      </svg>
    `;

    return sharp(Buffer.from(svg)).png().toBuffer();
  }
}
