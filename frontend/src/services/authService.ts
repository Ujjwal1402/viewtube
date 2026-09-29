import { request } from './api';
import { UserAccount } from '../types';

export class FrontendAuthService {
  public async login(emailOrHandle: string): Promise<UserAccount> {
    const res = await request<{ success: boolean; data: UserAccount; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrHandle }),
    });
    return res.data;
  }

  public async signup(name: string, email: string, handle: string): Promise<UserAccount> {
    const res = await request<{ success: boolean; data: UserAccount; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, handle }),
    });
    return res.data;
  }

  public async updateProfile(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    const res = await request<{ success: boolean; data: UserAccount }>('/auth/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, ...updates }),
    });
    return res.data;
  }

  public async toggleSubscription(
    userId: string,
    channelId: string
  ): Promise<{ isSubscribed: boolean; subscribers: number }> {
    const res = await request<{
      success: boolean;
      data: { isSubscribed: boolean; subscribers: number };
    }>(`/auth/channels/${channelId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return res.data;
  }
}

export const authService = new FrontendAuthService();
