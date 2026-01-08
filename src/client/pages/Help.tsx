import { GamepadIcon, RobotIcon, TrophyIcon, DiamondIcon, SettingsIcon, InfoIcon } from '../components/Icons';
import '../styles/cartoony-theme.css';

export default function Help() {
  const sections = [
    {
      id: 'getting-started',
      icon: GamepadIcon,
      title: '🎮 Getting Started',
      content: [
        { q: 'How do I play games?', a: 'Go to the Game Launcher and click on any game to start playing instantly!' },
        { q: 'Do I need to create an account?', a: 'No! You can play all core games without an account. Create one to save progress and compete on leaderboards.' },
        { q: 'Which games are free?', a: 'Snake, Pong, Tetris, 2048, Tic Tac Toe, and Connect Four are completely free forever!' }
      ]
    },
    {
      id: 'premium-games',
      icon: DiamondIcon,
      title: '💎 Premium Games & Diamonds',
      content: [
        { q: 'What are Diamonds?', a: 'Diamonds are the in-game currency! Earn them by playing games, achieving milestones, and ranking on leaderboards.' },
        { q: 'How do I earn Diamonds?', a: 'Score points in games (1💎 per 100 points), win games (5-20💎), reach leaderboard top 50 (10-100💎), and complete achievements!' },
        { q: 'What can I buy with Diamonds?', a: 'Premium games (25-50💎), AI opponents (50💎), and exclusive themes! All permanent unlocks - no subscriptions!' },
        { q: 'Can I buy Diamonds with real money?', a: 'Not yet! Currently you can only earn them by playing. This keeps the game fair and fun for everyone.' }
      ]
    },
    {
      id: 'ai-opponents',
      icon: RobotIcon,
      title: '🤖 AI Opponents',
      content: [
        { q: 'How do I unlock AI?', a: 'Go to Settings > AI Mode and unlock for 50💎. This is a one-time purchase for lifetime access!' },
        { q: 'Which games support AI?', a: 'Currently: Tic Tac Toe, Connect Four, Pong, and Chess (coming soon). More games will support AI in future updates!' },
        { q: 'What are the difficulty levels?', a: 'Very Easy (beginner), Easy (70% accuracy), Normal (85%), Hard (95%), and Expert (near-perfect). Choose based on your skill!' },
        { q: 'Can I practice offline?', a: 'Yes! Once unlocked, you can play against AI even without internet connection.' }
      ]
    },
    {
      id: 'leaderboards',
      icon: TrophyIcon,
      title: '🏆 Leaderboards & Competition',
      content: [
        { q: 'How do leaderboards work?', a: 'Your best score for each game is automatically submitted. Compete against players worldwide!' },
        { q: 'Do I need an account?', a: 'Yes! Create a free account to save your scores and appear on leaderboards.' },
        { q: 'What are the ranking rewards?', a: 'Top 50: 10-100💎, Top 10: 30-100💎, Top 3: 50-100💎, #1: 100💎! Updated daily.' },
        { q: 'How often do leaderboards reset?', a: 'Never! All-time leaderboards show the best scores ever. We also have daily/weekly/monthly boards coming soon!' }
      ]
    },
    {
      id: 'chill-games',
      icon: InfoIcon,
      title: '🌅 Chill Games (NO SCORING)',
      content: [
        { q: 'What are Chill Games?', a: 'Relaxation-focused experiences with NO SCORING, NO PRESSURE, NO TIMERS. Just enjoy the experience!' },
        { q: 'Which games are "Chill"?', a: 'Infinite Roads, Zen Garden, Space Explorer, and Campfire Simulator. Perfect for unwinding after competitive games!' },
        { q: 'Do Chill Games have leaderboards?', a: 'Nope! They\'re purely for relaxation and exploration. No competition, no stress - just zen vibes.' },
        { q: 'Can I earn Diamonds?', a: 'Chill Games don\'t award diamonds since there\'s no scoring. They\'re about the journey, not the destination!' }
      ]
    },
    {
      id: 'settings',
      icon: SettingsIcon,
      title: '⚙️ Settings & Customization',
      content: [
        { q: 'How do I change themes?', a: 'Settings > Display > Choose from 8 themes including Light, Dark, Ocean, Sunset, Forest, Purple, Retro, and Neon!' },
        { q: 'Can I adjust graphics?', a: 'Yes! Settings > Graphics to enable/disable shadows, particles, bloom effects, and more. Lower settings = better performance on older devices.' },
        { q: 'How do I control audio?', a: 'Settings > Audio to adjust music and sound effects volume independently. Perfect for playing with your own music!' },
        { q: 'Can I export my data?', a: 'Settings > Data > Export to download all your save data, achievements, and progress as a JSON file. Import it anytime to restore!' }
      ]
    },
    {
      id: 'technical',
      icon: InfoIcon,
      title: '🔧 Technical & Platform',
      content: [
        { q: 'Which platforms are supported?', a: 'Android (APK) and Windows (EXE) are our PRIMARY targets. Optimized for 60fps mobile, 120fps desktop!' },
        { q: 'Do I need internet?', a: 'Core games work offline! Premium games, leaderboards, and cloud saves require internet. AI opponents work offline after unlock.' },
        { q: 'How do I update the game?', a: 'On Android: Download new APK from our website. On Windows: Download new EXE. Auto-update coming soon!' },
        { q: 'Where is my data stored?', a: 'Locally in your browser/app storage + cloud sync if you have an account. Export backups regularly just in case!' }
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem 1rem',
      paddingTop: '6rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div className="cartoony-card" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: '4px solid var(--primary)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            fontFamily: "'Comic Sans MS', cursive",
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
          }}>
            📚 Help & Documentation
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Everything you need to know about Mono Games!
          </p>
        </div>

        {/* Table of Contents */}
        <div className="cartoony-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive",
            marginBottom: '1.5rem',
            fontSize: '1.75rem'
          }}>
            Quick Navigation
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--bg-card)',
                  border: '3px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <section.icon size={24} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map(section => (
          <div
            key={section.id}
            id={section.id}
            className="cartoony-card"
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h2 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '3px solid var(--border-color)'
            }}>
              <section.icon size={32} color="var(--primary)" />
              {section.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {section.content.map((item, index) => (
                <div key={index}>
                  <h3 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1.25rem',
                    marginBottom: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: 700
                  }}>
                    Q: {item.q}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    fontSize: '1.rem',
                    paddingLeft: '1.5rem'
                  }}>
                    A: {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Still Need Help? */}
        <div className="cartoony-card" style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          border: '4px solid var(--primary)'
        }}>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>
            Still Need Help?
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Can't find what you're looking for? We're here to help!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://github.com/your-repo/issues" target="_blank" rel="noopener noreferrer">
              <button className="cartoony-btn" style={{ background: 'white', color: 'var(--primary)' }}>
                📧 Report an Issue
              </button>
            </a>
            <a href="/" style={{ textDecoration: 'none' }}>
              <button className="cartoony-btn" style={{ background: 'rgba(255,255,255,0.2)' }}>
                🏠 Back to Home
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
