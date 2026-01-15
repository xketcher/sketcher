
import { User, Post, Chat, Notification, AnalyticsData, Reel } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'John Doe',
  username: '@johndoe',
  avatar: 'https://picsum.photos/seed/johndoe/200/200',
  bio: 'Digital nomad & Frontend Enthusiast. Always exploring new tech horizons! 🌍✨',
  coverImage: 'https://picsum.photos/seed/cover/800/300',
  followers: 1240,
  following: 580,
  isFriend: true
};

export const MOCK_FRIENDS: User[] = [
  { id: 'u2', name: 'Sarah Wilson', username: '@sarahw', avatar: 'https://picsum.photos/seed/sarah/200/200', bio: 'Artist', coverImage: 'https://picsum.photos/seed/sarahc/800/300', followers: 100, following: 200, isFriend: true },
  { id: 'u3', name: 'Mike Ross', username: '@mikeross', avatar: 'https://picsum.photos/seed/mike/200/200', bio: 'Lawyer', coverImage: 'https://picsum.photos/seed/mikec/800/300', followers: 300, following: 100, isFriend: true },
  { id: 'u4', name: 'Elena Gilbert', username: '@elenag', avatar: 'https://picsum.photos/seed/elena/200/200', bio: 'Student', coverImage: 'https://picsum.photos/seed/elenac/800/300', followers: 500, following: 500, isFriend: true },
];

export const MOCK_REELS: Reel[] = [
  {
    id: 'r1',
    userName: 'Sarah Wilson',
    userAvatar: 'https://picsum.photos/seed/sarah/200/200',
    videoUrl: 'https://v.ftcdn.net/06/15/22/35/700_F_615223508_m4iVzWfV6CqS7n6fNqNqYVvG9k1kX9Xz_ST.mp4',
    caption: 'Neon nights and city lights 🌌 #vibes',
    likes: 1200,
    comments: 45,
    musicName: 'Midnight City - M83'
  },
  {
    id: 'r2',
    userName: 'Mike Ross',
    userAvatar: 'https://picsum.photos/seed/mike/200/200',
    videoUrl: 'https://v.ftcdn.net/04/11/41/12/700_F_411411267_8R6E9R8m6m8m6m8m6m8m6m8m6m8m6m8m_ST.mp4',
    caption: 'Pure serenity. 🌊 #nature #ocean',
    likes: 850,
    comments: 23,
    musicName: 'Ocean Eyes - Billie Eilish'
  },
  {
    id: 'r3',
    userName: 'Elena Gilbert',
    userAvatar: 'https://picsum.photos/seed/elena/200/200',
    videoUrl: 'https://v.ftcdn.net/05/23/91/42/700_F_523914256_k7nO6nO6nO6nO6nO6nO6nO6nO6nO6nO6_ST.mp4',
    caption: 'Urban exploration 🏙️ #citylife',
    likes: 2100,
    comments: 89,
    musicName: 'Blinding Lights - The Weeknd'
  }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    participant: MOCK_FRIENDS[0],
    isGroup: false,
    lastMessage: 'Check out this cool link I found!',
    unread: 2,
    timestamp: '10:45 AM'
  },
  {
    id: 'c2',
    isGroup: true,
    groupName: 'Tech Innovators 🚀',
    groupAvatar: 'https://picsum.photos/seed/techgrp/200/200',
    participants: [MOCK_FRIENDS[0], MOCK_FRIENDS[1], MOCK_USER],
    lastMessage: 'Mike: We should use the new Gemini API!',
    unread: 5,
    timestamp: '11:20 AM'
  },
  {
    id: 'c3',
    participant: MOCK_FRIENDS[1],
    isGroup: false,
    lastMessage: 'Are we still meeting at 5?',
    unread: 0,
    timestamp: 'Yesterday'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    userName: 'Sarah Wilson',
    userAvatar: 'https://picsum.photos/seed/sarah/200/200',
    content: 'Just finished this new digital art piece! What do you guys think?',
    image: 'https://picsum.photos/seed/art/600/400',
    likes: 45,
    comments: 1,
    timestamp: '2h ago',
    liked: false
  }
];

export const MOCK_ANALYTICS: AnalyticsData = {
  totalLikes: 12450,
  totalComments: 840,
  totalShares: 320,
  engagementRate: '4.8%',
  history: [
    { date: 'Mon', likes: 120, comments: 10, shares: 5 },
    { date: 'Tue', likes: 450, comments: 45, shares: 12 },
    { date: 'Wed', likes: 320, comments: 28, shares: 8 },
    { date: 'Thu', likes: 600, comments: 55, shares: 20 },
    { date: 'Fri', likes: 850, comments: 90, shares: 35 },
    { date: 'Sat', likes: 1100, comments: 120, shares: 45 },
    { date: 'Sun', likes: 950, comments: 85, shares: 25 },
  ]
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    user: MOCK_FRIENDS[0],
    content: 'liked your post.',
    timestamp: '5m ago',
    read: false
  }
];
