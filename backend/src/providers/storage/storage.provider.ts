export interface StorageProvider {
  saveAsset(assetPath: string, data: Buffer): Promise<string>;
  getAsset(assetPath: string): Promise<Buffer | null>;
  assetExists(assetPath: string): Promise<boolean>;
  listAssets(prefix: string): Promise<string[]>;
}
