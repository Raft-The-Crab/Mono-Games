import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function GameStore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'arcade', name: 'Arcade', icon: '👾' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
    { id: 'strategy', name: 'Strategy', icon: '♟️' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'racing', name: 'Racing', icon: '🏎️' }
  ];

  const allGames = [
    // Core Games (installed)
    { id: 'snake', name: 'Snake', icon: '🐍', category: 'arcade', installed: true, core: true, rating: 4.8, downloads: '50K+', size: '2MB', description: 'Classic snake gameplay with power-ups!' },
    { id: 'pong', name: 'Pong', icon: '🏓', category: 'sports', installed: true, core: true, rating: 4.7, downloads: '45K+', size: '1.5MB', description: 'Classic paddle game with AI opponent' },
    { id: 'tetris', name: 'Tetris', icon: '🧱', category: 'puzzle', installed: true, core: true, rating: 4.9, downloads: '100K+', size: '2MB', description: 'Stack blocks and clear lines!' },
    { id: '2048', name: '2048', icon: '🔢', category: 'puzzle', installed: true, core: true, rating: 4.6, downloads: '75K+', size: '1MB', description: 'Merge tiles to reach 2048' },
    { id: 'memory-match', name: 'Memory Match', icon: '🃏', category: 'puzzle', installed: true, core: true, rating: 4.5, downloads: '30K+', size: '1.5MB', description: 'Match pairs of cards!' },
    { id: 'racing', name: 'Turbo Racer', icon: '🏎️', category: 'racing', installed: true, core: true, rating: 4.8, downloads: '60K+', size: '3MB', description: 'High-speed racing action!' },
    { id: 'breakout', name: 'Breakout', icon: '🧱', category: 'arcade', installed: true, core: true, rating: 4.4, downloads: '25K+', size: '1.5MB', description: 'Break all the bricks!' },

    // Downloadable Games
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '❌', category: 'strategy', installed: false, core: false, rating: 4.3, downloads: '40K+', size: '0.5MB', description: 'Classic X and O game with AI', isNew: true },
    { id: 'connect-four', name: 'Connect Four', icon: '🔴', category: 'strategy', installed: false, core: false, rating: 4.5, downloads: '35K+', size: '1MB', description: 'Drop discs and connect four!', isNew: true },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣', category: 'puzzle', installed: false, core: false, rating: 4.6, downloads: '55K+', size: '1MB', description: 'Find mines without exploding!' },
    { id: 'flappy-bird', name: 'Flappy Bird', icon: '🐦', category: 'arcade', installed: false, core: false, rating: 4.7, downloads: '80K+', size: '1.5MB', description: 'Tap to fly through pipes!', isHot: true },
    { id: 'space-invaders', name: 'Space Invaders', icon: '👾', category: 'arcade', installed: false, core: false, rating: 4.8, downloads: '70K+', size: '2MB', description: 'Defend Earth from aliens!' },
    { id: 'sudoku', name: 'Sudoku', icon: '🔢', category: 'puzzle', installed: false, core: false, rating: 4.4, downloads: '45K+', size: '1MB', description: 'Number puzzles for your brain' },
    { id: 'typing-test', name: 'Typing Test', icon: '⌨️', category: 'puzzle', installed: false, core: false, rating: 4.2, downloads: '20K+', size: '0.5MB', description: 'Test your typing speed!' },
    { id: 'chess', name: 'Chess', icon: '♟️', category: 'strategy', installed: false, core: false, rating: 4.9, downloads: '90K+', size: '2.5MB', description: 'The ultimate strategy game', isHot: true },
    { id: 'checkers', name: 'Checkers', icon: '⚫', category: 'strategy', installed: false, core: false, rating: 4.3, downloads: '30K+', size: '1MB', description: 'Classic board game with AI' },
    { id: 'simon-says', name: 'Simon Says', icon: '🎨', category: 'puzzle', installed: false, core: false, rating: 4.5, downloads: '25K+', size: '0.8MB', description: 'Test your memory!' }
  ];

  const [installedGames, setInstalledGames] = useState(
    allGames.filter(g => g.installed).map(g => g.id)
  );
  const [downloading, setDownloading] = useState([]);

  const handleDownload = (gameId) => {
    setDownloading([...downloading, gameId]);

    // Simulate download
    setTimeout(() => {
      setDownloading(downloading.filter(id => id !== gameId));
      setInstalledGames([...installedGames, gameId]);
    }, 2000);
  };

  const filteredGames = allGames
    .filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.downloads.localeCompare(a.downloads);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return parseFloat(a.size) - parseFloat(b.size);
      return 0;
    });

  const installedCount = installedGames.length;
  const totalCount = allGames.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="cartoony-title" style={{
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          📦 Game Store
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontFamily: "'Comic Sans MS', cursive"
        }}>
          {installedCount}/{totalCount} games installed
        </p>

        {/* Search & Filters */}
        <div className="cartoony-card" style={{
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'flex-end'
          }}>
            {/* Search */}
            <div style={{ flex: 2, minWidth: '250px' }}>
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

            {/* Sort */}
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                📊 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cartoony-input"
                style={{ width: '100%' }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name (A-Z)</option>
                <option value="size">Size</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: selectedCategory === cat.id
                      ? '3px solid var(--primary)'
                      : '3px solid var(--border-color)',
                    borderRadius: 'var(--radius-pill)',
                    background: selectedCategory === cat.id
                      ? 'var(--primary)'
                      : 'var(--bg-card)',
                    color: selectedCategory === cat.id
                      ? 'white'
                      : 'var(--text-primary)',
                    fontFamily: "'Comic Sans MS', cursive",
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    boxShadow: selectedCategory === cat.id
                      ? '0 4px 0 var(--primary-dark)'
                      : '0 3px 0 var(--border-color)'
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredGames.map(game => {
            const isInstalled = installedGames.includes(game.id);
            const isDownloading = downloading.includes(game.id);

            return (
              <div
                key={game.id}
                className="cartoony-card pop-on-hover"
                style={{
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {/* Badges */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  {game.core && (
                    <span className="cartoony-badge">CORE</span>
                  )}
                  {game.isNew && (
                    <span className="cartoony-badge cartoony-badge-new">NEW</span>
                  )}
                  {game.isHot && (
                    <span className="cartoony-badge" style={{ background: 'var(--danger)' }}>🔥 HOT</span>
                  )}
                </div>

                {/* Game Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--bg-pattern) 0%, var(--bg-main) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    border: '3px solid var(--border-color)'
                  }}>
                    {game.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: "'Comic Sans MS', cursive",
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {game.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginTop: '0.25rem'
                    }}>
                      <span style={{ color: '#FFD700', fontSize: '0.875rem' }}>
                        ⭐ {game.rating}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        📥 {game.downloads}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        💾 {game.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  lineHeight: 1.4
                }}>
                  {game.description}
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {isInstalled ? (
                    <>
                      <Link to={`/play/${game.id}`} style={{ flex: 1 }}>
                        <button
                          className="cartoony-btn"
                          style={{ width: '100%', fontSize: '0.9rem' }}
                        >
                          ▶ Play
                        </button>
                      </Link>
                      <button
                        className="cartoony-btn cartoony-btn-secondary"
                        style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                        title="Installed"
                      >
                        ✓
                      </button>
                    </>
                  ) : isDownloading ? (
                    <button
                      className="cartoony-btn cartoony-btn-secondary"
                      style={{ width: '100%', fontSize: '0.9rem' }}
                      disabled
                    >
                      <span className="loading-spinner" style={{
                        width: '20px',
                        height: '20px',
                        borderWidth: '3px',
                        display: 'inline-block',
                        marginRight: '0.5rem',
                        verticalAlign: 'middle'
                      }} />
                      Downloading...
                    </button>
                  ) : (
                    <button
                      className="cartoony-btn"
                      style={{ width: '100%', fontSize: '0.9rem' }}
                      onClick={() => handleDownload(game.id)}
                    >
                      📥 Download
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="cartoony-card" style={{
            padding: '4rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '0.5rem' }}>
              No Games Found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameStore;
