import { db } from '../config/database';
import { LiveChatMessage } from '../models/types';

export class LiveChatRepository {
  public async getMessages(videoId: string): Promise<LiveChatMessage[]> {
    return db.liveChat[videoId] ? [...db.liveChat[videoId]] : [];
  }

  public async addMessage(videoId: string, message: LiveChatMessage): Promise<LiveChatMessage> {
    if (!db.liveChat[videoId]) {
      db.liveChat[videoId] = [];
    }
    db.liveChat[videoId].push(message);
    return message;
  }
}

export const liveChatRepository = new LiveChatRepository();
