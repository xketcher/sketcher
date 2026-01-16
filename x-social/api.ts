
export const BASE_URL = 'https://xketcher.x10.mx/chat/api';

const fetchAPI = async (endpoint: string, data: any, isMultipart = false) => {
  try {
    let body;
    if (isMultipart) {
      body = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          body.append(key, data[key]);
        }
      });
    } else {
      body = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          body.append(key, data[key]);
        }
      });
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: body,
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || 'API rejected the request');
    }
    return result;
  } catch (error: any) {
    console.error(`API Error at ${endpoint}:`, error);
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
};

export const api = {
  auth: {
    register: (data: any) => fetchAPI('/auth/register', data, true),
    login: (data: any) => fetchAPI('/auth/login', data),
  },
  posts: {
    feed: (token: string, offset?: string) => fetchAPI('/post/feed', { token, offset }),
    create: (data: any) => fetchAPI('/post/create', data, true),
    like: (token: string, postId: number, reaction: string, type: 'like' | 'unlike') =>
      fetchAPI('/post/like', { token, post_id: postId, reaction, type }),
    my: (token: string, userId: number) => fetchAPI('/post/my', { token, user_id: userId }),
    search: (token: string, query: string) => fetchAPI('/post/search', { token, search: query }),
    reactions: (token: string, postId: number) => fetchAPI('/post/reactions', { token, post_id: postId }),
  },
  user: {
    profile: (token: string, userId: number) => fetchAPI('/user/profile', { token, user_id: userId }),
    update: (data: any) => fetchAPI('/profile/update', data, true),
    follow: (token: string, followingId: number, type: 'follow' | 'unfollow') =>
      fetchAPI('/user/follow', { token, following_id: followingId, type }),
    notifications: (token: string) => fetchAPI('/user/notis', { token }),
    fffLists: (token: string, userId: number) => fetchAPI('/user/fff/lists', { token, user_id: userId }),
  },
  friends: {
    suggestions: (token: string) => fetchAPI('/rand/friends', { token }),
    request: (token: string, friendId: number) => fetchAPI('/friend/request', { token, friend_user_id: friendId }),
    approve: (token: string, friendId: number) => fetchAPI('/friend/approve', { token, friend_id: friendId }),
    reject: (token: string, friendId: number) => fetchAPI('/friend/reject', { token, friend_id: friendId }),
    cancel: (token: string, friendId: number) => fetchAPI('/friend/send/cancel', { token, friend_id: friendId }),
    unfriend: (token: string, friendId: number) => fetchAPI('/unfriend', { token, friend_id: friendId }),
    list: (token: string, sort: string = 'new_to_old') => fetchAPI('/friend/list', { token, sort }),
    receivedRequests: (token: string) => fetchAPI('/friend/request/list', { token }),
    sentRequests: (token: string) => fetchAPI('/friend/send/list', { token }),
  },
};
