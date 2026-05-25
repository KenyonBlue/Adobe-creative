export interface GenerationOptions {
  width?: number;
  height?: number;
}

export interface ImageGenerationProvider {
  generateImage(prompt: string, options?: GenerationOptions): Promise<Buffer>;
  isAvailable(): Promise<boolean>;
  getName(): string;
}
