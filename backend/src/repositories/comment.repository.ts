import { db } from '../config/database';
import { Comment } from '../models/types';

export class CommentRepository {
  public async findByVideoId(videoId: string): Promise<Comment[]> {
    return db.comments[videoId] ? [...db.comments[videoId]] : [];
  }

  public async addComment(videoId: string, comment: Comment): Promise<Comment> {
    if (!db.comments[videoId]) {
      db.comments[videoId] = [];
    }

    if (!comment.parentId) {
      db.comments[videoId].unshift(comment);
    } else {
      // Add nested reply to parent
      const parent = db.comments[videoId].find((c) => c.id === comment.parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(comment);
      } else {
        db.comments[videoId].unshift(comment);
      }
    }

    return comment;
  }

  public async toggleLike(videoId: string, commentId: string, parentId?: string | null): Promise<Comment | null> {
    const list = db.comments[videoId];
    if (!list) return null;

    if (!parentId) {
      const comm = list.find((c) => c.id === commentId);
      if (!comm) return null;
      comm.isLiked = !comm.isLiked;
      comm.likes = comm.isLiked ? comm.likes + 1 : Math.max(0, comm.likes - 1);
      return comm;
    } else {
      const parent = list.find((c) => c.id === parentId);
      if (!parent || !parent.replies) return null;
      const reply = parent.replies.find((r) => r.id === commentId);
      if (!reply) return null;
      reply.isLiked = !reply.isLiked;
      reply.likes = reply.isLiked ? reply.likes + 1 : Math.max(0, reply.likes - 1);
      return reply;
    }
  }
}

export const commentRepository = new CommentRepository();
