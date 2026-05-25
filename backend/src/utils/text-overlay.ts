import sharp from 'sharp';
import { AspectRatioKey } from '../config';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function overlayCampaignMessage(
  imageBuffer: Buffer,
  message: string,
  aspectRatio: AspectRatioKey,
  brandColor = '#1473E6'
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 1080;
  const height = metadata.height ?? 1080;

  const fontSize = Math.max(28, Math.floor(width / 22));
  const maxChars = Math.floor(width / (fontSize * 0.55));
  const lines = wrapText(message, maxChars);
  const lineHeight = fontSize * 1.3;
  const textBlockHeight = lines.length * lineHeight + 40;
  const startY = aspectRatio === '9x16' ? 80 : 60;

  const textElements = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${startY + 30 + i * lineHeight}" font-family="Arial, Helvetica, sans-serif" ` +
        `font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">${escapeXml(line)}</text>`
    )
    .join('\n');

  const overlaySvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${textBlockHeight}" fill="rgba(0,0,0,0.45)"/>
      <rect x="0" y="0" width="${width}" height="4" fill="${brandColor}"/>
      ${textElements}
    </svg>
  `;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function resizeToAspectRatio(
  imageBuffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
}

export async function compositeLogo(
  imageBuffer: Buffer,
  logoBuffer: Buffer
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 1080;
  const logoSize = Math.floor(width * 0.12);

  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: 'inside' })
    .png()
    .toBuffer();

  const logoMeta = await sharp(resizedLogo).metadata();
  const logoWidth = logoMeta.width ?? logoSize;
  const logoHeight = logoMeta.height ?? logoSize;

  return sharp(imageBuffer)
    .composite([
      {
        input: resizedLogo,
        top: 20,
        left: width - logoWidth - 20,
      },
    ])
    .png()
    .toBuffer();
}
