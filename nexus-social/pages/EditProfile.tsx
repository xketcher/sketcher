
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowLeft, Camera, Check } from 'lucide-react';

interface EditProfileProps {
  user: User;
  onBack: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onBack }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    cover: user.coverImage
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onBack();
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-50 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 dark:text-white"><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold dark:text-white">Edit Profile</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Check size={16} /> Done</>}
        </button>
      </div>

      <div className="p-6">
        <div className="relative mb-20">
          {/* Cover Photo */}
          <div className="relative h-40 w-full bg-gray-100 dark:bg-slate-900 rounded-3xl overflow-hidden group">
            <img src={formData.cover} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white" size={32} />
            </div>
          </div>
          
          {/* Avatar Photo */}
          <div className="absolute -bottom-14 left-6 group">
            <div className="w-28 h-28 rounded-3xl border-4 border-white dark:border-slate-950 overflow-hidden bg-gray-200 shadow-2xl relative">
              <img src={formData.avatar} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Display Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Bio</label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
