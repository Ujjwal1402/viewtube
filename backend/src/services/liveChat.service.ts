import { liveChatRepository } from '../repositories/liveChat.repository';
import { LiveChatMessage } from '../models/types';

export class LiveChatService {
  public async getMessages(videoId: string): Promise<LiveChatMessage[]> {
    return liveChatRepository.getMessages(videoId);
  }

  public async sendMessage(
    videoId: string,
    user: { id: string; name: string; avatarUrl: string },
    text: string,
    isSuperChat?: boolean,
    superChatAmount?: string,
    superChatColor?: string
  ): Promise<LiveChatMessage> {
    const message: LiveChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSuperChat: !!isSuperChat,
      superChatAmount,
      superChatColor,
    };

    return liveChatRepository.addMessage(videoId, message);
  }
}

export const liveChatService = new LiveChatService();
