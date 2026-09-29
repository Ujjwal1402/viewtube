import { commentRepository } from '../repositories/comment.repository';
import { Comment, CommentAuthor } from '../models/types';

export class CommentService {
  public async getComments(videoId: string): Promise<Comment[]> {
    return commentRepository.findByVideoId(videoId);
  }

  public async addComment(
    videoId: string,
    content: string,
    author: CommentAuthor,
    parentId?: string | null
  ): Promise<Comment> {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      videoId,
      parentId: parentId || null,
      author,
      content,
      createdAt: 'Just now',
      likes: 0,
      dislikes: 0,
      replies: [],
    };

    return commentRepository.addComment(videoId, newComment);
  }

  public async toggleLike(videoId: string, commentId: string, parentId?: string | null): Promise<Comment | null> {
    return commentRepository.toggleLike(videoId, commentId, parentId);
  }
}

export const commentService = new CommentService();
