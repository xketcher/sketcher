
import React from 'react';
import { User } from '../types';
import { MOCK_POSTS } from '../constants';
import { Edit3, Grid, List, Bookmark, BarChart2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  isOwn: boolean;
  onOpenAnalytics?: () => void;
  onEditProfile?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, isOwn, onOpenAnalytics, onEditProfile }) => {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Cover and Avatar */}
      <div className="relative h-48 w-full">
        <img src={user.coverImage} className="w-full h-full object-cover" />
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-950 overflow-hidden bg-gray-200 shadow-xl">
            <img src={user.avatar} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="absolute -bottom-12 right-6 flex gap-2">
          {isOwn && (
            <button 
              onClick={onOpenAnalytics}
              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 p-2.5 rounded-xl font-bold flex items-center justify-center shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              title="View Insights"
            >
              <BarChart2 size={20} />
            </button>
          )}
          {isOwn ? (
            <button 
              onClick={onEditProfile}
              className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          ) : (
             <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              Follow
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-16 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-sm text-gray-500 font-medium">{user.username}</p>
          </div>
        </div>
        
        <p className="mt-4 text-gray-700 dark:text-gray-400 leading-relaxed text-sm">
          {user.bio}
        </p>

        <div className="flex gap-8 mt-6 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900 dark:text-white">{user.followers}</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900 dark:text-white">{user.following}</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Following</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900 dark:text-white">42</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Posts</span>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex items-center justify-around border-b border-gray-50 dark:border-slate-800">
        <button className="flex-1 py-4 text-indigo-600 border-b-2 border-indigo-600"><Grid size={20} className="mx-auto" /></button>
        <button className="flex-1 py-4 text-gray-400"><List size={20} className="mx-auto" /></button>
        <button className="flex-1 py-4 text-gray-400"><Bookmark size={20} className="mx-auto" /></button>
      </div>

      {/* Grid Posts */}
      <div className="grid grid-cols-3 gap-0.5 mt-0.5 pb-20">
        {[...MOCK_POSTS, ...MOCK_POSTS, ...MOCK_POSTS].map((post, i) => (
          <div key={i} className="aspect-square bg-gray-100 dark:bg-slate-900 relative group overflow-hidden">
            <img src={post.image || `https://picsum.photos/seed/${i}/400/400`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4">
               <span className="flex items-center gap-1 font-bold text-sm">❤️ {post.likes}</span>
               <span className="flex items-center gap-1 font-bold text-sm">💬 {post.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
