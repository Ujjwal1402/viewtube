import { db } from '../config/database';
import { UserAccount } from '../models/types';

export class UserRepository {
  public async findById(id: string): Promise<UserAccount | null> {
    const user = db.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  public async findByEmail(email: string): Promise<UserAccount | null> {
    const user = db.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  public async findByHandle(handle: string): Promise<UserAccount | null> {
    const user = db.users.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
    return user ? { ...user } : null;
  }

  public async create(user: UserAccount): Promise<UserAccount> {
    db.users.push(user);
    return user;
  }

  public async update(id: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      // Create user if updating current user
      const newUser: UserAccount = {
        id,
        name: updates.name || 'ViewTube User',
        handle: updates.handle || '@user',
        avatarUrl: updates.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        subscribedChannelIds: updates.subscribedChannelIds || [],
        likedVideoIds: updates.likedVideoIds || [],
        dislikedVideoIds: updates.dislikedVideoIds || [],
        watchLaterIds: updates.watchLaterIds || [],
        historyVideoIds: updates.historyVideoIds || [],
        ...updates,
      };
      db.users.push(newUser);
      return newUser;
    }

    db.users[index] = { ...db.users[index], ...updates };
    return db.users[index];
  }

  public async toggleSubscription(userId: string, channelId: string): Promise<{ isSubscribed: boolean; subscribers: number }> {
    let user = db.users.find((u) => u.id === userId);
    if (!user) {
      user = db.users[0]; // fallback to default user
    }

    const channel = db.channels.find((c) => c.id === channelId);
    const isSub = user.subscribedChannelIds.includes(channelId);

    if (isSub) {
      user.subscribedChannelIds = user.subscribedChannelIds.filter((id) => id !== channelId);
      if (channel) channel.subscribers = Math.max(0, channel.subscribers - 1);
    } else {
      user.subscribedChannelIds.push(channelId);
      if (channel) channel.subscribers += 1;
    }

    return {
      isSubscribed: !isSub,
      subscribers: channel ? channel.subscribers : 0,
    };
  }
}

export const userRepository = new UserRepository();
