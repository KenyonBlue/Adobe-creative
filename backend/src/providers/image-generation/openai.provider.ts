import OpenAI from 'openai';
import { config } from '../../config';
import { ImageGenerationProvider, GenerationOptions } from './index';

type DalleSize = '1024x1024' | '1792x1024' | '1024x1792';
type GptImageSize = '1024x1024' | '1536x1024' | '1024x1536' | 'auto';

const FALLBACK_MODELS = ['gpt-image-1', 'dall-e-2'];

export class OpenAIImageProvider implements ImageGenerationProvider {
  private client: OpenAI;
  private activeModel: string | null = null;

  constructor() {
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
  }

  getName(): string {
    return `openai-${this.activeModel ?? config.openaiImageModel}`;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(config.openaiApiKey);
  }

  async generateImage(prompt: string, options?: GenerationOptions): Promise<Buffer> {
    const models = this.getModelsToTry();
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const buffer = await this.tryGenerateWithModel(model, prompt, options);
        if (this.activeModel !== model) {
          console.log(`[image-gen] Using model: ${model}`);
        }
        this.activeModel = model;
        return buffer;
      } catch (err) {
        if (this.isRetryableModelError(err)) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[image-gen] Model "${model}" unavailable: ${lastError.message}`);
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error('No compatible OpenAI image model available');
  }

  private getModelsToTry(): string[] {
    const preferred = this.activeModel ?? config.openaiImageModel;
    return [preferred, ...FALLBACK_MODELS].filter(
      (model, index, all) => all.indexOf(model) === index
    );
  }

  private isRetryableModelError(err: unknown): boolean {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    return (
      message.includes('does not exist') ||
      message.includes('model_not_found') ||
      message.includes('unknown model') ||
      message.includes('not supported') ||
      message.includes('invalid model')
    );
  }

  private async tryGenerateWithModel(
    model: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<Buffer> {
    const size = this.resolveSize(model, options?.width, options?.height);

    const params: Record<string, unknown> = {
      model,
      prompt,
      n: 1,
      size,
    };

    const response = await this.client.images.generate(
      params as unknown as OpenAI.Images.ImageGenerateParams
    );
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

    if (model === 'dall-e-2') {
      return '1024x1024';
    }

    if (model.startsWith('dall-e')) {
      if (ratio > 1.3) return '1792x1024';
      if (ratio < 0.77) return '1024x1792';
      return '1024x1024';
    }

    if (ratio > 1.3) return '1536x1024';
    if (ratio < 0.77) return '1024x1536';
    return '1024x1024';
  }
}
