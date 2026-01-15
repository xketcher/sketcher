
import React, { useState } from 'react';
import { User, Post, Chat, Notification as NotificationType } from '../types';
import Feed from '../pages/Feed';
import Friends from '../pages/Friends';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ChatList from '../pages/ChatList';
import ChatDetail from '../pages/ChatDetail';
import Analytics from '../pages/Analytics';
import Reels from '../pages/Reels';
import SearchPage from '../pages/Search';
import EditProfile from '../pages/EditProfile';
import ChatProfile from '../pages/ChatProfile';
import { MOCK_POSTS, MOCK_FRIENDS, MOCK_CHATS, MOCK_NOTIFICATIONS } from '../constants';
import { Home, Users, Bell, User as UserIcon, Settings as SettingsIcon, MessageSquare, PlusSquare, Search, Play } from 'lucide-react';

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'notifications' | 'profile' | 'settings' | 'chats' | 'chat-detail' | 'analytics' | 'reels' | 'search' | 'edit-profile' | 'chat-profile'>('feed');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatProfileUser, setSelectedChatProfileUser] = useState<User | null>(null);

  // Global State for Persistence (Client-side Only)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [friends, setFriends] = useState<User[]>(MOCK_FRIENDS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [notifications, setNotifications] = useState<NotificationType[]>(MOCK_NOTIFICATIONS);

  const addNotification = (type: NotificationType['type'], fromUser: User, content: string) => {
    const newNotif: NotificationType = {
      id: Date.now().toString(),
      type,
      user: fromUser,
      content,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': 
        return <Feed 
          user={user} 
          posts={posts} 
          setPosts={setPosts} 
          onActivity={(type, content) => addNotification(type, user, content)} 
        />;
      case 'friends': 
        return <Friends 
          friends={friends} 
          setFriends={setFriends} 
        />;
      case 'notifications': 
        return <Notifications 
          notifications={notifications} 
          setNotifications={setNotifications} 
        />;
      case 'profile': 
        return <Profile 
          user={user} 
          isOwn={true} 
          posts={posts.filter(p => p.userId === user.id)}
          onOpenAnalytics={() => setActiveTab('analytics')} 
          onEditProfile={() => setActiveTab('edit-profile')} 
        />;
      case 'settings': 
        return <Settings 
          onLogout={onLogout} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />;
      case 'chats': 
        return <ChatList 
          chats={chats}
          onChatSelect={(id) => { setSelectedChatId(id); setActiveTab('chat-detail'); }} 
        />;
      case 'chat-detail': 
        return <ChatDetail 
          chatId={selectedChatId!} 
          onBack={() => setActiveTab('chats')} 
          onOpenProfile={(user) => { setSelectedChatProfileUser(user); setActiveTab('chat-profile'); }} 
        />;
      case 'analytics': 
        return <Analytics onBack={() => setActiveTab('profile')} />;
      case 'reels': 
        return <Reels />;
      case 'search': 
        return <SearchPage 
          friends={friends} 
          posts={posts} 
          onBack={() => setActiveTab('feed')} 
        />;
      case 'edit-profile': 
        return <EditProfile user={user} onBack={() => setActiveTab('profile')} />;
      case 'chat-profile': 
        return <ChatProfile 
          user={selectedChatProfileUser!} 
          isGroup={!selectedChatProfileUser} 
          onBack={() => setActiveTab('chat-detail')} 
        />;
      default: 
        return <Feed user={user} posts={posts} setPosts={setPosts} onActivity={() => {}} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
        activeTab === id ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
      }`}
    >
      <Icon size={22} fill={activeTab === id ? 'currentColor' : 'none'} />
      <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );

  const hideNavigation = ['chat-detail', 'analytics', 'edit-profile', 'chat-profile', 'search'].includes(activeTab);
  const isReels = activeTab === 'reels';

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Header - Hidden on certain views */}
      {!hideNavigation && !isReels && (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/20">
              <PlusSquare className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Nexus</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('search')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors">
              <Search size={20} />
            </button>
            <button onClick={() => setActiveTab('chats')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors relative">
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {chats.reduce((acc, chat) => acc + chat.unread, 0)}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Content Area */}
      <main className={`flex-1 overflow-y-auto ${!hideNavigation && !isReels ? 'pb-20' : ''} md:pb-0`}>
        <div className={`max-w-3xl mx-auto w-full ${isReels ? 'h-full' : ''}`}>
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      {!hideNavigation && (
        <nav className={`fixed bottom-0 w-full transition-all duration-300 ${isReels ? 'bg-black/20 backdrop-blur-lg border-t border-white/10 text-white' : 'bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800'} px-2 py-2 flex items-center justify-between md:max-w-3xl md:left-1/2 md:-translate-x-1/2 md:rounded-t-2xl md:shadow-2xl z-50`}>
          <NavItem id="feed" icon={Home} label="Home" />
          <NavItem id="reels" icon={Play} label="Reels" />
          <NavItem id="friends" icon={Users} label="Friends" />
          <NavItem id="notifications" icon={Bell} label="Activity" />
          <NavItem id="profile" icon={UserIcon} label="Profile" />
          <NavItem id="settings" icon={SettingsIcon} label="Settings" />
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
