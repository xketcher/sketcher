
import React, { useState } from 'react';
import { ChevronRight, Globe, ShieldCheck, Zap } from 'lucide-react';

interface IntroProps {
  onFinish: () => void;
}

const slides = [
  {
    icon: <Globe size={80} className="text-indigo-600" />,
    title: "Connect Globally",
    description: "Connect with friends and family around the world with instant messaging and feeds."
  },
  {
    icon: <Zap size={80} className="text-indigo-600" />,
    title: "Instant Sharing",
    description: "Share your life's best moments in seconds with our high-speed media engine."
  },
  {
    icon: <ShieldCheck size={80} className="text-indigo-600" />,
    title: "Privacy First",
    description: "Your data is yours. We ensure top-tier encryption and control over your presence."
  }
];

const Intro: React.FC<IntroProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onFinish();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col p-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
        <div className="bg-indigo-50 p-10 rounded-full">
          {slides[currentSlide].icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{slides[currentSlide].title}</h2>
          <p className="text-gray-500 mt-4 max-w-xs">{slides[currentSlide].description}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`} 
            />
          ))}
        </div>
        
        <button 
          onClick={nextSlide}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Intro;
