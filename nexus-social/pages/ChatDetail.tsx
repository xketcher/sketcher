
import React, { useState } from 'react';
import { ArrowLeft, Send, Phone, Video, Info, Paperclip, Smile } from 'lucide-react';
import { MOCK_CHATS } from '../constants';
import { User } from '../types';
import VideoCallOverlay from '../components/VideoCallOverlay';

interface ChatDetailProps {
  chatId: string;
  onBack: () => void;
  onOpenProfile: (user?: User) => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ chatId, onBack, onOpenProfile }) => {
  const chat = MOCK_CHATS.find(c => c.id === chatId) || MOCK_CHATS[0];
  const [message, setMessage] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey! How have you been?', sender: 'them', senderName: 'Sarah', senderAvatar: 'https://picsum.photos/seed/sarah/200/200', time: '10:45 AM' },
    { id: '2', text: 'I am doing great, just working on a new React project.', sender: 'me', senderName: 'You', senderAvatar: '', time: '10:46 AM' },
    { id: '3', text: chat.lastMessage, sender: 'them', senderName: 'Sarah', senderAvatar: 'https://picsum.photos/seed/sarah/200/200', time: '10:47 AM' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { 
      id: Date.now().toString(), 
      text: message, 
      sender: 'me', 
      senderName: 'You',
      senderAvatar: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setMessage('');
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setMessages([...messages, {
      id: Date.now().toString(),
      text: 'Video call ended',
      sender: 'system',
      senderName: 'System',
      senderAvatar: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <>
      {isCalling && !chat.isGroup && chat.participant && (
        <VideoCallOverlay 
          participant={chat.participant} 
          onEndCall={handleEndCall} 
        />
      )}
      
      <div className="flex flex-col h-screen bg-[#F8F9FE] dark:bg-slate-950">
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors dark:text-white"><ArrowLeft size={24} /></button>
            <div 
              onClick={() => onOpenProfile(chat.isGroup ? undefined : chat.participant)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <img src={chat.isGroup ? chat.groupAvatar : chat.participant?.avatar} className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-slate-700" />
                {!chat.isGroup && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{chat.isGroup ? chat.groupName : chat.participant?.name}</h3>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{chat.isGroup ? '3 members' : 'Online'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {!chat.isGroup && <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 rounded-xl transition-all"><Phone size={20} /></button>}
            {!chat.isGroup && <button onClick={() => setIsCalling(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 rounded-xl transition-all"><Video size={20} /></button>}
            <button onClick={() => onOpenProfile(chat.isGroup ? undefined : chat.participant)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"><Info size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 dark:bg-slate-950/50">
          <div className="flex justify-center my-4">
            <span className="bg-gray-200/50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Today</span>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'}`}>
              {msg.sender === 'system' ? (
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100/50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {msg.text} • {msg.time}
                </div>
              ) : (
                <>
                  {chat.isGroup && msg.sender !== 'me' && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <img src={msg.senderAvatar} className="w-4 h-4 rounded-full" />
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{msg.senderName}</span>
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative transition-all ${
                    msg.sender === 'me' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white rounded-tl-none border border-gray-100 dark:border-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[9px] mt-1 block opacity-70 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-2xl px-4 py-2 border border-gray-100 dark:border-slate-700">
            <button className="text-gray-400 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="flex-1 bg-transparent py-2 focus:outline-none text-sm dark:text-white"
            />
            <button className="text-gray-400 hover:text-yellow-500 transition-colors"><Smile size={20} /></button>
            <button 
              onClick={handleSend}
              className={`p-2 rounded-xl transition-all duration-300 ${message.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatDetail;
