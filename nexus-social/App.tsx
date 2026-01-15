
import React, { useState, useEffect } from 'react';
import { AppState, User } from './types';
import Splash from './pages/Splash';
import Intro from './pages/Intro';
import Auth from './pages/Auth';
import MainLayout from './components/MainLayout';
import { MOCK_USER } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        setAppState('intro');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    setUser(MOCK_USER);
    setAppState('home');
  };

  const handleLogout = () => {
    setUser(null);
    setAppState('login');
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  switch (appState) {
    case 'splash':
      return <Splash />;
    case 'intro':
      return <Intro onFinish={() => setAppState('login')} />;
    case 'login':
    case 'signup':
    case 'forgot-password':
      return (
        <Auth 
          mode={appState} 
          setMode={setAppState} 
          onLogin={handleLogin} 
        />
      );
    case 'home':
      return <MainLayout user={user!} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    default:
      return <Splash />;
  }
};

export default App;
