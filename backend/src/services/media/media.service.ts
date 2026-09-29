import path from 'path';
import { ENV } from '../../config/env';

export class MediaService {
  private allowedVideoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  private allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  public validateVideoType(mimeType: string): boolean {
    return this.allowedVideoMimeTypes.includes(mimeType.toLowerCase());
  }

  public validateImageType(mimeType: string): boolean {
    return this.allowedImageMimeTypes.includes(mimeType.toLowerCase());
  }

  public getStorageDirectory(): string {
    return path.resolve(process.cwd(), ENV.STORAGE_DIR);
  }

  public formatDurationSeconds(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export const mediaService = new MediaService();
