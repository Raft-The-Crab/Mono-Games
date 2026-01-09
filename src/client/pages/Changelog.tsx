/**
 * Changelog Page - Version History with Visual Timeline
 */


import '../styles/cartoony-theme.css';

interface VersionUpdate {
  version: string;
  codename: string;
  date: string;
  color: string;
  gradient: string;
  icon: string;
  highlights: string[];
  features: Array<{
    category: string;
    emoji: string;
    items: string[];
  }>;
}

export default function Changelog() {
  const versions: VersionUpdate[] = [
    {
      version: '2.0.0',
      codename: 'Ultimate Update',
      date: 'January 8, 2026',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      icon: '🎉',
      highlights: [
        '2 Brand New Games',
        'Spectacular UI Overhaul',
        'Achievement Animations',
        'Comprehensive Documentation'
      ],
      features: [
        {
          category: 'New Games',
          emoji: '🎮',
          items: [
            'Memory Match - Card matching with 4 themes (Animals, Emojis, Numbers, Colors)',
            'Maze Runner - Procedural maze generation with DFS algorithm',
            'Breakout - Classic brick breaker with 5 power-ups'
          ]
        },
        {
          category: 'UI/UX Improvements',
          emoji: '🎨',
          items: [
            'Game Launcher overhaul with category pills',
            'Enhanced search and sort functionality',
            'Achievement toast notifications with confetti',
            'Animated loading screens with progress bars',
            'Beautiful About page with project info',
            'Improved Help documentation (7 sections)'
          ]
        },
        {
          category: 'Features',
          emoji: '⚡',
          items: [
            'AI Opponent paywall (50💎 unlock)',
            'Leaderboards expanded to 8 games',
            'Diamond economy system',
            'Rarity system (Common/Rare/Epic/Legendary)',
            'Confetti explosions for rare achievements'
          ]
        },
        {
          category: 'Documentation',
          emoji: '📚',
          items: [
            'Complete README redesign with badges',
            'Deployment guide (Android APK + Windows EXE)',
            'Development guide with best practices',
            'Screenshots folder with guidelines',
            'About page with tech stack showcase'
          ]
        },
        {
          category: 'Bug Fixes',
          emoji: '🐛',
          items: [
            'Fixed all chill games (init/start/pause/resume/reset/destroy)',
            'React Suspense errors resolved',
            'manifest.json icon references fixed',
            'WebSocket stability improvements'
          ]
        }
      ]
    },
    {
      version: '1.5.0',
      codename: 'Chill Update',
      date: 'December 15, 2025',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      icon: '🧘',
      highlights: [
        '4 Relaxation Games',
        'NO SCORING Mode',
        'Babylon.js Integration'
      ],
      features: [
        {
          category: 'Chill Games',
          emoji: '🌙',
          items: [
            'Zen Garden - Peaceful gardening simulation',
            'Space Explorer - Calm space exploration',
            'Campfire Simulator - Cozy campfire experience',
            'Infinite Roads - Meditative 3D driving'
          ]
        },
        {
          category: 'Engine',
          emoji: '🛠️',
          items: [
            'Babylon.js 7.x integration',
            '3D graphics engine',
            'WebGL optimization',
            'Performance improvements'
          ]
        },
        {
          category: 'Audio',
          emoji: '🎵',
          items: [
            'Background music system',
            'Sound effect library',
            'Audio manager implementation',
            'Volume controls'
          ]
        }
      ]
    },
    {
      version: '1.0.0',
      codename: 'Foundation',
      date: 'November 20, 2025',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      icon: '🏗️',
      highlights: [
        '6 Core Games',
        'Authentication System',
        'Cartoony UI Design'
      ],
      features: [
        {
          category: 'Core Games',
          emoji: '🎯',
          items: [
            'Snake - Classic arcade',
            'Tetris - Line clearing puzzle',
            '2048 - Number merging',
            'Pong - AI opponent',
            'Tic-Tac-Toe - Strategy',
            'Connect Four - Gravity grid'
          ]
        },
        {
          category: 'Backend',
          emoji: '⚙️',
          items: [
            'Express.js server',
            'JWT authentication',
            'RESTful API',
            'Security middleware'
          ]
        },
        {
          category: 'UI/UX',
          emoji: '🎨',
          items: [
            'Cartoony theme with Comic Sans',
            'Hand-drawn aesthetic',
            'Responsive design',
            'Touch controls'
          ]
        }
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 20px 40px',
      fontFamily: '"Comic Sans MS", cursive, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '10px',
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
          }}>
            📜 Changelog
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e0e7ff',
            marginBottom: '10px'
          }}>
            Every update, every improvement, every new feature
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '10px 20px',
            borderRadius: '25px',
            color: '#fff',
            fontSize: '16px'
          }}>
            Current Version: <strong>{versions[0].version}</strong> - {versions[0].codename}
          </div>
        </div>

        {/* Version Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '30px',
            top: '50px',
            bottom: '50px',
            width: '4px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '2px'
          }} />

          {/* Versions */}
          {versions.map((version, index) => (
            <div key={version.version} style={{
              position: 'relative',
              marginBottom: '40px',
              paddingLeft: '70px'
            }}>
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '10px',
                top: '10px',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: version.gradient,
                border: '4px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 2
              }}>
                {version.icon}
              </div>

              {/* Version card */}
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: `4px solid ${version.color}`
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '5px'
                    }}>
                      v{version.version} - {version.codename}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#6b7280'
                    }}>
                      📅 {version.date}
                    </div>
                  </div>
                  {index === 0 && (
                    <div style={{
                      background: version.gradient,
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      LATEST
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  marginBottom: '25px'
                }}>
                  {version.highlights.map((highlight, i) => (
                    <div key={i} style={{
                      background: `${version.color}15`,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${version.color}`,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      textAlign: 'center'
                    }}>
                      {highlight}
                    </div>
                  ))}
                </div>

                {/* Features by category */}
                {version.features.map((feature, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: version.color,
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '24px' }}>{feature.emoji}</span>
                      {feature.category}
                    </h3>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      {feature.items.map((item, j) => (
                        <li key={j} style={{
                          padding: '8px 0',
                          paddingLeft: '28px',
                          position: 'relative',
                          color: '#4b5563',
                          fontSize: '15px',
                          lineHeight: '1.6'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: version.color,
                            fontWeight: 'bold'
                          }}>
                            •
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '10px'
          }}>
            More Updates Coming Soon!
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#e0e7ff',
            lineHeight: '1.6'
          }}>
            We're constantly working on new features, games, and improvements.
            <br />
            Stay tuned for exciting updates!
          </p>
        </div>
      </div>
    </div>
  );
}
