import fs from 'fs/promises';
import path from 'path';

export interface StorageProvider {
  saveAsset(assetPath: string, data: Buffer): Promise<string>;
  getAsset(assetPath: string): Promise<Buffer | null>;
  assetExists(assetPath: string): Promise<boolean>;
  listAssets(prefix: string): Promise<string[]>;
}

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly rootPath: string) {}

  private resolvePath(assetPath: string): string {
    const normalized = assetPath.replace(/^\/+/, '');
    const resolved = path.resolve(this.rootPath, normalized);
    if (!resolved.startsWith(path.resolve(this.rootPath))) {
      throw new Error(`Invalid asset path: ${assetPath}`);
    }
    return resolved;
  }

  async saveAsset(assetPath: string, data: Buffer): Promise<string> {
    const fullPath = this.resolvePath(assetPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
    return assetPath;
  }

  async getAsset(assetPath: string): Promise<Buffer | null> {
    const fullPath = this.resolvePath(assetPath);
    try {
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  async assetExists(assetPath: string): Promise<boolean> {
    const fullPath = this.resolvePath(assetPath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async listAssets(prefix: string): Promise<string[]> {
    const dirPath = this.resolvePath(prefix);
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true });
      const files: string[] = [];
      for (const entry of entries) {
        if (entry.isFile()) {
          const parent = entry.parentPath ?? (entry as { path?: string }).path ?? dirPath;
          const relative = path.relative(this.rootPath, path.join(parent, entry.name));
          files.push(relative.replace(/\\/g, '/'));
        }
      }
      return files;
    } catch {
      return [];
    }
  }
}
