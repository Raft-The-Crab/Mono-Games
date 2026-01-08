import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import useSettingsStore from './store/settingsStore';
import useAuthStore from './store/authStore';
import audioManager, { MusicTracks } from './utils/audioManager';
import { NotificationProvider } from './components/NotificationProvider';
import { ToastProvider } from './components/ToastNotification';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import type React from 'react';

// Pages
import Home from './pages/Home';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Launcher = lazy(() => import('./pages/GameLauncher'));
const GamePlay = lazy(() => import('./pages/GamePlay'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Settings = lazy(() => import('./pages/Settings'));
const GameStore = lazy(() => import('./pages/GameStore'));
const PremiumGameStore = lazy(() => import('./components/PremiumGameStore') as any);
const Help = lazy(() => import('./pages/Help'));
import Profile from './pages/Profile';

// Layout
import Layout from './components/layout/Layout';
import FPSCounter from './components/FPSCounter';

// Styles
import './styles/responsive.css';
import './styles/transitions.css';

const AppContent: React.FC = () => {
  const { loadSettings, settings } = useSettingsStore();
  const { initAuth } = useAuthStore();
  const location = useLocation();
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize app
  useEffect(() => {
    loadSettings();
    initAuth();

    // Initialize audio on first user interaction
    const initAudio = () => {
      if (!audioInitialized) {
        audioManager.init();
        setAudioInitialized(true);

        // Play menu music (if available)
        if (settings.audio.musicVolume > 0 && MusicTracks.menu) {
          audioManager.playMusic(MusicTracks.menu, { volume: 0.6 });
        }

        // Remove listeners after first init
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      }
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, [loadSettings, initAuth, audioInitialized, settings.audio.musicVolume]);

  // Handle music changes based on route
  useEffect(() => {
    if (!audioInitialized || settings.audio.musicVolume === 0) return;

    const path = location.pathname;

    if (path.startsWith('/play/') && MusicTracks.gameplay) {
      audioManager.playMusic(MusicTracks.gameplay, { volume: 0.4, fadeIn: true });
    } else if ((path === '/' || path === '/store' || path === '/launcher') && MusicTracks.menu) {
      audioManager.playMusic(MusicTracks.menu, { volume: 0.6, fadeIn: true });
    }
  }, [location.pathname, audioInitialized, settings.audio.musicVolume]);

  // Apply theme globally with enhanced colors
  useEffect(() => {
    const themes = {
      light: {
        primary: '#FF6B35',
        bg: '#FFF8DC',
        bgCard: '#FFFFFF',
        text: '#2C3E50',
        textSecondary: '#546E7A',
        border: '#FFB347',
        gradient: 'linear-gradient(180deg, #87CEEB 0%, #FFE5B4 100%)'
      },
      dark: {
        primary: '#FF6B35',
        bg: '#1A1A2E',
        bgCard: '#252542',
        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        border: '#3D3D5C',
        gradient: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)'
      },
      ocean: {
        primary: '#4ECDC4',
        bg: '#E8F6F3',
        bgCard: '#FFFFFF',
        text: '#1A535C',
        textSecondary: '#4ECDC4',
        border: '#4ECDC4',
        gradient: 'linear-gradient(180deg, #E8F6F3 0%, #B8E6E1 100%)'
      },
      sunset: {
        primary: '#E63946',
        bg: '#FFF0F0',
        bgCard: '#FFFFFF',
        text: '#2C3E50',
        textSecondary: '#E63946',
        border: '#FFB4A2',
        gradient: 'linear-gradient(180deg, #FFD3B6 0%, #FFA5A5 100%)'
      },
      forest: {
        primary: '#2D6A4F',
        bg: '#F0F7F4',
        bgCard: '#FFFFFF',
        text: '#1B4332',
        textSecondary: '#52B788',
        border: '#95D5B2',
        gradient: 'linear-gradient(180deg, #D8F3DC 0%, #B7E4C7 100%)'
      },
      purple: {
        primary: '#7B2CBF',
        bg: '#F5F0FF',
        bgCard: '#FFFFFF',
        text: '#3C096C',
        textSecondary: '#9D4EDD',
        border: '#C77DFF',
        gradient: 'linear-gradient(180deg, #E0AAFF 0%, #C77DFF 100%)'
      },
      retro: {
        primary: '#00FF00',
        bg: '#0A0A0A',
        bgCard: '#1A1A1A',
        text: '#00FF00',
        textSecondary: '#00AA00',
        border: '#00FF00',
        gradient: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)'
      },
      neon: {
        primary: '#FF00FF',
        bg: '#0D0221',
        bgCard: '#1A0B2E',
        text: '#00FFF5',
        textSecondary: '#FF00FF',
        border: '#7209B7',
        gradient: 'linear-gradient(180deg, #0D0221 0%, #3A0CA3 100%)'
      }
    };

    const currentTheme = settings.display.theme || 'light';
    const theme = themes[currentTheme] || themes.light;

    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--bg-main', theme.bg);
    document.documentElement.style.setProperty('--bg-card', theme.bgCard);
    document.documentElement.style.setProperty('--text-primary', theme.text);
    document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);
    document.documentElement.style.setProperty('--border-color', theme.border);
    document.documentElement.style.setProperty('--bg-gradient', theme.gradient);

    // Add theme class to body
    document.body.className = `theme-${currentTheme}`;
  }, [settings.display.theme]);

  return (
    <>
      <FPSCounter />
      <SyncStatusIndicator />
      <Layout>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Loading...
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/launcher" element={<Launcher />} />
            <Route path="/store" element={<GameStore />} />
            <Route path="/play/:gameId" element={<GamePlay />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium-store" element={<PremiumGameStore />} />
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/launcher" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
