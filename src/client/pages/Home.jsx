import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featuredGames = [
    { id: 'snake', name: '🐍 Snake', desc: 'Classic arcade fun!', badge: 'HOT' },
    { id: 'pong', name: '🏓 Pong', desc: 'Play vs AI opponent', badge: 'AI' },
    { id: 'tetris', name: '🧱 Tetris', desc: 'Stack & clear lines', badge: null },
    { id: '2048', name: '🔢 2048', desc: 'Merge the tiles!', badge: 'NEW' },
    { id: 'memory-match', name: '🃏 Memory', desc: 'Match the pairs', badge: null },
    { id: 'racing', name: '🏎️ Turbo Racer', desc: 'High-speed action!', badge: 'HOT' }
  ];

  return (
    <div className="home-page" style={{
      minHeight: '100vh',
      background: 'var(--bg-sky)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Clouds Background */}
      <div className="cloud-container">
        <div className="floating-cloud cloud-1"></div>
        <div className="floating-cloud cloud-2"></div>
        <div className="floating-cloud cloud-3"></div>
      </div>

      {/* Floating Stars */}
      <div className="star-container">
        <div className="floating-star star-1"></div>
        <div className="floating-star star-2"></div>
        <div className="floating-star star-3"></div>
        <div className="floating-star star-4"></div>
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '2rem' }}>
        {/* Hero Section */}
        <section className={`hero ${isVisible ? 'fade-in' : ''}`} style={{
          textAlign: 'center',
          padding: '3rem 1rem 4rem'
        }}>
          {/* Logo/Title */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
              fontSize: 'clamp(3rem, 10vw, 5rem)',
              fontWeight: 900,
              color: 'var(--primary)',
              textShadow: `
                4px 4px 0 var(--secondary),
                8px 8px 0 rgba(0, 0, 0, 0.1)
              `,
              letterSpacing: '2px',
              marginBottom: '0.5rem',
              transform: 'rotate(-2deg)',
              display: 'inline-block',
              animation: 'bounceGentle 3s ease-in-out infinite'
            }}>
              MONO
            </h1>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '-0.5rem'
            }}>
              games
            </div>
          </div>

          {/* Tagline Speech Bubble */}
          <div className="cartoon-speech-bubble" style={{
            margin: '0 auto 2.5rem',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '1.25rem' }}>
              🎮 50+ Games • Offline & Online • Free Forever! 🎮
            </span>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}>
            <Link to="/launcher">
              <button className="cartoony-btn" style={{ fontSize: '1.25rem' }}>
                🎮 Play Now!
              </button>
            </Link>

            <Link to="/store">
              <button className="cartoony-btn cartoony-btn-secondary">
                📦 Game Store
              </button>
            </Link>
          </div>
        </section>

        {/* Featured Games */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 4rem',
          padding: '0 1rem'
        }}>
          <h2 className="cartoony-subtitle" style={{
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '2rem'
          }}>
            ⭐ Featured Games ⭐
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {featuredGames.map((game, index) => (
              <Link
                key={game.id}
                to={`/play/${game.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="cartoony-card pop-on-hover"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    background: 'var(--bg-card)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontFamily: "'Comic Sans MS', cursive",
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {game.name}
                    </h3>
                    {game.badge && (
                      <span className={`cartoony-badge ${game.badge === 'NEW' ? 'cartoony-badge-new' :
                          game.badge === 'AI' ? 'cartoony-badge-online' : ''
                        }`}>
                        {game.badge}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontFamily: "'Segoe UI', sans-serif",
                    color: 'var(--text-secondary)',
                    margin: '0 0 1rem',
                    fontSize: '1rem'
                  }}>
                    {game.desc}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <span style={{
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-pill)',
                      fontFamily: "'Comic Sans MS', cursive",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      boxShadow: '0 3px 0 var(--primary-dark)'
                    }}>
                      ▶ Play
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/launcher">
              <button className="cartoony-btn cartoony-btn-secondary">
                View All Games →
              </button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 4rem',
          padding: '0 1rem'
        }}>
          <h2 className="cartoony-subtitle" style={{
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '2rem'
          }}>
            ✨ Why Mono Games? ✨
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { icon: '🎯', title: '50+ Games', desc: 'Classic arcade to modern puzzles!' },
              { icon: '📱', title: 'Cross-Platform', desc: 'Web, Windows & Android' },
              { icon: '🌐', title: 'Offline Mode', desc: 'No internet? No problem!' },
              { icon: '🤖', title: 'AI Opponents', desc: '5 difficulty levels to master' },
              { icon: '🏆', title: 'Leaderboards', desc: 'Compete with players worldwide' },
              { icon: '🔒', title: 'Privacy First', desc: 'No tracking, no ads' }
            ].map((feature, index) => (
              <div
                key={index}
                className="cartoony-card"
                style={{
                  textAlign: 'center',
                  padding: '2rem 1.5rem'
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  animation: `bounceGentle 2s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section style={{
          maxWidth: '900px',
          margin: '0 auto 4rem',
          padding: '2.5rem',
          background: 'var(--bg-card)',
          border: '4px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 className="cartoony-subtitle" style={{
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '1.75rem'
          }}>
            📊 Platform Stats
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { value: '50+', label: 'Games', color: 'var(--primary)' },
              { value: '7', label: 'Core Games', color: 'var(--secondary)' },
              { value: '3', label: 'Platforms', color: 'var(--accent)' },
              { value: '∞', label: 'Fun!', color: 'var(--danger)' }
            ].map((stat, index) => (
              <div key={index} className="bounce-gentle" style={{ animationDelay: `${index * 0.15}s` }}>
                <div style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: stat.color,
                  textShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontSize: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          textAlign: 'center',
          padding: '3rem 1rem'
        }}>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: '2.5rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Ready to Play? 🎮
          </h2>
          <p style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem'
          }}>
            Jump into the fun right now!
          </p>
          <Link to="/launcher">
            <button
              className="cartoony-btn pulse-glow"
              style={{
                fontSize: '1.5rem',
                padding: '1.25rem 3rem',
                animation: 'pulseGlow 2s ease-in-out infinite, bounceGentle 3s ease-in-out infinite'
              }}
            >
              🚀 Launch Games
            </button>
          </Link>
        </section>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Home;
