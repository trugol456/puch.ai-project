import { promises as fs } from 'fs';
import path from 'path';
import { StorageAdapter } from './types';

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor(baseDir: string = './uploads') {
    this.baseDir = baseDir;
  }

  async uploadFile(
    bucket: string,
    filePath: string,
    file: Buffer,
    contentType: string
  ): Promise<string> {
    const fullPath = path.join(this.baseDir, bucket, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file);

    return filePath;
  }

  async getSignedUrl(
    bucket: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    // For local development, return a direct file URL
    // In production, you'd implement proper signed URLs
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/files/${bucket}/${filePath}`;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, bucket, filePath);
    
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    }
  }
}