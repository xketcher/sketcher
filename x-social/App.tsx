
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Home, Search, Bell, User as UserIcon, LogOut, Settings as SettingsIcon, 
  Users, Heart, PlusSquare, Image as ImageIcon, Send, X, MoreHorizontal,
  ChevronLeft, Trash2, UserPlus, UserCheck, UserMinus, Camera, Moon, Sun,
  Ghost, Sparkles, ShieldCheck, Zap, ArrowRight, UserX, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';

import { api, BASE_URL } from './api';
import { User, Post, FriendSuggestion, Friend, Notification, ProfileDetail, SearchResult } from './types';

// Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User) => void;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  hasSeenIntro: boolean;
  completeIntro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Error Helper Component
const ConnectionError: React.FC<{ onRetry: () => void; error?: string }> = ({ onRetry, error }) => {
  const isNetwork = error === 'NETWORK_ERROR';
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-500 mb-6">
        <AlertCircle size={40} />
      </div>
      <h3 className="text-xl font-bold mb-2">Connection Problem</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        {isNetwork 
          ? "We can't reach the server. This is likely due to a security block in your browser." 
          : error || "Something went wrong while talking to our servers."}
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {isNetwork && (
          <button 
            onClick={() => window.open(`${BASE_URL}/rand/friends`, '_blank')}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            <ExternalLink size={18} />
            1. Fix Connection
          </button>
        )}
        <button 
          onClick={onRetry}
          className="flex items-center justify-center gap-2 w-full bg-gray-100 dark:bg-slate-800 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
        >
          <RefreshCw size={18} />
          {isNetwork ? '2. Retry Now' : 'Try Again'}
        </button>
      </div>
      
      {isNetwork && (
        <p className="mt-6 text-xs text-gray-400">
          Tip: After clicking "Fix Connection", if you see a security warning, click "Advanced" and then "Proceed".
        </p>
      )}
    </div>
  );
};

