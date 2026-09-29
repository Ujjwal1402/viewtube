import { request } from './api';
import { LiveChatMessage } from '../types';

export class FrontendLiveChatService {
  public async fetchChat(videoId: string): Promise<LiveChatMessage[]> {
    const res = await request<{ success: boolean; count: number; data: LiveChatMessage[] }>(
      `/live/${videoId}/chat`
    );
    return res.data;
  }

  public async sendMessage(
    videoId: string,
    user: { id: string; name: string; avatarUrl: string },
    text: string,
    isSuperChat?: boolean,
    superChatAmount?: string,
    superChatColor?: string
  ): Promise<LiveChatMessage> {
    const res = await request<{ success: boolean; data: LiveChatMessage }>(`/live/${videoId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ user, text, isSuperChat, superChatAmount, superChatColor }),
    });
    return res.data;
  }
}

export const liveChatService = new FrontendLiveChatService();
