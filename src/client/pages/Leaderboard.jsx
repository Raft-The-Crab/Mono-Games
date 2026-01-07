import { useState, useEffect } from 'react';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [isLoading, setIsLoading] = useState(false);

  const games = [
    { id: 'all', name: 'All Games' },
    { id: 'snake', name: '🐍 Snake' },
    { id: 'pong', name: '🏓 Pong' },
    { id: 'tetris', name: '🧱 Tetris' },
    { id: '2048', name: '🔢 2048' },
    { id: 'memory-match', name: '🃏 Memory Match' },
    { id: 'racing', name: '🏎️ Turbo Racer' }
  ];

  const periods = [
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all-time', label: 'All Time' }
  ];

  // Mock leaderboard data
  const [leaderboardData] = useState([
    { rank: 1, username: 'ProGamer2026', avatar: '👑', score: 999999, games: 450, country: '🇺🇸' },
    { rank: 2, username: 'SnakeMaster', avatar: '🐍', score: 875420, games: 380, country: '🇬🇧' },
    { rank: 3, username: 'TetrisKing', avatar: '🧱', score: 750890, games: 420, country: '🇯🇵' },
    { rank: 4, username: 'ArcadeChamp', avatar: '🎮', score: 680500, games: 310, country: '🇰🇷' },
    { rank: 5, username: 'GameWizard', avatar: '🧙', score: 620150, games: 290, country: '🇧🇷' },
    { rank: 6, username: 'SpeedRunner', avatar: '⚡', score: 580200, games: 540, country: '🇩🇪' },
    { rank: 7, username: 'RetroFan', avatar: '👾', score: 520100, games: 260, country: '🇫🇷' },
    { rank: 8, username: 'PixelPro', avatar: '🎯', score: 490500, games: 230, country: '🇨🇦' },
    { rank: 9, username: 'CasualKing', avatar: '☕', score: 450800, games: 450, country: '🇦🇺' },
    { rank: 10, username: 'NightOwl', avatar: '🦉', score: 410200, games: 280, country: '🇮🇳' },
    { rank: 11, username: 'DayDreamer', avatar: '🌙', score: 380900, games: 200, country: '🇲🇽' },
    { rank: 12, username: 'QuickFingers', avatar: '✌️', score: 350400, games: 320, country: '🇮🇹' },
    { rank: 13, username: 'CoolCat', avatar: '🐱', score: 320100, games: 180, country: '🇪🇸' },
    { rank: 14, username: 'HappyGamer', avatar: '😊', score: 290500, games: 250, country: '🇳🇱' },
    { rank: 15, username: 'ChillVibes', avatar: '🎧', score: 260200, games: 160, country: '🇸🇪' }
  ]);

  // Current user's rank (mock)
  const currentUserRank = {
    rank: 127,
    username: 'You',
    avatar: '🎮',
    score: 45000,
    games: 45,
    isCurrentUser: true
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', icon: '🥇' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)', icon: '🥈' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', icon: '🥉' };
    return { bg: 'var(--bg-pattern)', icon: null };
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="cartoony-title" style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          🏆 Leaderboards
        </h1>

        {/* Filters */}
        <div className="cartoony-card" style={{
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {/* Game Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                🎮 Game
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="cartoony-input"
                style={{ width: '100%' }}
              >
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                📅 Time Period
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {periods.map(period => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: selectedPeriod === period.id
                        ? '3px solid var(--primary)'
                        : '3px solid var(--border-color)',
                      borderRadius: 'var(--radius-pill)',
                      background: selectedPeriod === period.id
                        ? 'var(--primary)'
                        : 'var(--bg-card)',
                      color: selectedPeriod === period.id
                        ? 'white'
                        : 'var(--text-primary)',
                      fontFamily: "'Comic Sans MS', cursive",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)'
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* 2nd Place */}
          <div className="cartoony-card bounce-gentle" style={{
            width: '150px',
            textAlign: 'center',
            padding: '1.5rem 1rem',
            background: getRankStyle(2).bg,
            animationDelay: '0.1s'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🥈</div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-circle)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 0.75rem',
              border: '3px solid var(--text-primary)'
            }}>
              {leaderboardData[1].avatar}
            </div>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              {leaderboardData[1].username}
            </div>
            <div style={{
              fontWeight: 900,
              fontSize: '1.25rem',
              color: 'var(--text-primary)'
            }}>
              {leaderboardData[1].score.toLocaleString()}
            </div>
          </div>

          {/* 1st Place */}
          <div className="cartoony-card bounce-gentle" style={{
            width: '180px',
            textAlign: 'center',
            padding: '2rem 1rem',
            background: getRankStyle(1).bg,
            transform: 'scale(1.1)',
            zIndex: 10
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🥇</div>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-circle)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 0.75rem',
              border: '4px solid var(--text-primary)',
              boxShadow: '0 4px 0 var(--text-primary)'
            }}>
              {leaderboardData[0].avatar}
            </div>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              {leaderboardData[0].username}
            </div>
            <div style={{
              fontWeight: 900,
              fontSize: '1.5rem',
              color: 'var(--text-primary)'
            }}>
              {leaderboardData[0].score.toLocaleString()}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="cartoony-card bounce-gentle" style={{
            width: '150px',
            textAlign: 'center',
            padding: '1.5rem 1rem',
            background: getRankStyle(3).bg,
            animationDelay: '0.2s'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🥉</div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-circle)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 0.75rem',
              border: '3px solid var(--text-primary)'
            }}>
              {leaderboardData[2].avatar}
            </div>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              {leaderboardData[2].username}
            </div>
            <div style={{
              fontWeight: 900,
              fontSize: '1.25rem',
              color: 'var(--text-primary)'
            }}>
              {leaderboardData[2].score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Your Rank Card */}
        <div className="cartoony-card rainbow-border" style={{
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.25rem',
            color: 'white',
            fontFamily: "'Comic Sans MS', cursive"
          }}>
            #{currentUserRank.rank}
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--bg-pattern)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            border: '3px solid var(--border-color)'
          }}>
            {currentUserRank.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              color: 'var(--primary)'
            }}>
              {currentUserRank.username} (Your Rank)
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {currentUserRank.games} games played
            </div>
          </div>
          <div style={{
            fontWeight: 900,
            fontSize: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            {currentUserRank.score.toLocaleString()}
          </div>
        </div>

        {/* Full Rankings Table */}
        <div className="cartoony-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
            📋 Full Rankings
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    fontFamily: "'Comic Sans MS', cursive",
                    color: 'var(--text-secondary)',
                    fontWeight: 700
                  }}>Rank</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    fontFamily: "'Comic Sans MS', cursive",
                    color: 'var(--text-secondary)',
                    fontWeight: 700
                  }}>Player</th>
                  <th style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    fontFamily: "'Comic Sans MS', cursive",
                    color: 'var(--text-secondary)',
                    fontWeight: 700
                  }}>Games</th>
                  <th style={{
                    textAlign: 'right',
                    padding: '0.75rem',
                    fontFamily: "'Comic Sans MS', cursive",
                    color: 'var(--text-secondary)',
                    fontWeight: 700
                  }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.slice(3).map(player => (
                  <tr
                    key={player.rank}
                    style={{
                      background: 'var(--bg-pattern)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <td style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                      fontWeight: 700,
                      fontFamily: "'Comic Sans MS', cursive",
                      color: 'var(--text-primary)'
                    }}>
                      #{player.rank}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{player.avatar}</span>
                        <span style={{
                          fontFamily: "'Comic Sans MS', cursive",
                          fontWeight: 700,
                          color: 'var(--text-primary)'
                        }}>
                          {player.username}
                        </span>
                        <span>{player.country}</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      {player.games}
                    </td>
                    <td style={{
                      padding: '1rem',
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                      textAlign: 'right',
                      fontWeight: 900,
                      fontFamily: "'Comic Sans MS', cursive",
                      color: 'var(--primary)'
                    }}>
                      {player.score.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
