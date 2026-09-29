import { db } from '../config/database';
import { Video } from '../models/types';

export class VideoRepository {
  public async findAll(): Promise<Video[]> {
    return [...db.videos];
  }

  public async findById(id: string): Promise<Video | null> {
    const video = db.videos.find((v) => v.id === id);
    return video ? { ...video } : null;
  }

  public async search(query?: string, category?: string): Promise<Video[]> {
    let result = [...db.videos];

    if (category && category !== 'All') {
      if (category === 'Live Now') {
        result = result.filter((v) => v.isLive);
      } else if (category === 'Your Uploads') {
        result = result.filter((v) => v.isUserUpload);
      } else {
        result = result.filter((v) => v.category.toLowerCase() === category.toLowerCase());
      }
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.channel.name.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public async create(video: Video): Promise<Video> {
    db.videos.unshift(video);
    return video;
  }

  public async incrementViews(id: string): Promise<number | null> {
    const video = db.videos.find((v) => v.id === id);
    if (!video) return null;
    video.views += 1;
    return video.views;
  }

  public async toggleLike(id: string, isLike: boolean): Promise<{ likes: number; dislikes: number } | null> {
    const video = db.videos.find((v) => v.id === id);
    if (!video) return null;
    if (isLike) {
      video.likes += 1;
    } else {
      video.dislikes += 1;
    }
    return { likes: video.likes, dislikes: video.dislikes };
  }

  public async delete(id: string): Promise<boolean> {
    const initialLen = db.videos.length;
    db.videos = db.videos.filter((v) => v.id !== id);
    return db.videos.length < initialLen;
  }
}

export const videoRepository = new VideoRepository();
