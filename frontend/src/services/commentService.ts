import { request } from './api';
import { Comment, CommentAuthor } from '../types';

export class FrontendCommentService {
  public async fetchComments(videoId: string): Promise<Comment[]> {
    const res = await request<{ success: boolean; count: number; data: Comment[] }>(
      `/videos/${videoId}/comments`
    );
    return res.data;
  }

  public async addComment(
    videoId: string,
    content: string,
    author: CommentAuthor,
    parentId?: string | null
  ): Promise<Comment> {
    const res = await request<{ success: boolean; data: Comment }>(`/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, author, parentId }),
    });
    return res.data;
  }

  public async toggleLike(
    videoId: string,
    commentId: string,
    parentId?: string | null
  ): Promise<Comment> {
    const res = await request<{ success: boolean; data: Comment }>(
      `/videos/${videoId}/comments/${commentId}/like`,
      {
        method: 'POST',
        body: JSON.stringify({ parentId }),
      }
    );
    return res.data;
  }
}

export const commentService = new FrontendCommentService();
