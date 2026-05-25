import { config } from '../../config';
import { ImageGenerationProvider } from './image-generation.provider';
import { MockImageProvider } from './mock.provider';
import { OpenAIImageProvider } from './openai.provider';

export async function createImageGenerationProvider(): Promise<ImageGenerationProvider> {
  const openai = new OpenAIImageProvider();
  if (await openai.isAvailable()) {
    return openai;
  }
  return new MockImageProvider();
}

export function getProviderName(provider: ImageGenerationProvider): string {
  return provider.getName();
}
