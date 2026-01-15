
import React from 'react';
import { PlusSquare } from 'lucide-react';

const Splash: React.FC = () => {
  return (
    <div className="h-screen w-full bg-indigo-600 flex flex-col items-center justify-center text-white">
      <div className="relative">
        <div className="animate-ping absolute inset-0 bg-white/20 rounded-2xl scale-150"></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-2xl">
          <PlusSquare size={64} className="text-indigo-600" />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center animate-pulse">
        <h1 className="text-4xl font-black tracking-tighter">NEXUS</h1>
        <p className="text-indigo-200 text-sm mt-2 tracking-widest font-medium">CONNECTING LIVES</p>
      </div>
    </div>
  );
};

export default Splash;
