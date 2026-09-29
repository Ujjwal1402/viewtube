import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';
import { InputValidators } from '../validators/input.validators';

export class CommentController {
  public async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const comments = await commentService.getComments(videoId);
      res.json({ success: true, count: comments.length, data: comments });
    } catch (err) {
      next(err);
    }
  }

  public async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const { content, author, parentId } = req.body;

      const validation = InputValidators.validateComment(content);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const commentAuthor = author || {
        id: 'user-current',
        name: 'Alex Rivera',
        handle: '@alexrivera_studio',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };

      const created = await commentService.addComment(videoId, content, commentAuthor, parentId);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  public async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId, commentId } = req.params;
      const { parentId } = req.body;

      const updated = await commentService.toggleLike(videoId, commentId, parentId);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const commentController = new CommentController();
