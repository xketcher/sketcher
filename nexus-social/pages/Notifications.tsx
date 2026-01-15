
import React from 'react';
import { Notification as NotificationType } from '../types';
import { Heart, UserPlus, MessageSquare, AtSign, CheckCheck, Trash2 } from 'lucide-react';

interface NotificationsProps {
  notifications: NotificationType[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500" fill="currentColor" />;
      case 'follow': return <UserPlus size={16} className="text-indigo-500" />;
      case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
      case 'mention': return <AtSign size={16} className="text-purple-500" />;
      default: return null;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    if (confirm('Clear all activity?')) setNotifications([]);
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-950 min-h-screen transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Activity</h2>
        <div className="flex gap-2">
          <button onClick={markAllAsRead} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all" title="Mark all as read">
            <CheckCheck size={20} />
          </button>
          <button onClick={clearAll} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Clear all">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map(notif => (
          <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${notif.read ? 'bg-white dark:bg-slate-900 border border-gray-50 dark:border-slate-800' : 'bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600 shadow-sm animate-in slide-in-from-right-2'}`}>
            <div className="relative flex-shrink-0">
              <img src={notif.user.avatar} className="w-12 h-12 rounded-full object-cover" />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm border border-gray-100 dark:border-slate-700">
                {getIcon(notif.type)}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm dark:text-gray-200">
                <span className="font-bold">{notif.user.name}</span> {notif.content}
              </p>
              <span className="text-[10px] text-gray-400 font-medium mt-1 inline-block uppercase tracking-wider">{notif.timestamp}</span>
            </div>
            {!notif.read && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 animate-pulse"></div>}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No new activity to show.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { Bell } from 'lucide-react';
export default Notifications;
