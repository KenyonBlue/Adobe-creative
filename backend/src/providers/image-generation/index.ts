import { MockImageProvider } from './mock.provider';
import { OpenAIImageProvider } from './openai.provider';

export interface GenerationOptions {
  width?: number;
  height?: number;
}

export interface ImageGenerationProvider {
  generateImage(prompt: string, options?: GenerationOptions): Promise<Buffer>;
  isAvailable(): Promise<boolean>;
  getName(): string;
}

export async function createImageGenerationProvider(): Promise<ImageGenerationProvider> {
  const openai = new OpenAIImageProvider();
  if (await openai.isAvailable()) {
    return openai;
  }
  return new MockImageProvider();
}
