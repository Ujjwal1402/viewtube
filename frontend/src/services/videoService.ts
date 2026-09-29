import { request } from './api';
import { Video } from '../types';

export interface VideosApiResponse {
  success: boolean;
  count: number;
  data: Video[];
}

export interface VideoDetailApiResponse {
  success: boolean;
  data: Video;
}

export class FrontendVideoService {
  public async fetchVideos(search?: string, category?: string): Promise<Video[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (category && category !== 'All') params.append('category', category);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request<VideosApiResponse>(`/videos${queryStr}`);
    return res.data;
  }

  public async fetchVideoById(id: string): Promise<Video> {
    const res = await request<VideoDetailApiResponse>(`/videos/${id}`);
    return res.data;
  }

  public async fetchRecommendations(id: string): Promise<Video[]> {
    const res = await request<VideosApiResponse>(`/videos/${id}/recommendations`);
    return res.data;
  }

  public async recordView(id: string): Promise<number> {
    const res = await request<{ success: boolean; views: number }>(`/videos/${id}/view`, {
      method: 'POST',
    });
    return res.views;
  }

  public async toggleLike(id: string, isLike: boolean): Promise<{ likes: number; dislikes: number }> {
    const res = await request<{ success: boolean; data: { likes: number; dislikes: number } }>(
      `/videos/${id}/like`,
      {
        method: 'POST',
        body: JSON.stringify({ isLike }),
      }
    );
    return res.data;
  }

  public async deleteVideo(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/videos/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  }
}

export const videoService = new FrontendVideoService();
