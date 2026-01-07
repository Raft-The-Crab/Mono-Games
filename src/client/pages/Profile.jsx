import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function Profile() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('stats');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data (in real app, fetch from backend)
  const [userData, setUserData] = useState({
    username: user?.username || 'Player',
    email: user?.email || 'player@monogames.com',
    avatar: '🎮',
    level: 15,
    xp: 2450,
    xpToNext: 3000,
    joinDate: '2026-01-01',
    stats: {
      gamesPlayed: 156,
      totalScore: 125890,
      timePlayed: '24h 35m',
      achievements: 12,
      highScores: 8,
      winRate: 67
    },
    recentGames: [
      { id: 'snake', name: 'Snake', score: 1250, date: '2026-01-07' },
      { id: 'pong', name: 'Pong', score: 850, date: '2026-01-06' },
      { id: 'tetris', name: 'Tetris', score: 15200, date: '2026-01-06' },
      { id: '2048', name: '2048', score: 8192, date: '2026-01-05' }
    ],
    achievements: [
      { id: 1, name: 'First Victory', desc: 'Win your first game', icon: '🏆', unlocked: true },
      { id: 2, name: 'Speed Demon', desc: 'Complete a game in under 1 minute', icon: '⚡', unlocked: true },
      { id: 3, name: 'High Scorer', desc: 'Score over 10,000 points', icon: '🌟', unlocked: true },
      { id: 4, name: 'Collector', desc: 'Play all core games', icon: '📚', unlocked: false },
      { id: 5, name: 'Master', desc: 'Reach level 50', icon: '👑', unlocked: false },
      { id: 6, name: 'Perfectionist', desc: 'Get a perfect score', icon: '💎', unlocked: false }
    ]
  });

  const avatarOptions = ['🎮', '👾', '🕹️', '🎯', '🏆', '⭐', '🚀', '🎪', '🎨', '🦊', '🐱', '🐶'];

  const xpPercentage = (userData.xp / userData.xpToNext) * 100;

  const renderStats = () => (
    <div>
      <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
        📊 Your Statistics
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Games Played', value: userData.stats.gamesPlayed, icon: '🎮' },
          { label: 'Total Score', value: userData.stats.totalScore.toLocaleString(), icon: '🏅' },
          { label: 'Time Played', value: userData.stats.timePlayed, icon: '⏱️' },
          { label: 'Achievements', value: `${userData.stats.achievements}/20`, icon: '🏆' },
          { label: 'High Scores', value: userData.stats.highScores, icon: '🌟' },
          { label: 'Win Rate', value: `${userData.stats.winRate}%`, icon: '📈' }
        ].map((stat, i) => (
          <div
            key={i}
            className="cartoony-card"
            style={{ padding: '1.25rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 900,
              fontSize: '1.5rem',
              color: 'var(--primary)'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <h4 style={{
        fontFamily: "'Comic Sans MS', cursive",
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'var(--text-primary)'
      }}>
        🕹️ Recent Games
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {userData.recentGames.map((game, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              background: 'var(--bg-pattern)',
              borderRadius: 'var(--radius-md)',
              border: '3px solid var(--border-color)'
            }}
          >
            <div>
              <span style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                {game.name}
              </span>
              <span style={{
                marginLeft: '1rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                {game.date}
              </span>
            </div>
            <span style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700
            }}>
              {game.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div>
      <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
        🏆 Achievements
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {userData.achievements.map(achievement => (
          <div
            key={achievement.id}
            className="cartoony-card"
            style={{
              padding: '1.25rem',
              opacity: achievement.unlocked ? 1 : 0.5,
              filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-circle)',
                background: achievement.unlocked
                  ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
                  : 'var(--bg-pattern)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                border: '3px solid var(--text-primary)',
                boxShadow: achievement.unlocked ? '0 4px 0 var(--primary-dark)' : 'none'
              }}>
                {achievement.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {achievement.name}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  {achievement.desc}
                </div>
              </div>
              {achievement.unlocked && (
                <span style={{ color: 'var(--success)', fontSize: '1.5rem' }}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div>
      <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
        ✏️ Edit Profile
      </h3>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          display: 'block',
          marginBottom: '0.75rem',
          color: 'var(--text-primary)'
        }}>
          Choose Avatar
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {avatarOptions.map(emoji => (
            <button
              key={emoji}
              onClick={() => setUserData({ ...userData, avatar: emoji })}
              style={{
                width: '56px',
                height: '56px',
                fontSize: '2rem',
                borderRadius: 'var(--radius-circle)',
                border: userData.avatar === emoji
                  ? '4px solid var(--primary)'
                  : '3px solid var(--border-color)',
                background: userData.avatar === emoji ? 'var(--bg-pattern)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          display: 'block',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Username
        </label>
        <input
          type="text"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="cartoony-input"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          display: 'block',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Email
        </label>
        <input
          type="email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          className="cartoony-input"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className="cartoony-btn"
          onClick={() => setIsEditing(false)}
        >
          💾 Save Changes
        </button>
        <button
          className="cartoony-btn cartoony-btn-secondary"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="cartoony-card" style={{
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 className="cartoony-subtitle" style={{ marginBottom: '1rem' }}>
            Login Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please login to view your profile and stats.
          </p>
          <a href="/login">
            <button className="cartoony-btn">
              🔑 Login Now
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Profile Header */}
        <div className="cartoony-card" style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          alignItems: 'center'
        }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: 'var(--radius-circle)',
            background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            border: '4px solid var(--text-primary)',
            boxShadow: '0 6px 0 var(--text-primary)'
          }}>
            {userData.avatar}
          </div>

          {/* User Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              {userData.username}
            </h1>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <span className="cartoony-badge">Level {userData.level}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Joined {userData.joinDate}
              </span>
            </div>

            {/* XP Bar */}
            <div style={{ maxWidth: '300px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>XP</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {userData.xp} / {userData.xpToNext}
                </span>
              </div>
              <div className="cartoony-progress" style={{ height: '24px' }}>
                <div
                  className="cartoony-progress-bar"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            className="cartoony-btn cartoony-btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'stats', label: '📊 Stats', hidden: isEditing },
            { id: 'achievements', label: '🏆 Achievements', hidden: isEditing }
          ].filter(t => !t.hidden).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id && !isEditing ? 'cartoony-btn' : 'cartoony-btn cartoony-btn-secondary'}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="cartoony-card" style={{ padding: '2rem' }}>
          {isEditing ? renderEditProfile() : (
            activeTab === 'stats' ? renderStats() : renderAchievements()
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
