/**
 * About Page - Project Information and Credits
 */

import { GamepadIcon, HeartIcon, UserIcon } from '../components/Icons';
import '../styles/cartoony-theme.css';

export default function About() {
  return (
    <div className="about-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 20px 40px',
      fontFamily: '"Comic Sans MS", cursive, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '10px',
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
          }}>
            🎮 About Mono Games
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e0e7ff',
            marginBottom: '5px'
          }}>
            The Ultimate Gaming Platform
          </p>
          <p style={{
            fontSize: '16px',
            color: '#c7d2fe',
            fontStyle: 'italic'
          }}>
            Version 2.0.0 - "Ultimate Update" | January 2026
          </p>
        </div>

        {/* Project Story */}
        <div style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <GamepadIcon size={40} color="#1f2937" />
            <h2 style={{ fontSize: '32px', color: '#1f2937', marginLeft: '15px', fontWeight: 'bold' }}>
              Our Story
            </h2>
          </div>
          <p style={{ fontSize: '18px', color: '#1f2937', lineHeight: '1.8', marginBottom: '15px' }}>
            <strong>Mono Games</strong> started as a passion project to bring the joy of classic gaming to modern platforms. 
            We believe gaming should be <strong>fun, accessible, and rewarding</strong> without the complexity of modern 
            gaming ecosystems.
          </p>
          <p style={{ fontSize: '18px', color: '#1f2937', lineHeight: '1.8' }}>
            From humble beginnings with 6 simple games, we've grown to over <strong>15+ complete games</strong> spanning 
            arcade classics, brain-teasing puzzles, thrilling racing games, and peaceful chill experiences. All wrapped 
            in a <strong>cartoony, nostalgic interface</strong> that makes you smile.
          </p>
        </div>

        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '15px', fontWeight: 'bold' }}>
              🎯 Our Mission
            </h3>
            <p style={{ fontSize: '16px', color: '#dbeafe', lineHeight: '1.7' }}>
              To create a <strong>unified gaming platform</strong> that combines classic nostalgia with modern technology, 
              offering players a seamless experience across Android and Windows devices.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '15px', fontWeight: 'bold' }}>
              🔮 Our Vision
            </h3>
            <p style={{ fontSize: '16px', color: '#d1fae5', lineHeight: '1.7' }}>
              To become the <strong>go-to gaming platform</strong> for casual gamers who want quality games without the 
              bloat, offering both competitive and relaxing experiences.
            </p>
          </div>
        </div>

        {/* Features Highlight */}
        <div style={{
          background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '25px', fontWeight: 'bold' }}>
            ⚡ What Makes Us Special
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '18px', color: '#fef3c7', marginBottom: '10px' }}>🎮 15+ Complete Games</h4>
              <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6' }}>
                From Snake to 3D racing, puzzles to chill games - something for everyone.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '18px', color: '#fef3c7', marginBottom: '10px' }}>💎 Diamond Economy</h4>
              <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6' }}>
                Earn diamonds through achievements, spend on premium games and features.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '18px', color: '#fef3c7', marginBottom: '10px' }}>🏆 Achievements & Leaderboards</h4>
              <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6' }}>
                50+ achievements to unlock, compete globally across 8 competitive games.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '18px', color: '#fef3c7', marginBottom: '10px' }}>🧘 Chill Games</h4>
              <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6' }}>
                NO SCORING mode - just relax with Zen Garden, Space Explorer, and more.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '18px', color: '#fef3c7', marginBottom: '10px' }}>📱 Cross-Platform</h4>
              <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6' }}>
                Play on Android APK or Windows EXE - your progress syncs everywhere.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '18px', color: '#fef3c7', marginBottom: '10px' }}>🤖 AI Opponents</h4>
              <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6' }}>
                5 difficulty levels from Easy to Impossible - unlock for 50💎.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{
          background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '20px', fontWeight: 'bold' }}>
            🛠️ Built With Modern Tech
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              { name: 'React 18.3', emoji: '⚛️' },
              { name: 'TypeScript 5.6', emoji: '📘' },
              { name: 'Babylon.js 7.x', emoji: '🎮' },
              { name: 'Node.js 20.x', emoji: '🟢' },
              { name: 'Express 4.21', emoji: '🚂' },
              { name: 'Redis 7.4', emoji: '🔴' },
              { name: 'Vite 5.4', emoji: '⚡' },
              { name: 'Capacitor', emoji: '📱' },
              { name: 'Electron', emoji: '💻' }
            ].map((tech, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>{tech.emoji}</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{tech.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <UserIcon size={36} color="#fff" />
            <h2 style={{ fontSize: '28px', color: '#fff', marginLeft: '15px', fontWeight: 'bold' }}>
              Credits & Thanks
            </h2>
          </div>
          
          <p style={{ fontSize: '16px', color: '#fce7f3', lineHeight: '1.7', marginBottom: '20px' }}>
            Mono Games is developed by a passionate team of developers, designers, and gaming enthusiasts. 
            Special thanks to all contributors who have helped shape this platform!
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <h4 style={{ fontSize: '16px', color: '#fef3c7', marginBottom: '8px' }}>🎨 Design & UI</h4>
              <p style={{ fontSize: '14px', color: '#fce7f3' }}>Cartoony theme, animations, visual effects</p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', color: '#fef3c7', marginBottom: '8px' }}>💻 Development</h4>
              <p style={{ fontSize: '14px', color: '#fce7f3' }}>Game engines, backend, deployment</p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', color: '#fef3c7', marginBottom: '8px' }}>🎮 Game Design</h4>
              <p style={{ fontSize: '14px', color: '#fce7f3' }}>Mechanics, balancing, user experience</p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', color: '#fef3c7', marginBottom: '8px' }}>📚 Documentation</h4>
              <p style={{ fontSize: '14px', color: '#fce7f3' }}>Guides, API docs, help system</p>
            </div>
          </div>
        </div>

        {/* Community */}
        <div style={{
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          borderRadius: '20px',
          padding: '30px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <HeartIcon size={48} color="#fff" />
          </div>
          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '15px', fontWeight: 'bold' }}>
            Made with ❤️ for Gamers
          </h2>
          <p style={{ fontSize: '16px', color: '#ccfbf1', lineHeight: '1.7', marginBottom: '25px' }}>
            This project is a labor of love, created by gamers for gamers. We're constantly working on new features, 
            games, and improvements. Your feedback and support mean everything!
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <a
              href="https://github.com/Raft-The-Crab/Mono-Games"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#1f2937',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🐙 View on GitHub
            </a>
            
            <button
              onClick={() => window.location.href = '/help'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f59e0b',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📚 Read Documentation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          marginTop: '30px'
        }}>
          {[
            { label: 'Games', value: '15+', emoji: '🎮' },
            { label: 'Achievements', value: '50+', emoji: '🏆' },
            { label: 'Players', value: 'Growing', emoji: '👥' },
            { label: 'Updates', value: 'Weekly', emoji: '🚀' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.emoji}</div>
              <div style={{ fontSize: '24px', color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: '#e0e7ff' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '50px', paddingTop: '30px', borderTop: '2px solid rgba(255,255,255,0.3)' }}>
          <p style={{ fontSize: '14px', color: '#e0e7ff', marginBottom: '5px' }}>
            © 2026 Mono Games. All rights reserved.
          </p>
          <p style={{ fontSize: '12px', color: '#c7d2fe', fontStyle: 'italic' }}>
            🔒 Private Project - Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
