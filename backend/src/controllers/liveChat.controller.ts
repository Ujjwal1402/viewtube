import { Request, Response, NextFunction } from 'express';
import { liveChatService } from '../services/liveChat.service';

export class LiveChatController {
  public async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const messages = await liveChatService.getMessages(videoId);
      res.json({ success: true, count: messages.length, data: messages });
    } catch (err) {
      next(err);
    }
  }

  public async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const { user, text, isSuperChat, superChatAmount, superChatColor } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Message cannot be empty' });
      }

      const sender = user || {
        id: 'user-current',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };

      const created = await liveChatService.sendMessage(
        videoId,
        sender,
        text,
        isSuperChat,
        superChatAmount,
        superChatColor
      );

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
}

export const liveChatController = new LiveChatController();
