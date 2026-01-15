
import React, { useState } from 'react';
import { Chat } from '../types';
import { Search, Plus, Users as UsersIcon } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onChatSelect }) => {
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter(c => 
    (c.isGroup ? c.groupName : c.participant?.name)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Messages</h2>
        <button className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:rotate-90 transition-all">
          <Plus size={22} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..." 
            className="w-full bg-gray-100 dark:bg-slate-900 py-3.5 pl-10 pr-4 rounded-2xl focus:outline-none dark:text-white text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        {filteredChats.map(chat => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50/50 dark:hover:bg-slate-900 transition-all text-left group"
          >
            <div className="relative flex-shrink-0">
              {chat.isGroup ? (
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  {chat.groupAvatar ? (
                    <img src={chat.groupAvatar} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <UsersIcon className="text-indigo-600" size={24} />
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img src={chat.participant?.avatar} className="w-14 h-14 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="font-bold truncate dark:text-white text-sm">
                  {chat.isGroup ? chat.groupName : chat.participant?.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{chat.timestamp}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-4">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="bg-indigo-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-lg font-black shadow-md shadow-indigo-600/30">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
        {filteredChats.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">No conversations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
