
export interface User {
  user_id: number;
  uuid: string;
  username: string;
  profile: string;
  email: string;
  bio: string;
  gender: 'male' | 'female';
  rs_type: 'single' | 'rs';
  birthday: string;
  token?: string;
  created_at: string;
  updated_at?: string;
}

export interface Post {
  post_id: number;
  type: 'public' | 'anonymous' | 'only_me' | 'follower' | 'friend' | 'follower_friend';
  sender_id: number;
  image: string | null;
  content: string;
  share_post_id: number | null;
  updated_at: string;
  created_at: string;
  username: string;
  profile: string;
  is_friend: number;
  is_follow: number;
  is_like: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  reactions: string[];
  share_post: Post | null;
}

export interface FriendSuggestion {
  user_id: number;
  username: string;
  profile: string;
}

export interface Friend {
  friend_id: number;
  user_id: number;
  username: string;
  profile: string;
  total_followers?: number;
}

export interface Notification {
  type: 'follow' | 'like' | 'post';
  user_id: number;
  username: string;
  profile: string;
  reaction: string | null;
  created_at: string;
}

export interface ProfileDetail extends User {
  total_followers: number;
  total_following: number;
  total_friends: number;
  is_follow: number;
  is_friend: number;
  followers: { user_id: number; username: string; profile: string }[];
  photos: { post_id: number; image: string }[];
}

export interface SearchResult {
  type: 'user' | 'post';
  post_id: number | null;
  user_id: number;
  username: string;
  profile: string;
  content: string | null;
  image: string | null;
  total_likes: number | null;
  is_like: number | null;
  total_followers: number | null;
  created_at: string;
}
