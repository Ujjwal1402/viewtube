export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  verified?: boolean;
  subscribers: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  views: number;
  createdAt: string;
  category: string;
  channel: Channel;
  isLive?: boolean;
  liveViewerCount?: number;
  likes: number;
  dislikes: number;
  tags?: string[];
  isUserUpload?: boolean;
  isUserLive?: boolean;
  isBlob?: boolean;
}

export interface CommentAuthor {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isCreator?: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  parentId?: string | null;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  likes: number;
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isHeartedByCreator?: boolean;
  isPinned?: boolean;
  replies?: Comment[];
}

export interface LiveChatMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
    isOwner?: boolean;
    isMod?: boolean;
    badge?: string;
  };
  text: string;
  timestamp: string;
  isSuperChat?: boolean;
  superChatAmount?: string;
  superChatColor?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  handle: string;
  email?: string;
  bio?: string;
  avatarUrl: string;
  bannerUrl?: string;
  isLoggedIn?: boolean;
  subscribersCount?: number;
  subscribedChannelIds: string[];
  likedVideoIds: string[];
  dislikedVideoIds: string[];
  watchLaterIds: string[];
  historyVideoIds: string[];
  isHistoryPaused?: boolean;
  createdAt?: string;
}
