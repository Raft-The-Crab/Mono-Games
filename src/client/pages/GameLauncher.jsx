import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import { CORE_GAMES } from '../services/gameStore';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function GameLauncher() {
  const navigate = useNavigate();
  const { installedGames, loadGames, isLoading } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const gameIcons = {
    'snake': '🐍',
    'pong': '🏓',
    'tetris': '🧱',
    '2048': '🔢',
    'memory-match': '🃏',
    'racing': '🏎️',
    'breakout': '🧱',
    'tic-tac-toe': '❌',
    'connect-four': '🔴',
    'flappy-bird': '🐦',
    'minesweeper': '💣',
    'space-invaders': '👾',
    'chess': '♟️'
  };

  const gameBadges = {
    'pong': 'AI',
    '2048': 'NEW',
    'racing': 'HOT',
    'snake': null
  };

  const coreGames = CORE_GAMES.map((id) => ({
    id,
    name: formatGameName(id),
    icon: gameIcons[id] || '🎮',
    badge: gameBadges[id] || null,
    core: true,
    installed: true,
    size: '2MB',
    version: '1.0.0',
    lastPlayed: getRandomDate()
  }));

  const allGames = [...coreGames, ...installedGames.filter((g) => !g.core)];

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'core' && game.core) ||
      (filter === 'downloaded' && !game.core);
    return matchesSearch && matchesFilter;
  });

  const handlePlayGame = (gameId) => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating decorations */}
      <div className="star-container">
        <div className="floating-star star-1"></div>
        <div className="floating-star star-2"></div>
        <div className="floating-star star-3"></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '2rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="cartoony-title" style={{ marginBottom: '0.5rem' }}>
              🎮 Game Launcher
            </h1>
            <p style={{
              fontFamily: "'Comic Sans MS', cursive",
              color: 'var(--text-secondary)',
              fontSize: '1.125rem'
            }}>
              {allGames.length} games ready to play!
            </p>
          </div>

          {/* Search & Filters */}
          <div className="cartoony-card" style={{
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end'
            }}>
              {/* Search */}
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  🔍 Search
                </label>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cartoony-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Filter */}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  🗂️ Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="cartoony-input"
                  style={{ width: '100%' }}
                >
                  <option value="all">All Games</option>
                  <option value="core">Core Games</option>
                  <option value="downloaded">Downloaded</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    border: viewMode === 'grid'
                      ? '3px solid var(--primary)'
                      : '3px solid var(--border-color)',
                    background: viewMode === 'grid' ? 'var(--primary)' : 'var(--bg-card)',
                    color: viewMode === 'grid' ? 'white' : 'var(--text-primary)',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    border: viewMode === 'list'
                      ? '3px solid var(--primary)'
                      : '3px solid var(--border-color)',
                    background: viewMode === 'list' ? 'var(--primary)' : 'var(--bg-card)',
                    color: viewMode === 'list' ? 'white' : 'var(--text-primary)',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  ≡
                </button>
              </div>
            </div>
          </div>

          {/* Games Display */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p style={{
                marginTop: '1rem',
                fontFamily: "'Comic Sans MS', cursive",
                color: 'var(--text-secondary)'
              }}>
                Loading games...
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="cartoony-card pop-on-hover"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    animationDelay: `${index * 0.05}s`
                  }}
                  onClick={() => handlePlayGame(game.id)}
                >
                  {/* Badge */}
                  {(game.badge || game.core) && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '12px'
                    }}>
                      <span className={`cartoony-badge ${game.badge === 'NEW' ? 'cartoony-badge-new' :
                          game.badge === 'AI' ? 'cartoony-badge-online' : ''
                        }`}>
                        {game.badge || 'CORE'}
                      </span>
                    </div>
                  )}

                  {/* Game Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--bg-pattern) 0%, var(--bg-main) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    margin: '0 auto 1rem',
                    border: '4px solid var(--border-color)',
                    boxShadow: '0 4px 0 var(--border-color)'
                  }}>
                    {game.icon}
                  </div>

                  {/* Game Name */}
                  <h3 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    {game.name}
                  </h3>

                  {/* Game Info */}
                  <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                  }}>
                    v{game.version} • {game.size}
                  </p>

                  {/* Play Button */}
                  <button
                    className="cartoony-btn"
                    style={{ width: '100%', fontSize: '1rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game.id);
                    }}
                  >
                    ▶ Play Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="cartoony-card"
                  style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePlayGame(game.id)}
                >
                  {/* Icon */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-pattern)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    border: '3px solid var(--border-color)',
                    flexShrink: 0
                  }}>
                    {game.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{
                        fontFamily: "'Comic Sans MS', cursive",
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        {game.name}
                      </h3>
                      {game.badge && (
                        <span className={`cartoony-badge ${game.badge === 'NEW' ? 'cartoony-badge-new' :
                            game.badge === 'AI' ? 'cartoony-badge-online' : ''
                          }`} style={{ transform: 'scale(0.85)' }}>
                          {game.badge}
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0'
                    }}>
                      v{game.version} • {game.size} • {game.core ? 'Core Game' : 'Downloaded'}
                    </p>
                  </div>

                  {/* Play Button */}
                  <button
                    className="cartoony-btn"
                    style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game.id);
                    }}
                  >
                    ▶ Play
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Games Found */}
          {filteredGames.length === 0 && !isLoading && (
            <div className="cartoony-card" style={{
              padding: '4rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 className="cartoony-subtitle" style={{ marginBottom: '1rem' }}>
                No games found
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Try adjusting your search or download more games from the store!
              </p>
              <Link to="/store">
                <button className="cartoony-btn">
                  📦 Visit Store
                </button>
              </Link>
            </div>
          )}
        </div>
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

function getRandomDate() {
  const days = Math.floor(Math.random() * 7);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default GameLauncher;
