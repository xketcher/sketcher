
export type AppState = 'splash' | 'intro' | 'login' | 'signup' | 'forgot-password' | 'home';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  coverImage: string;
  followers: number;
  following: number;
  isFriend: boolean;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  commentsList?: Comment[];
  timestamp: string;
  liked: boolean;
}

export interface Reel {
  id: string;
  userName: string;
  userAvatar: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  musicName: string;
}

export interface Chat {
  id: string;
  participant?: User; // Personal Chat
  participants?: User[]; // Group Chat
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export interface AnalyticsData {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: string;
  history: { date: string; likes: number; comments: number; shares: number }[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  content: string;
  timestamp: string;
  read: boolean;
}
