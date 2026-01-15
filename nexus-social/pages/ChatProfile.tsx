
import React from 'react';
import { User } from '../types';
import { ArrowLeft, Bell, BellOff, Trash2, ShieldAlert, Image, FileText, UserMinus } from 'lucide-react';

interface ChatProfileProps {
  user?: User;
  isGroup: boolean;
  onBack: () => void;
}

const ChatProfile: React.FC<ChatProfileProps> = ({ user, isGroup, onBack }) => {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="p-4 flex items-center gap-4 sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
        <button onClick={onBack} className="p-1 dark:text-white"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold dark:text-white">{isGroup ? 'Group Info' : 'User Info'}</h2>
      </div>

      <div className="flex flex-col items-center py-10 px-6 border-b border-gray-100 dark:border-slate-800">
        <img src={user?.avatar || 'https://picsum.photos/seed/grp/200/200'} className="w-32 h-32 rounded-3xl object-cover shadow-2xl mb-6 border-4 border-indigo-50 dark:border-slate-900" />
        <h3 className="text-2xl font-black dark:text-white text-center">{isGroup ? 'Tech Innovators 🚀' : user?.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{isGroup ? '3 Participants' : user?.username}</p>
        
        {!isGroup && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center max-w-xs leading-relaxed">
            {user?.bio}
          </p>
        )}
      </div>

      <div className="p-6 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Media & Docs</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-900 overflow-hidden">
              <img src={`https://picsum.photos/seed/m${i}/200/200`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Settings</p>
        
        <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Bell size={20} />
            <span className="font-bold text-sm">Mute Notifications</span>
          </div>
          <div className="w-10 h-6 bg-gray-300 dark:bg-slate-700 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl">
          <ShieldAlert size={20} />
          <span className="font-bold text-sm">Block {isGroup ? 'Group' : 'User'}</span>
        </button>
        
        <button className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl">
          <Trash2 size={20} />
          <span className="font-bold text-sm">Clear Chat History</span>
        </button>
      </div>
    </div>
  );
};

export default ChatProfile;
