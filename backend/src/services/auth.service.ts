import { userRepository } from '../repositories/user.repository';
import { UserAccount } from '../models/types';

export class AuthService {
  public async login(identifier: string): Promise<UserAccount | null> {
    const clean = identifier.trim();
    if (clean.includes('@')) {
      const user = await userRepository.findByEmail(clean);
      if (user) return { ...user, isLoggedIn: true };
    }
    const userByHandle = await userRepository.findByHandle(clean.startsWith('@') ? clean : `@${clean}`);
    if (userByHandle) return { ...userByHandle, isLoggedIn: true };

    // Fallback: return default user if mock account
    const defaultUser = await userRepository.findById('user-current');
    if (defaultUser) {
      return {
        ...defaultUser,
        name: clean.split('@')[0],
        handle: `@${clean.split('@')[0].toLowerCase().replace(/\s+/g, '_')}`,
        isLoggedIn: true,
      };
    }
    return null;
  }

  public async signup(name: string, email: string, handle: string): Promise<UserAccount> {
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      handle: cleanHandle,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      isLoggedIn: true,
      subscribedChannelIds: ['ch-blender', 'ch-lofi'],
      likedVideoIds: [],
      dislikedVideoIds: [],
      watchLaterIds: [],
      historyVideoIds: [],
      createdAt: 'Just now',
    };

    return userRepository.create(newUser);
  }

  public async updateProfile(userId: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
    return userRepository.update(userId, updates);
  }

  public async toggleSubscription(userId: string, channelId: string): Promise<{ isSubscribed: boolean; subscribers: number }> {
    return userRepository.toggleSubscription(userId, channelId);
  }
}

export const authService = new AuthService();
