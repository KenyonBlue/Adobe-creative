import OpenAI from 'openai';
import { config } from '../../config';
import { ImageGenerationProvider, GenerationOptions } from './image-generation.provider';

type DalleSize = '1024x1024' | '1792x1024' | '1024x1792';
type GptImageSize = '1024x1024' | '1536x1024' | '1024x1536' | 'auto';

export class OpenAIImageProvider implements ImageGenerationProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
  }

  getName(): string {
    return `openai-${config.openaiImageModel}`;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(config.openaiApiKey);
  }

  async generateImage(prompt: string, options?: GenerationOptions): Promise<Buffer> {
    const model = config.openaiImageModel;
    const size = this.resolveSize(model, options?.width, options?.height);

    const params: OpenAI.Images.ImageGenerateParams = {
      model,
      prompt,
      n: 1,
      size,
    };

    // response_format is only supported for dall-e-2/dall-e-3; GPT image models reject it
    if (model.startsWith('dall-e')) {
      params.response_format = 'b64_json';
    }

    const response = await this.client.images.generate(params);
    return this.extractImageBuffer(response.data?.[0]);
  }

  private async extractImageBuffer(
    item: OpenAI.Images.Image | undefined
  ): Promise<Buffer> {
    if (!item) {
      throw new Error('OpenAI image generation returned no data');
    }

    if (item.b64_json) {
      return Buffer.from(item.b64_json, 'base64');
    }

    if (item.url) {
      const res = await fetch(item.url);
      if (!res.ok) {
        throw new Error(`Failed to download generated image: ${res.status}`);
      }
      return Buffer.from(await res.arrayBuffer());
    }

    throw new Error('OpenAI image generation returned no image data');
  }

  private resolveSize(
    model: string,
    width?: number,
    height?: number
  ): DalleSize | GptImageSize {
    if (!width || !height) return '1024x1024';

    const ratio = width / height;

    if (model.startsWith('dall-e')) {
      if (ratio > 1.3) return '1792x1024';
      if (ratio < 0.77) return '1024x1792';
      return '1024x1024';
    }

    // GPT image models
    if (ratio > 1.3) return '1536x1024';
    if (ratio < 0.77) return '1024x1536';
    return '1024x1024';
  }
}
