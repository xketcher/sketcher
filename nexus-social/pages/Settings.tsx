
import React from 'react';
import { User, Shield, Bell, HelpCircle, LogOut, Moon, Sun, ChevronRight, Globe } from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, isDarkMode, toggleDarkMode }) => {
  const SettingItem = ({ icon: Icon, label, color, right = true, onClick }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={color} size={20} />
        </div>
        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      {right && <ChevronRight className="text-gray-300 dark:text-gray-600" size={20} />}
    </button>
  );

  return (
    <div className="p-4 pb-20 dark:bg-slate-950 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Settings</h2>

      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Account</p>
        <SettingItem icon={User} label="Account Information" color="text-indigo-600" />
        <SettingItem icon={Shield} label="Privacy & Security" color="text-green-600" />
        <SettingItem icon={Bell} label="Notifications" color="text-orange-600" />
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Preferences</p>
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'text-yellow-500' : 'text-purple-600'} bg-opacity-10 dark:bg-opacity-20`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
          </div>
        </button>
        <SettingItem icon={Globe} label="Language" color="text-blue-600" />
      </div>

      <div className="mb-10">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Other</p>
        <SettingItem icon={HelpCircle} label="Help & Support" color="text-cyan-600" />
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-colors mt-4"
        >
          <div className="p-2.5 rounded-xl bg-red-600 bg-opacity-10">
            <LogOut size={20} />
          </div>
          <span className="font-bold text-sm">Log Out</span>
        </button>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nexus Social v1.0.5</p>
      </div>
    </div>
  );
};

export default Settings;
