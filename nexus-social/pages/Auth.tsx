
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { AppState } from '../types';

interface AuthProps {
  mode: AppState;
  setMode: (mode: AppState) => void;
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, setMode, onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="mb-8">
        {mode !== 'login' && (
          <button onClick={() => setMode('login')} className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-indigo-600 mb-2 uppercase tracking-tighter">
            {mode === 'login' && 'Nexus Login'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot-password' && 'Recover Access'}
          </h1>
          <p className="text-gray-500 text-sm">
            {mode === 'login' && 'Join the conversation again'}
            {mode === 'signup' && 'Join thousands of users globally'}
            {mode === 'forgot-password' && "We'll send recovery instructions to your email"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                required
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
              required
            />
          </div>

          {mode !== 'forgot-password' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              mode === 'login' ? 'Continue' : mode === 'signup' ? 'Create' : 'Send Code'
            )}
          </button>
        </form>

        <div className="mt-10 text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <p>New to Nexus? <button onClick={() => setMode('signup')} className="font-black text-indigo-600 underline">Sign Up</button></p>
          ) : (
            <p>Back to <button onClick={() => setMode('login')} className="font-black text-indigo-600 underline">Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
