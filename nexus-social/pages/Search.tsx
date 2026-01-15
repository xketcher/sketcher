
import React, { useState } from 'react';
import { ArrowLeft, Search, Users, FileText, TrendingUp, X, Heart, MessageCircle } from 'lucide-react';
import { User, Post } from '../types';

interface SearchProps {
  friends: User[];
  posts: Post[];
  onBack: () => void;
}

const SearchPage: React.FC<SearchProps> = ({ friends, posts, onBack, onOpenUser }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'trending'>('trending');

  const filteredUsers = friends.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase()));
  const filteredPosts = posts.filter(p => p.content.toLowerCase().includes(query.toLowerCase()));

  const displayResults = () => {
    if (activeTab === 'users') {
      return (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-50 dark:border-slate-800">
              <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <h4 className="font-bold text-sm dark:text-white">{user.name}</h4>
                <p className="text-[10px] text-gray-400">{user.username}</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold active:scale-90 transition-transform">Follow</button>
            </div>
          ))}
          {filteredUsers.length === 0 && query && <p className="text-center text-gray-400 py-10">No users found for "{query}"</p>}
        </div>
      );
    }

    if (activeTab === 'posts') {
      return (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-50 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <img src={post.userAvatar} className="w-8 h-8 rounded-full" />
                <span className="font-bold text-xs dark:text-white">{post.userName}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{post.content}</p>
              <div className="mt-3 flex gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><Heart size={14} /> {post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.comments}</span>
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && query && <p className="text-center text-gray-400 py-10">No posts found for "{query}"</p>}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Global Trends</h3>
        {[
          { tag: '#NexusBeta', posts: '1.2M' },
          { tag: '#GeminiMagic', posts: '850K' },
          { tag: '#React2025', posts: '430K' },
          { tag: '#AIRevolution', posts: '10.5M' },
        ].map((trend, i) => (
          <div key={i} onClick={() => { setQuery(trend.tag.replace('#', '')); setActiveTab('posts'); }} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-xl transition-all">
            <div>
              <p className="font-black text-indigo-600 dark:text-indigo-400">{trend.tag}</p>
              <p className="text-[10px] text-gray-400 font-bold">{trend.posts} post activity</p>
            </div>
            <TrendingUp className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all" size={18} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
        <button onClick={onBack} className="p-1 text-gray-500 dark:text-gray-400"><ArrowLeft size={24} /></button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (activeTab === 'trending') setActiveTab('users'); }}
            placeholder="Search NEXUS network..." 
            className="w-full bg-gray-100 dark:bg-slate-900 py-2.5 pl-10 pr-10 rounded-2xl focus:outline-none dark:text-white text-sm"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
        </div>
      </div>

      <div className="flex border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        {[
          { id: 'trending', label: 'Explore', icon: TrendingUp },
          { id: 'users', label: 'People', icon: Users },
          { id: 'posts', label: 'Media', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">{displayResults()}</div>
    </div>
  );
};

export default SearchPage;
