
import React, { useState, useRef } from 'react';
import { User, Post as PostType, Comment } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Sparkles, 
  X, 
  Send,
  Plus,
  Loader2,
  Wand2,
  Trash2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface FeedProps {
  user: User;
  posts: PostType[];
  setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
  onActivity: (type: 'like' | 'comment', content: string) => void;
}

const PostCard: React.FC<{ post: PostType; currentUser: User; onUpdate: (p: PostType) => void; onDelete: (id: string) => void; onActivity: (type: 'like' | 'comment', content: string) => void }> = ({ post, currentUser, onUpdate, onDelete, onActivity }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    const updatedPost = {
      ...post,
      liked: !post.liked,
      likes: post.liked ? post.likes - 1 : post.likes + 1
    };
    onUpdate(updatedPost);
    if (!post.liked) onActivity('like', `liked your post: "${post.content.substring(0, 20)}..."`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: commentText,
      timestamp: 'Just now'
    };

    const updatedPost = {
      ...post,
      comments: post.comments + 1,
      commentsList: [newComment, ...(post.commentsList || [])]
    };
    onUpdate(updatedPost);
    onActivity('comment', `commented on your post: "${commentText.substring(0, 20)}..."`);
    setCommentText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 mb-2 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800" />
          <div>
            <h3 className="font-bold text-sm dark:text-white">{post.userName}</h3>
            <span className="text-xs text-gray-400 font-medium">{post.timestamp}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {post.userId === currentUser.id && (
            <button onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button className="text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 p-1 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
      
      <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
      
      {post.image && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 dark:border-slate-800 shadow-sm">
          <img src={post.image} className="w-full object-cover max-h-[500px]" alt="Post content" />
        </div>
      )}

      {post.video && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 dark:border-slate-800 bg-black aspect-video relative group">
          <video src={post.video} className="w-full h-full object-contain" controls />
        </div>
      )}

      <div className="flex items-center gap-6 pt-3 border-t border-gray-50 dark:border-slate-800">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
        >
          <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} className={post.liked ? 'animate-bounce' : ''} />
          {post.likes}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${showComments ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
        >
          <MessageCircle size={20} />
          {post.comments}
        </button>
        <button 
          onClick={() => alert('Link copied!')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 ml-auto transition-colors"
        >
          <Share2 size={20} />
          Share
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleAddComment} className="flex gap-3">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
              />
              <button type="submit" disabled={!commentText.trim()} className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50"><Send size={16} /></button>
            </div>
          </form>

          <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
            {post.commentsList?.map(comment => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-left-1">
                <img src={comment.userAvatar} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[11px] text-gray-900 dark:text-white">{comment.userName}</span>
                    <span className="text-[9px] text-gray-400 font-medium">{comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Feed: React.FC<FeedProps> = ({ user, posts, setPosts, onActivity }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const handleMediaSelect = (type: 'image' | 'video') => {
    const mockUrl = type === 'image' 
      ? `https://picsum.photos/seed/${Date.now()}/800/600` 
      : 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-at-sunset-viewed-from-above-4112-large.mp4';
    setSelectedMedia({ type, url: mockUrl });
  };

  const handlePostSubmit = () => {
    if (!newPostContent.trim() && !selectedMedia) return;
    const post: PostType = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newPostContent,
      image: selectedMedia?.type === 'image' ? selectedMedia.url : undefined,
      video: selectedMedia?.type === 'video' ? selectedMedia.url : undefined,
      likes: 0,
      comments: 0,
      commentsList: [],
      timestamp: 'Just now',
      liked: false
    };
    setPosts([post, ...posts]);
    setNewPostContent('');
    setSelectedMedia(null);
  };

  const handleGenerateAiPost = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a social media post about: "${aiPrompt}". Return JSON with content, hashtags array, and tone string.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              tone: { type: Type.STRING }
            },
            required: ['content', 'hashtags', 'tone']
          }
        }
      });
      setAiSuggestion(JSON.parse(response.text || '{}'));
    } catch (e) { alert('AI Error'); } finally { setAiLoading(false); }
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="flex overflow-x-auto p-4 gap-4 no-scrollbar bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-indigo-600 p-0.5 relative">
            <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-sm"><Plus size={10} strokeWidth={4} /></div>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter dark:text-gray-400">Story</span>
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-400 p-0.5 group-hover:border-indigo-600 transition-colors">
              <img src={`https://picsum.photos/seed/user${i}/200/200`} className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">Friend {i}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800 p-4 mb-2 shadow-sm">
        <div className="flex gap-4">
          <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-slate-800" />
          <div className="flex-1">
            <textarea 
              value={newPostContent} 
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?" 
              className="w-full bg-transparent py-2 focus:outline-none resize-none min-h-[60px] text-sm dark:text-white"
            />
            {selectedMedia && (
              <div className="relative mt-2 rounded-xl overflow-hidden">
                {selectedMedia.type === 'image' ? <img src={selectedMedia.url} className="w-full h-48 object-cover" /> : <video src={selectedMedia.url} className="w-full h-48 object-cover" muted />}
                <button onClick={() => setSelectedMedia(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X size={16} /></button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 border-t border-gray-50 dark:border-slate-800 pt-3">
          <div className="flex gap-1 text-gray-500">
            <button onClick={() => handleMediaSelect('image')} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"><ImageIcon size={20} /></button>
            <button onClick={() => handleMediaSelect('video')} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"><VideoIcon size={20} /></button>
            <button onClick={() => setShowAiAssistant(!showAiAssistant)} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${showAiAssistant ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}><Sparkles size={20} /></button>
          </div>
          <button onClick={handlePostSubmit} disabled={!newPostContent.trim() && !selectedMedia} className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black text-sm shadow-lg disabled:opacity-50 active:scale-95 transition-all">Post</button>
        </div>

        {showAiAssistant && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400"><Wand2 size={18} /><h4 className="font-bold text-sm">AI Assistant</h4></div>
              <button onClick={() => {setShowAiAssistant(false); setAiSuggestion(null);}} className="text-indigo-300 hover:text-indigo-600"><X size={18} /></button>
            </div>
            {!aiSuggestion ? (
              <div className="flex gap-2">
                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Post topic..." className="flex-1 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none dark:text-white" />
                <button onClick={handleGenerateAiPost} disabled={aiLoading || !aiPrompt.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">{aiLoading ? <Loader2 size={16} className="animate-spin" /> : 'Draft'}</button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-800"><p className="text-sm dark:text-gray-200 italic">"{aiSuggestion.content}"</p><div className="mt-2 flex flex-wrap gap-1">{aiSuggestion.hashtags.map((h: string) => <span key={h} className="text-indigo-600 text-xs">{h}</span>)}</div></div>
                <div className="flex gap-2"><button onClick={() => {setNewPostContent(`${aiSuggestion.content}\n\n${aiSuggestion.hashtags.join(' ')}`); setShowAiAssistant(false); setAiSuggestion(null);}} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold">Apply</button><button onClick={() => setAiSuggestion(null)} className="px-4 py-2 bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold">Retry</button></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={user} 
            onUpdate={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
            onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
            onActivity={onActivity}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
