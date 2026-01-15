
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_REELS } from '../constants';
import { Heart, MessageCircle, Share2, Music, UserPlus, MoreVertical, Volume2, VolumeX } from 'lucide-react';

const ReelItem: React.FC<{ reel: any }> = ({ reel }) => {
  const [liked, setLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, []);

  return (
    <div className="relative h-screen w-full bg-black snap-start overflow-hidden flex flex-col justify-center">
      <video 
        ref={videoRef}
        src={reel.videoUrl} 
        autoPlay 
        loop 
        muted={isMuted}
        playsInline 
        className="h-full w-full object-cover"
      />
      
      {/* Click surface to mute/unmute */}
      <div onClick={() => setIsMuted(!isMuted)} className="absolute inset-0 z-10 cursor-pointer"></div>

      {/* Overlay Details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pb-24 pointer-events-none z-20">
        <div className="flex items-center gap-3 mb-4 pointer-events-auto">
          <img src={reel.userAvatar} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
          <span className="text-white font-bold text-sm drop-shadow-lg">{reel.userName}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); }}
            className={`transition-all duration-300 border px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isFollowing ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        
        <p className="text-white text-sm mb-4 line-clamp-2 drop-shadow-md">{reel.caption}</p>
        
        <div className="flex items-center gap-2 text-white/90">
          <Music size={14} className="animate-pulse" />
          <span className="text-[10px] font-medium tracking-wide drop-shadow-sm uppercase">{reel.musicName}</span>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-30 pointer-events-auto">
        <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1 group">
          <div className={`p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 group-active:scale-150 transition-all ${liked ? 'text-red-500' : 'text-white'}`}>
            <Heart size={26} fill={liked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-white text-[10px] font-black drop-shadow-md">{reel.likes + (liked ? 1 : 0)}</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white group-active:scale-110 transition-all">
            <MessageCircle size={26} />
          </div>
          <span className="text-white text-[10px] font-black drop-shadow-md">{reel.comments}</span>
        </button>
        
        <button onClick={() => alert('Shared!')} className="flex flex-col items-center gap-1 group">
          <div className="p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white group-active:scale-110 transition-all">
            <Share2 size={26} />
          </div>
          <span className="text-white text-[10px] font-black drop-shadow-md">SHARE</span>
        </button>

        <div onClick={() => setIsMuted(!isMuted)} className="p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white cursor-pointer transition-all active:scale-90">
          {isMuted ? <VolumeX size={26} /> : <Volume2 size={26} />}
        </div>
        
        <button className="text-white/60 p-2"><MoreVertical size={24} /></button>
      </div>
    </div>
  );
};

const Reels: React.FC = () => {
  return (
    <div className="h-screen bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar overscroll-none pb-20">
      {MOCK_REELS.map(reel => (
        <ReelItem key={reel.id} reel={reel} />
      ))}
    </div>
  );
};

export default Reels;
