
import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2, Camera } from 'lucide-react';

interface VideoCallOverlayProps {
  participant: User;
  onEndCall: () => void;
}

const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ participant, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }

    setupCamera();

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
      {/* Remote Participant View (Simulated) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img 
          src={participant.coverImage || participant.avatar} 
          className="w-full h-full object-cover opacity-40 blur-xl scale-110" 
          alt="background"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 p-1 animate-pulse mb-6">
              <img src={participant.avatar} className="w-full h-full rounded-full object-cover shadow-2xl" alt={participant.name} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{participant.name}</h2>
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium tracking-wider">{formatTime(callDuration)}</span>
          </div>
        </div>
      </div>

      {/* Local Preview (PIP) */}
      <div className="absolute top-6 right-6 w-32 h-48 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all hover:scale-105 group">
        {!isVideoOff ? (
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <VideoOff className="text-white/20" size={32} />
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">You</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-12 flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button 
          className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"
        >
          <Camera size={24} />
        </button>

        <button 
          onClick={onEndCall}
          className="p-5 bg-red-600 text-white rounded-3xl hover:bg-red-700 hover:rotate-12 transition-all shadow-xl shadow-red-600/30"
        >
          <PhoneOff size={28} />
        </button>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default VideoCallOverlay;
