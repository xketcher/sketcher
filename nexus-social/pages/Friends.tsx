
import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, UserMinus, Search, UserCheck } from 'lucide-react';
import { MOCK_FRIENDS } from '../constants';

interface FriendsProps {
  friends: User[];
  setFriends: React.Dispatch<React.SetStateAction<User[]>>;
}

const Friends: React.FC<FriendsProps> = ({ friends, setFriends }) => {
  const [activeTab, setActiveTab] = useState<'my' | 'requests' | 'discover'>('my');
  const [search, setSearch] = useState('');

  // Simulation: "Discover" shows all mock friends not currently in "my"
  const discoverList = MOCK_FRIENDS.filter(f => !friends.some(my => my.id === f.id));
  const currentDisplayList = activeTab === 'my' ? friends : activeTab === 'discover' ? discoverList : [];

  const filteredList = currentDisplayList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = (user: User) => {
    setFriends(prev => [user, ...prev]);
  };

  const handleRemoveFriend = (id: string) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Friends</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..." 
            className="w-full bg-gray-100 dark:bg-slate-900 py-3 pl-10 pr-4 rounded-xl focus:outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl mb-6">
        {(['my', 'requests', 'discover'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab === 'my' ? 'My Friends' : tab === 'requests' ? 'Requests' : 'Discover'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredList.map(user => (
          <div key={user.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl animate-in slide-in-from-bottom-2">
            <img src={user.avatar} className="w-14 h-14 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="font-bold dark:text-white text-sm">{user.name}</h3>
              <p className="text-[10px] text-gray-400 font-medium mb-1">{user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{user.bio}</p>
            </div>
            {activeTab === 'my' ? (
              <button 
                onClick={() => handleRemoveFriend(user.id)}
                className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                title="Remove Friend"
              >
                <UserMinus size={20} />
              </button>
            ) : (
              <button 
                onClick={() => handleAddFriend(user)}
                className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-90"
                title="Add Friend"
              >
                <UserPlus size={20} />
              </button>
            )}
          </div>
        ))}
        {filteredList.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <UserCheck size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No results found here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