// Components
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user, darkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Users, label: 'Friends', path: '/friends' },
    { icon: UserIcon, label: 'Profile', path: `/profile/${user?.user_id}` },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <aside className={`hidden md:flex flex-col w-64 fixed h-full border-r ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} p-4 z-40`}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">K</div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-700">Ketcher</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.label === 'Profile' && location.pathname.startsWith('/profile'));
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1' 
                    : `hover:${darkMode ? 'bg-slate-800' : 'bg-gray-100'} text-gray-500`
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-1">
          <button 
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:${darkMode ? 'bg-slate-800' : 'bg-gray-100'} transition-all`}
          >
            <SettingsIcon size={22} className="text-gray-500" />
            <span className="font-bold text-gray-500">Settings</span>
          </button>
          <button 
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:${darkMode ? 'bg-rose-900/20' : 'bg-rose-50'} text-rose-500 transition-all`}
          >
            <LogOut size={22} />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 mb-20 md:mb-0">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {children}
        </div>
      </main>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200'} backdrop-blur-lg flex items-center justify-around p-3 z-50`}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.label === 'Profile' && location.pathname.startsWith('/profile'));
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`p-2.5 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400'
              }`}
            >
              <item.icon size={22} />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const PostCard: React.FC<{ post: Post; onRefresh: () => void }> = ({ post, onRefresh }) => {
  const { token, darkMode } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const navigate = useNavigate();

  const handleLike = async (reaction: string) => {
    if (!token || isLiking) return;
    setIsLiking(true);
    try {
      const type = post.is_like ? 'unlike' : 'like';
      await api.posts.like(token, post.post_id, reaction, type);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    navigate('/create', { state: { sharePost: post } });
  };

  return (
    <div className={`mb-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className="p-5 flex items-start gap-3">
        <img 
          src={post.profile} 
          alt={post.username} 
          className="w-11 h-11 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(`/profile/${post.sender_id}`)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 
                className="font-black text-sm md:text-base hover:underline cursor-pointer truncate"
                onClick={() => navigate(`/profile/${post.sender_id}`)}
              >
                {post.username}
                {post.type === 'anonymous' && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-lg font-bold uppercase inline-flex items-center gap-1">
                    <Ghost size={10}/>Anon
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{new Date(post.created_at).toLocaleDateString()} • {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <button className="text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>

      {post.image && (
        <div className="px-5 pb-5">
          <img src={post.image} alt="post" className="w-full rounded-3xl object-cover max-h-[500px] shadow-sm hover:scale-[1.01] transition-transform duration-500" />
        </div>
      )}

      {post.share_post && (
        <div className="px-5 pb-5">
          <div className={`rounded-3xl border ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-gray-100 bg-gray-50'} overflow-hidden`}>
             <PostCard post={post.share_post} onRefresh={onRefresh} />
          </div>
        </div>
      )}

      <div className={`px-5 py-4 border-t ${darkMode ? 'border-slate-800' : 'border-gray-50'} flex items-center justify-between`}>
        <div className="flex items-center gap-1 md:gap-4 w-full">
          <button 
            disabled={isLiking}
            onClick={() => handleLike('like')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-sm transition-all ${
              post.is_like 
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart size={20} fill={post.is_like ? "currentColor" : "none"} strokeWidth={post.is_like ? 0 : 2} />
            <span>{post.total_likes > 0 ? post.total_likes : 'Like'}</span>
          </button>
          
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
             <div className="w-5 h-5 flex items-center justify-center">💬</div>
             <span>{post.total_comments > 0 ? post.total_comments : 'Comment'}</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
             <Send size={18} />
             <span>{post.total_shares > 0 ? post.total_shares : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Pages
const Splash: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center z-[200]">
      <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center text-indigo-600 font-black text-6xl mb-6 shadow-2xl animate-bounce">K</div>
      <h1 className="text-white text-3xl font-black tracking-widest uppercase animate-pulse">Ketcher</h1>
      <div className="absolute bottom-12 w-12 h-1 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-white w-full animate-progress" />
      </div>
    </div>
  );
};

const IntroPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const { completeIntro } = useAuth();
  
  const steps = [
    {
      title: "Discover World",
      desc: "Experience the next generation of social networking with privacy at its core.",
      icon: <Sparkles size={70} className="text-yellow-400" />,
      color: "bg-indigo-600"
    },
    {
      title: "Encrypted Privacy",
      desc: "Your data is your business. Advanced security to keep you safe.",
      icon: <ShieldCheck size={70} className="text-emerald-400" />,
      color: "bg-emerald-600"
    },
    {
      title: "Fast Interaction",
      desc: "Instant notifications and smooth interactions across all devices.",
      icon: <Zap size={70} className="text-amber-400" />,
      color: "bg-amber-600"
    }
  ];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else completeIntro();
  };

  return (
    <div className={`fixed inset-0 z-[210] flex flex-col items-center justify-center text-white transition-all duration-700 ease-in-out ${steps[step].color} p-8`}>
      <div className="mb-14 transform scale-125 animate-in zoom-in fade-in duration-700">
        {steps[step].icon}
      </div>
      <h2 className="text-5xl font-black mb-6 text-center leading-tight">{steps[step].title}</h2>
      <p className="text-xl text-center text-white/80 max-w-sm mb-16 leading-relaxed font-medium">{steps[step].desc}</p>
      
      <div className="flex gap-3 mb-16">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-white' : 'w-2 bg-white/40'}`} />
        ))}
      </div>

      <button 
        onClick={next}
        className="w-full max-w-xs py-5 bg-white text-gray-900 rounded-3xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
      >
        {step === steps.length - 1 ? 'Start Journey' : 'Next Step'}
        <ArrowRight size={22} strokeWidth={3} />
      </button>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: handleLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login({ email, password });
      handleLogin(res);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-xl shadow-indigo-500/20">K</div>
          <h2 className="text-3xl font-black dark:text-white">Welcome Back</h2>
          <p className="text-gray-400 mt-2 font-medium">Continue your social experience</p>
        </div>

        {error && <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex gap-3 items-center">
          <AlertCircle size={18} />
          {error}
        </div>}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-indigo-600 font-black hover:underline">
              Create One
            </button>
          </p>
          <div className="h-px w-1/2 bg-gray-100 dark:bg-slate-800" />
          <button 
            onClick={() => window.open(`${BASE_URL}/rand/friends`, '_blank')}
            className="text-xs text-indigo-500 font-bold flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <ExternalLink size={14} /> Connection Problem?
          </button>
        </div>
      </div>
    </div>
  );
};

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    gender: 'male' as 'male' | 'female',
    rs_type: 'single' as 'single' | 'rs',
    birthday: '',
  });
  const [profile, setProfile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: handleLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { ...form, profile };
      const res = await api.auth.register(data);
      handleLogin(res);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 py-16">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black dark:text-white">Join Ketcher</h2>
          <p className="text-gray-400 mt-2 font-medium">Create your profile to get started</p>
        </div>

        {error && <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex gap-3 items-center animate-shake">
          <AlertCircle size={18} />
          {error}
        </div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-gray-100 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl group-hover:scale-105 transition-transform duration-500">
                {profile ? (
                  <img src={URL.createObjectURL(profile)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <UserIcon size={50} />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl cursor-pointer shadow-xl hover:bg-indigo-700 transition-all hover:rotate-12">
                <Camera size={20} strokeWidth={3} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setProfile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Birthday</label>
              <input
                type="date"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/20 mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up Free'}
          </button>
        </form>

        <p className="text-center mt-10 text-sm text-gray-500 font-medium">
          Member already?{' '}
          <button onClick={() => navigate('/login')} className="text-indigo-600 font-black hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

const FeedPage: React.FC = () => {
  const { token, darkMode } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    if (!token) return;
    try {
      setError(null);
      const res = await api.posts.feed(token);
      setPosts(res.posts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [token]);

  if (loading) return <div className="flex flex-col items-center justify-center p-20 animate-pulse"><div className="w-12 h-12 bg-indigo-600 rounded-2xl animate-spin mb-4"></div><p className="font-bold text-gray-400">Loading your feed...</p></div>;

  if (error) return <ConnectionError onRetry={fetchFeed} error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black">Feed</h2>
        <button 
          onClick={() => { setRefreshing(true); fetchFeed(); }} 
          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all"
          disabled={refreshing}
        >
          <RefreshCw size={22} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {posts.length === 0 ? (
        <div className={`p-16 text-center ${darkMode ? 'text-slate-400 bg-slate-900 border-slate-800' : 'text-gray-400 bg-white border-gray-100'} rounded-[2.5rem] border shadow-sm`}>
          <ImageIcon className="mx-auto mb-6 opacity-20" size={60} />
          <p className="text-xl font-black">Your feed is empty</p>
          <p className="text-sm mt-2 opacity-60">Follow friends to see their updates here.</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.post_id} post={post} onRefresh={fetchFeed} />)
      )}
    </div>
  );
};

const FriendsPage: React.FC = () => {
  const { token, darkMode } = useAuth();
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [received, setReceived] = useState<Friend[]>([]);
  const [sent, setSent] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'sent' | 'friends'>('suggestions');
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!token) return;
    try {
      setError(null);
      const [sugRes, recRes, sentRes, listRes] = await Promise.all([
        api.friends.suggestions(token),
        api.friends.receivedRequests(token),
        api.friends.sentRequests(token),
        api.friends.list(token)
      ]);
      setSuggestions(sugRes.friends || []);
      setReceived(recRes.requests || []);
      setSent(sentRes.requests || []);
      setFriends(listRes.friends || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action: () => Promise<any>) => {
    try {
      await action();
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center p-20"><RefreshCw className="animate-spin text-indigo-600" size={30} /></div>;
  if (error) return <ConnectionError onRetry={fetchData} error={error} />;

  // Fixed 'count' property by adding it to all members of the tabs array to satisfy TypeScript's union type requirements
  const tabs = [
    {id: 'suggestions', label: 'Explore', icon: Sparkles, count: undefined},
    {id: 'requests', label: 'Requests', count: received.length, icon: UserPlus},
    {id: 'sent', label: 'Sent', count: sent.length, icon: Send},
    {id: 'friends', label: 'Friends', count: friends.length, icon: Users}
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-3xl overflow-x-auto hide-scrollbar scroll-smooth">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-105' : 'text-gray-400'
            }`}
          >
            <tab.icon size={18} strokeWidth={3} />
            <span className="text-sm uppercase tracking-wider">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.length === 0 ? <p className="col-span-full text-center py-20 opacity-30 font-bold">No suggestions found</p> :
            suggestions.map(s => (
              <div key={s.user_id} className={`p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30' : 'bg-white border-gray-100 hover:border-indigo-500/20'}`}>
                <img src={s.profile} className="w-20 h-20 rounded-[1.5rem] object-cover mx-auto mb-4 cursor-pointer shadow-md" onClick={() => navigate(`/profile/${s.user_id}`)} />
                <div className="font-black text-center mb-5 truncate px-2">{s.username}</div>
                <button 
                  onClick={() => handleAction(() => api.friends.request(token!, s.user_id))}
                  className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-sm font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          received.length === 0 ? <p className="text-center py-20 opacity-30 font-bold">No friend requests</p> :
          received.map(req => (
            <div key={req.friend_id} className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex items-center gap-5 shadow-sm`}>
              <img src={req.profile} className="w-14 h-14 rounded-2xl object-cover cursor-pointer" onClick={() => navigate(`/profile/${req.user_id}`)} />
              <div className="flex-1 font-black truncate">{req.username}</div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(() => api.friends.approve(token!, req.friend_id))} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-110 transition-transform"><UserCheck size={22} strokeWidth={3} /></button>
                <button onClick={() => handleAction(() => api.friends.reject(token!, req.friend_id))} className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors"><X size={22} strokeWidth={3} /></button>
              </div>
            </div>
          ))
        )}

        {activeTab === 'sent' && (
          sent.length === 0 ? <p className="text-center py-20 opacity-30 font-bold">No pending requests</p> :
          sent.map(req => (
            <div key={req.friend_id} className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex items-center gap-5 shadow-sm`}>
              <img src={req.profile} className="w-14 h-14 rounded-2xl object-cover" />
              <div className="flex-1 font-black truncate">{req.username}</div>
              <button 
                onClick={() => handleAction(() => api.friends.cancel(token!, req.friend_id))} 
                className="text-rose-500 font-black text-xs px-5 py-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                CANCEL
              </button>
            </div>
          ))
        )}

        {activeTab === 'friends' && (
          friends.length === 0 ? <p className="text-center py-20 opacity-30 font-bold">Your friend list is empty</p> :
          friends.map(f => (
            <div key={f.user_id} className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex items-center gap-5 shadow-sm`}>
              <img src={f.profile} className="w-14 h-14 rounded-2xl object-cover cursor-pointer shadow-sm" onClick={() => navigate(`/profile/${f.user_id}`)} />
              <div className="flex-1 font-black truncate">{f.username}</div>
              <button 
                onClick={() => handleAction(() => api.friends.unfriend(token!, f.friend_id))} 
                className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                title="Unfriend"
              >
                <UserMinus size={22} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { token, user: currentUser, darkMode } = useAuth();
  const { id } = useParams();
  const userId = parseInt(id || '0');
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      setError(null);
      const [profRes, postRes] = await Promise.all([
        api.user.profile(token, userId),
        api.posts.my(token, userId)
      ]);
      setProfile(profRes);
      setPosts(postRes.posts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileData();
  }, [userId]);

  if (loading) return <div className="flex justify-center p-20"><RefreshCw className="animate-spin text-indigo-600" size={30} /></div>;
  if (error) return <ConnectionError onRetry={fetchProfileData} error={error} />;
  if (!profile) return <div className="text-center p-20 font-bold opacity-30">User not found</div>;

  const isOwnProfile = currentUser?.user_id === userId;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} shadow-sm`}>
        <div className="h-40 bg-gradient-to-br from-indigo-500 to-indigo-700 relative">
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div className="absolute -bottom-14 left-8">
            <img src={profile.profile} className="w-32 h-32 rounded-[2rem] border-8 border-white dark:border-slate-900 object-cover shadow-2xl" />
          </div>
        </div>
        <div className="pt-20 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="min-w-0">
              <h2 className="text-3xl font-black truncate">{profile.username}</h2>
              <p className="text-gray-400 font-bold mt-1">{profile.email}</p>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    const type = profile.is_follow ? 'unfollow' : 'follow';
                    await api.user.follow(token!, userId, type);
                    fetchProfileData();
                  }}
                  className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black transition-all shadow-lg ${
                    profile.is_follow 
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-500' 
                      : 'bg-indigo-600 text-white shadow-indigo-500/30'
                  }`}
                >
                  {profile.is_follow ? 'Unfollow' : 'Follow'}
                </button>
                <button 
                  onClick={async () => {
                    await api.friends.request(token!, userId);
                    alert("Friend request sent!");
                  }}
                  className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-500"
                >
                  <UserPlus size={22} strokeWidth={2.5} />
                </button>
              </div>
            )}
            {isOwnProfile && (
              <button onClick={() => navigate('/settings')} className="px-6 py-3 bg-gray-100 dark:bg-slate-800 rounded-2xl font-black text-gray-500 flex items-center justify-center gap-2">
                <SettingsIcon size={20} /> Edit Profile
              </button>
            )}
          </div>
          
          <div className="mt-8 p-5 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800">
            <p className="text-[15px] leading-relaxed font-medium">{profile.bio || "This user hasn't added a bio yet. They are mysterious!"}</p>
          </div>

          <div className="flex gap-10 mt-10 px-4">
            <div className="text-center group cursor-pointer">
              <div className="font-black text-2xl group-hover:text-indigo-600 transition-colors">{profile.total_followers}</div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Followers</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="font-black text-2xl group-hover:text-indigo-600 transition-colors">{profile.total_friends}</div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Friends</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="font-black text-2xl group-hover:text-indigo-600 transition-colors">{posts.length}</div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Posts</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-xl font-black px-4 flex items-center gap-2">
          <ImageIcon size={22} className="text-indigo-600" /> Recent Updates
        </h3>
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 opacity-30 font-bold">No posts to display</div>
        ) : (
          posts.map(p => <PostCard key={p.post_id} post={p} onRefresh={fetchProfileData} />)
        )}
      </div>
    </div>
  );
};

const CreatePostPage: React.FC = () => {
  const { token, darkMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sharePost = location.state?.sharePost as Post | undefined;

  const [content, setContent] = useState('');
  const [type, setType] = useState('public');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await api.posts.create({
        token,
        type,
        content,
        image,
        share_post_id: sharePost?.post_id,
      });
      navigate('/');
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={`rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-8 shadow-xl animate-in slide-in-from-bottom-10 duration-500`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black">Create Post</h2>
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl"><X size={20} /></button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="font-bold text-xs uppercase text-gray-400 tracking-wider">Visibility:</div>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className={`text-xs font-black uppercase py-2 px-4 rounded-xl border appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}
        >
          <option value="public">🌍 Public</option>
          <option value="anonymous">👤 Anonymous</option>
          <option value="follower">👥 Followers</option>
        </select>
      </div>

      <textarea
        autoFocus
        className="w-full text-xl font-medium focus:outline-none resize-none min-h-[200px] bg-transparent placeholder:text-gray-300"
        placeholder="Share something interesting..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {image && (
        <div className="relative mb-6">
          <img src={URL.createObjectURL(image)} className="w-full rounded-3xl shadow-lg" />
          <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full backdrop-blur-sm"><X size={16} /></button>
        </div>
      )}

      {sharePost && (
        <div className="mb-6 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Send size={14} className="text-indigo-600" />
            <span className="text-xs font-black uppercase text-indigo-600">Sharing Post</span>
          </div>
          <p className="text-sm font-bold truncate opacity-60">From: {sharePost.username}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-slate-800">
        <label className="flex items-center gap-3 px-5 py-3 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl cursor-pointer font-black text-sm hover:scale-105 active:scale-95 transition-all">
          <ImageIcon size={22} strokeWidth={2.5} />
          Media
          <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </label>
        <button 
          disabled={loading || (!content && !image && !sharePost)}
          onClick={onSubmit}
          className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 disabled:opacity-50 hover:bg-indigo-700 transition-all"
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>
    </div>
  );
};

const SearchPage: React.FC = () => {
  const { token, darkMode } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!token || !query) return;
    setLoading(true);
    try {
      const res = await api.posts.search(token, query);
      setResults(res.posts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="relative group">
        <input 
          type="text"
          placeholder="Explore people and conversations..."
          className={`w-full px-7 py-5 pl-16 rounded-[2rem] border font-bold text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={24} strokeWidth={3} />
        <button onClick={handleSearch} className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-black">Search</button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-indigo-600" size={32} /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black">Find what matters to you</div>
        ) : (
          results.map((item, i) => (
            <div 
              key={i} 
              onClick={() => navigate(`/profile/${item.user_id}`)} 
              className={`p-5 rounded-[2rem] border ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30' : 'bg-white border-gray-100 hover:border-indigo-500/20'} flex items-center gap-5 cursor-pointer shadow-sm transition-all hover:translate-x-1`}
            >
              <img src={item.profile} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
              <div>
                <div className="font-black text-lg">{item.username}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.type}</div>
              </div>
              <ArrowRight className="ml-auto text-gray-300" size={20} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const { token, darkMode } = useAuth();
  const [notis, setNotis] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchNotis = async () => {
    if (!token) return;
    try {
      setError(null);
      const res = await api.user.notifications(token);
      setNotis(res.notis || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotis();
  }, [token]);

  if (loading) return <div className="flex justify-center p-20"><RefreshCw className="animate-spin text-indigo-600" size={30} /></div>;
  if (error) return <ConnectionError onRetry={fetchNotis} error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black">Notifications</h2>
        <button onClick={fetchNotis} className="p-2 text-gray-400 hover:text-indigo-600"><RefreshCw size={18} /></button>
      </div>
      
      {notis.length === 0 ? (
        <div className="text-center py-32 opacity-20">
          <Bell size={60} className="mx-auto mb-4" />
          <p className="font-black text-xl">Peaceful here</p>
        </div>
      ) : (
        notis.map((n, i) => (
          <div 
            key={i} 
            className={`p-5 rounded-[2rem] border animate-in slide-in-from-right duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex items-center gap-5 cursor-pointer hover:shadow-md transition-all`} 
            onClick={() => navigate(`/profile/${n.user_id}`)}
          >
            <div className="relative">
              <img src={n.profile} className="w-14 h-14 rounded-2xl object-cover" />
              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-4 ${darkMode ? 'border-slate-900' : 'border-white'} ${n.type === 'like' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                {n.type === 'like' ? <Heart size={10} fill="white" color="white" /> : <UserPlus size={10} color="white" strokeWidth={3} />}
              </div>
            </div>
            <div className="text-sm">
              <span className="font-black text-base">{n.username}</span> 
              <p className="text-gray-500 font-bold">{n.type === 'like' ? 'reacted to your post' : 'started following you'}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode, logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black px-2">Settings</h2>
      
      <div className={`rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 flex items-center gap-5 shadow-sm`}>
        <img src={user?.profile} className="w-20 h-20 rounded-[1.5rem] object-cover" />
        <div>
          <h3 className="text-xl font-black">{user?.username}</h3>
          <p className="text-gray-400 font-bold text-sm">{user?.email}</p>
          <button onClick={() => navigate(`/profile/${user?.user_id}`)} className="mt-2 text-indigo-600 font-black text-xs uppercase tracking-widest">View Public Profile</button>
        </div>
      </div>

      <div className={`rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} overflow-hidden shadow-sm`}>
        <div className="p-6 flex items-center justify-between border-b dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              {darkMode ? <Moon size={22} /> : <Sun size={22} />}
            </div>
            <div>
              <span className="font-black block">Display Theme</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{darkMode ? 'Dark Mode Active' : 'Light Mode Active'}</span>
            </div>
          </div>
          <button 
            onClick={toggleDarkMode} 
            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${darkMode ? 'right-1.5' : 'left-1.5'}`} />
          </button>
        </div>

        <div className="p-6 flex items-center justify-between border-b dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="font-black block">Account Security</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verified Secure</span>
            </div>
          </div>
          <button className="text-gray-400"><ChevronLeft className="rotate-180" size={20}/></button>
        </div>

        <button 
          onClick={() => window.open(`${BASE_URL}/rand/friends`, '_blank')}
          className="w-full p-6 flex items-center gap-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <ExternalLink size={22} />
          </div>
          <div className="text-left">
            <span className="font-black block">Repair Connection</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fix CORS/SSL Issues</span>
          </div>
        </button>

        <button 
          onClick={logout} 
          className="w-full p-6 flex items-center gap-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
        >
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/30">
            <LogOut size={22} />
          </div>
          <span className="font-black text-lg">Log Out Session</span>
        </button>
      </div>
      
      <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">Ketcher Social v1.0.0 • Built with Passion</p>
    </div>
  );
};

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ketcher_token'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('ketcher_dark') === 'true');
  const [hasSeenIntro, setHasSeenIntro] = useState(localStorage.getItem('ketcher_intro') === 'true');

  useEffect(() => {
    const savedUser = localStorage.getItem('ketcher_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const login = (userData: User) => {
    setUser(userData);
    setToken(userData.token || null);
    if (userData.token) localStorage.setItem('ketcher_token', userData.token);
    localStorage.setItem('ketcher_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ketcher_token');
    localStorage.removeItem('ketcher_user');
  };

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('ketcher_dark', newVal.toString());
  };

  const completeIntro = () => {
    setHasSeenIntro(true);
    localStorage.setItem('ketcher_intro', 'true');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, darkMode, toggleDarkMode, hasSeenIntro, completeIntro }}>
      {loading ? <Splash /> : children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, hasSeenIntro } = useAuth();
  if (!hasSeenIntro) return <IntroPage />;
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
