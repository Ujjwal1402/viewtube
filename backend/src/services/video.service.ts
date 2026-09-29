import { videoRepository } from '../repositories/video.repository';
import { Video } from '../models/types';

export class VideoService {
  public async getVideos(query?: string, category?: string): Promise<Video[]> {
    return videoRepository.search(query, category);
  }

  public async getVideoById(id: string): Promise<Video | null> {
    return videoRepository.findById(id);
  }

  public async getRecommendations(currentVideoId: string): Promise<Video[]> {
    const all = await videoRepository.findAll();
    return all.filter((v) => v.id !== currentVideoId);
  }

  public async createVideo(videoData: Partial<Video>): Promise<Video> {
    const newVideo: Video = {
      id: videoData.id || `vid-${Date.now()}`,
      title: videoData.title || 'Untitled Video',
      description: videoData.description || '',
      videoUrl: videoData.videoUrl || '',
      thumbnailUrl: videoData.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      duration: videoData.duration || 0,
      views: 0,
      createdAt: 'Just now',
      category: videoData.category || 'General',
      likes: 0,
      dislikes: 0,
      tags: videoData.tags || [],
      isUserUpload: true,
      channel: videoData.channel || {
        id: 'user-current',
        name: 'Alex Rivera',
        handle: '@alexrivera_studio',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        subscribers: 14200,
      },
    };

    return videoRepository.create(newVideo);
  }

  public async recordView(id: string): Promise<number | null> {
    return videoRepository.incrementViews(id);
  }

  public async toggleLike(id: string, isLike: boolean): Promise<{ likes: number; dislikes: number } | null> {
    return videoRepository.toggleLike(id, isLike);
  }

  public async deleteVideo(id: string): Promise<boolean> {
    return videoRepository.delete(id);
  }
}

export const videoService = new VideoService();
