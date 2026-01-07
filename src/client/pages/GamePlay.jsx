import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadGame } from '../services/gameStore';
import { PlayIcon, PauseIcon, HomeIcon, GamepadIcon } from '../components/Icons';

function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const gameInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameInfo, setGameInfo] = useState({
    score: 0,
    highScore: 0
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load game class
        const GameClass = await loadGame(gameId);

        if (!mounted) return;

        // Initialize game with container ID
        const game = new GameClass('game-container');
        game.init();
        game.start();

        gameInstanceRef.current = game;
        setIsLoading(false);

        // Poll for score updates
        const scoreInterval = setInterval(() => {
          if (gameInstanceRef.current) {
            setGameInfo({
              score: gameInstanceRef.current.score || 0,
              highScore: gameInstanceRef.current.highScore || 0
            });
          }
        }, 100);

        return () => clearInterval(scoreInterval);

      } catch (err) {
        console.error('Failed to load game:', err);
        if (mounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    initGame();

    return () => {
      mounted = false;
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
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
      gameInstanceRef.current.destroy();
    }
    navigate('/launcher');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        background: 'var(--bg-gradient)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          marginBottom: '1.5rem'
        }}>
          <div className="loading-spinner" style={{
            width: '80px',
            height: '80px',
            border: '6px solid var(--border-color)',
            borderTop: '6px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <div style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--primary)'
        }}>
          Loading {formatGameName(gameId)}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        background: 'var(--bg-gradient)'
      }}>
        <div className="cartoony-card" style={{
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-circle)',
            background: 'rgba(230, 57, 70, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '4px solid var(--danger)'
          }}>
            <GamepadIcon size={40} color="var(--danger)" />
          </div>
          <h2 className="cartoony-subtitle" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
            Oops! Game Error
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {error}
          </p>
          <button onClick={handleExit} className="cartoony-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <HomeIcon size={18} color="white" /> Back to Launcher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-gradient)'
    }}>
      {/* Game Header */}
      <div className="cartoony-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '1rem 1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GamepadIcon size={28} color="var(--primary)" />
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 900,
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {formatGameName(gameId)}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginRight: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 900,
                fontSize: '1.5rem',
                color: 'var(--primary)'
              }}>
                {gameInfo.score}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SCORE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 900,
                fontSize: '1.5rem',
                color: 'var(--secondary)'
              }}>
                {gameInfo.highScore}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>BEST</div>
            </div>
          </div>

          <button
            onClick={handlePause}
            className="cartoony-btn cartoony-btn-secondary"
            style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={handleRestart}
            className="cartoony-btn cartoony-btn-secondary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            🔄 Restart
          </button>

          <button
            onClick={handleExit}
            className="cartoony-btn cartoony-btn-danger"
            style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <HomeIcon size={16} color="white" /> Exit
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div
        id="game-container"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      />

      {/* Controls Hint */}
      <div className="cartoony-card" style={{
        marginTop: '1rem',
        textAlign: 'center',
        padding: '1rem'
      }}>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: "'Comic Sans MS', cursive",
          margin: 0
        }}>
          🎮 Arrow Keys / WASD to move • Space to pause • R to restart
        </p>
      </div>
    </div>
  );
}

function formatGameName(id) {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default GamePlay;
