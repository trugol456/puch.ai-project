export interface StorageAdapter {
  uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string
  ): Promise<string>;
  
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
  
  deleteFile(bucket: string, path: string): Promise<void>;
}

export interface UploadResult {
  path: string;
  url: string;
}