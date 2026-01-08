import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadGame } from '../services/gameStore';
import { PlayIcon, PauseIcon, HomeIcon, GamepadIcon, RefreshIcon } from '../components/Icons';
import type React from 'react';

interface GameInfo {
  score: number;
  highScore: number;
}

interface GameInstance {
  score?: number;
  highScore?: number;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  destroy: () => void;
}

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const gameInstanceRef = useRef<GameInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitializing = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo>({ score: 0, highScore: 0 });
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (isInitializing.current) {
      console.log('[GamePlay] Already initializing, skipping...');
      return;
    }
    
    isInitializing.current = true;
    let mounted = true;
    let scoreInterval: NodeJS.Timeout | null = null;

    const initGame = async () => {
      try {
        console.log('[GamePlay] Starting game initialization for:', gameId);
        setIsLoading(true);
        setError(null);

        // Wait a bit for React to finish rendering
        await new Promise(resolve => setTimeout(resolve, 150));

        if (!mounted) {
          console.log('[GamePlay] Component unmounted before init');
          return;
        }

        // Check if container exists
        const container = containerRef.current;
        if (!container) {
          console.error('[GamePlay] Container ref is null after wait!');
          setError('Game container failed to initialize');
          setIsLoading(false);
          return;
        }

        console.log('[GamePlay] Container found, loading game class...');
        
        // Load game class
        const GameClass = await loadGame(gameId);
        console.log('[GamePlay] Game class loaded');

        if (!mounted) {
          console.log('[GamePlay] Component unmounted after loading');
          return;
        }

        // Set container ID
        container.id = 'game-container';

        // Initialize game
        console.log('[GamePlay] Creating game instance...');
        const game = new GameClass('game-container');
        
        console.log('[GamePlay] Initializing game...');
        game.init();
        
        console.log('[GamePlay] Starting game...');
        game.start();

        gameInstanceRef.current = game;
        console.log('[GamePlay] ✅ Game ready!');
        setIsLoading(false);

        // Poll for score updates
        scoreInterval = setInterval(() => {
          if (gameInstanceRef.current) {
            setGameInfo({
              score: gameInstanceRef.current.score || 0,
              highScore: gameInstanceRef.current.highScore || 0
            });
          }
        }, 100);

      } catch (err: any) {
        console.error('❌ Failed to load game:', err);
        if (mounted) {
          setError(err?.message || 'Failed to load game');
          setIsLoading(false);
        }
      }
    };

    initGame();

    return () => {
      console.log('[GamePlay] Cleanup');
      mounted = false;
      isInitializing.current = false;
      if (scoreInterval) clearInterval(scoreInterval);
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.destroy();
        } catch (e) {
          console.warn('[GamePlay] Error during game cleanup:', e);
        }
        gameInstanceRef.current = null;
      }
    };
  }, [gameId]);
        try {
          gameInstanceRef.current.destroy();
        } catch (e) { }
        gameInstanceRef.current = null;
      }
    };
  }, [gameId]);

  const handlePause = () => {
    if (gameInstanceRef.current) {
      if (isPaused) {
        gameInstanceRef.current.resume();
        setIsPaused(false);
      } else {
        gameInstanceRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleRestart = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.reset();
      setIsPaused(false);
    }
  };

  const handleExit = () => {
    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy();
      } catch (e) { }
      gameInstanceRef.current = null;
    }
    navigate('/launcher');
  };

  const formatGameName = (id: string) => {
    return id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (error) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', flexDirection: 'column',
        background: 'linear-gradient(180deg, #87CEEB 0%, #FFE5B4 100%)'
      }}>
        <div style={{
          background: 'white', padding: '3rem', borderRadius: '24px',
          textAlign: 'center', maxWidth: '500px', border: '4px solid #FFB347',
          boxShadow: '0 8px 0 #FF6B35'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(230, 57, 70, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', border: '4px solid #E63946'
          }}>
            <GamepadIcon size={40} color="#E63946" />
          </div>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive",
            color: '#E63946', marginBottom: '1rem', fontSize: '1.75rem'
          }}>
            Oops! Game Error
          </h2>
          <p style={{ color: '#7F8C8D', marginBottom: '2rem' }}>
            {error}
          </p>
          <button onClick={handleExit} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#FF6B35', color: 'white', border: 'none',
            padding: '1rem 2rem', borderRadius: '50px', fontSize: '1rem',
            fontWeight: 700, fontFamily: "'Comic Sans MS', cursive",
            cursor: 'pointer', boxShadow: '0 4px 0 #C64F25'
          }}>
            <HomeIcon size={18} color="white" /> Back to Launcher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '1.5rem', display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #87CEEB 0%, #FFE5B4 100%)'
    }}>
      {/* Game Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem',
        background: 'white', borderRadius: '16px', border: '4px solid #FFB347',
        boxShadow: '0 4px 0 #FF6B35'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GamepadIcon size={28} color="#FF6B35" />
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive", fontWeight: 900,
            fontSize: '1.5rem', color: '#2C3E50', margin: 0
          }}>
            {formatGameName(gameId)}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginRight: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive", fontWeight: 900,
                fontSize: '1.5rem', color: '#FF6B35'
              }}>
                {gameInfo.score}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7F8C8D' }}>SCORE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive", fontWeight: 900,
                fontSize: '1.5rem', color: '#4ECDC4'
              }}>
                {gameInfo.highScore}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7F8C8D' }}>BEST</div>
            </div>
          </div>

          <button onClick={handlePause} style={{
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', background: '#FFF8DC', border: '3px solid #FFB347',
            borderRadius: '50px', fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #FFB347'
          }}>
            {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button onClick={handleRestart} style={{
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', background: '#FFF8DC',
            border: '3px solid #FFB347', borderRadius: '50px',
            fontFamily: "'Comic Sans MS', cursive", fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 3px 0 #FFB347'
          }}>
            <RefreshIcon size={16} /> Restart
          </button>

          <button onClick={handleExit} style={{
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', background: '#E63946', color: 'white', border: 'none',
            borderRadius: '50px', fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #B91C2C'
          }}>
            <HomeIcon size={16} color="white" /> Exit
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div ref={containerRef} style={{
        flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', minHeight: '500px'
      }}>
        {isLoading && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 1rem',
              border: '5px solid #FFB347', borderTop: '5px solid #FF6B35',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              fontFamily: "'Comic Sans MS', cursive", fontSize: '1.25rem',
              fontWeight: 700, color: '#FF6B35'
            }}>
              Loading {formatGameName(gameId)}...
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        marginTop: '1rem', textAlign: 'center', padding: '1rem',
        background: 'white', borderRadius: '16px', border: '3px solid #FFB347'
      }}>
        <p style={{
          color: '#7F8C8D', fontFamily: "'Comic Sans MS', cursive", margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          <GamepadIcon size={18} /> Arrow Keys / WASD to move • Space to pause • R to restart
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GamePlay;
