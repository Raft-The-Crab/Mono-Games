import { useState } from 'react';
import useSettingsStore from '../store/settingsStore';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function Settings() {
  const { settings, updateSetting, resetSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('gameplay');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabs = [
    { id: 'gameplay', icon: '🎮', label: 'Gameplay' },
    { id: 'ai', icon: '🤖', label: 'AI Mode' },
    { id: 'audio', icon: '🔊', label: 'Audio' },
    { id: 'graphics', icon: '🎨', label: 'Graphics' },
    { id: 'display', icon: '🖥️', label: 'Display' },
    { id: 'data', icon: '💾', label: 'Data' }
  ];

  const aiLevels = [
    { level: 1, name: 'Very Easy', desc: 'Relaxed gameplay, AI makes mistakes', color: '#95E1D3' },
    { level: 2, name: 'Easy', desc: 'Beginner-friendly, 70% AI accuracy', color: '#4ECDC4' },
    { level: 3, name: 'Normal', desc: 'Balanced challenge, 85% AI accuracy', color: '#F7931E' },
    { level: 4, name: 'Hard', desc: 'Tough opponent, 95% AI accuracy', color: '#FF6B35' },
    { level: 5, name: 'Expert', desc: 'Near-perfect AI, for pros only!', color: '#E63946' }
  ];

  const handleSliderChange = (category, key, value) => {
    updateSetting(category, key, parseInt(value));
  };

  const handleToggle = (category, key) => {
    updateSetting(category, key, !settings[category][key]);
  };

  const handleSelect = (category, key, value) => {
    updateSetting(category, key, value);
  };

  const handleReset = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    localStorage.removeItem('mono-games-cache');
    alert('Cache cleared successfully!');
  };

  const SliderControl = ({ label, value, min, max, category, keyName, icon }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <span style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          color: 'var(--text-primary)'
        }}>
          {icon} {label}
        </span>
        <span style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          fontSize: '0.875rem'
        }}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => handleSliderChange(category, keyName, e.target.value)}
        style={{
          width: '100%',
          height: '12px',
          borderRadius: 'var(--radius-pill)',
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${value}%, var(--bg-pattern) ${value}%, var(--bg-pattern) 100%)`,
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          border: '3px solid var(--text-primary)'
        }}
      />
    </div>
  );

  const ToggleSwitch = ({ label, checked, category, keyName, icon }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      background: 'var(--bg-pattern)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '1rem',
      border: '3px solid var(--border-color)'
    }}>
      <span style={{
        fontFamily: "'Comic Sans MS', cursive",
        fontWeight: 700,
        color: 'var(--text-primary)'
      }}>
        {icon} {label}
      </span>
      <button
        onClick={() => handleToggle(category, keyName)}
        style={{
          width: '60px',
          height: '32px',
          borderRadius: 'var(--radius-pill)',
          border: '3px solid var(--text-primary)',
          background: checked
            ? 'linear-gradient(135deg, var(--success) 0%, var(--accent) 100%)'
            : 'var(--bg-card)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'var(--transition-normal)',
          boxShadow: '0 3px 0 var(--text-primary)'
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '30px' : '2px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'white',
          border: '2px solid var(--text-primary)',
          transition: 'var(--transition-bounce)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gameplay':
        return (
          <div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
              🎮 Gameplay Settings
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'block',
                marginBottom: '0.75rem'
              }}>
                🎯 Difficulty
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['easy', 'normal', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => handleSelect('gameplay', 'difficulty', diff)}
                    className={settings.gameplay.difficulty === diff ? 'cartoony-btn' : 'cartoony-btn cartoony-btn-secondary'}
                    style={{
                      fontSize: '1rem',
                      padding: '0.75rem 1.5rem',
                      textTransform: 'capitalize'
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSwitch
              label="Vibration"
              checked={settings.gameplay.vibration}
              category="gameplay"
              keyName="vibration"
              icon="📳"
            />
            <ToggleSwitch
              label="Auto Save"
              checked={settings.gameplay.autoSave}
              category="gameplay"
              keyName="autoSave"
              icon="💾"
            />
          </div>
        );

      case 'ai':
        return (
          <div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '1rem' }}>
              🤖 AI Opponent Settings
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              fontFamily: "'Segoe UI', sans-serif"
            }}>
              Play against AI when offline or when you want a solo challenge!
            </p>

            <ToggleSwitch
              label="Enable AI Mode"
              checked={settings.gameplay.aiEnabled !== false}
              category="gameplay"
              keyName="aiEnabled"
              icon="🤖"
            />

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'block',
                marginBottom: '1rem'
              }}>
                🎚️ AI Difficulty Level
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {aiLevels.map(ai => (
                  <button
                    key={ai.level}
                    onClick={() => handleSelect('gameplay', 'aiLevel', ai.level)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      background: (settings.gameplay.aiLevel || 3) === ai.level
                        ? `linear-gradient(135deg, ${ai.color}40 0%, ${ai.color}20 100%)`
                        : 'var(--bg-card)',
                      border: (settings.gameplay.aiLevel || 3) === ai.level
                        ? `4px solid ${ai.color}`
                        : '3px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-circle)',
                      background: ai.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      color: 'white',
                      fontFamily: "'Comic Sans MS', cursive",
                      boxShadow: `0 4px 0 ${ai.color}80`
                    }}>
                      {ai.level}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Comic Sans MS', cursive",
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        color: 'var(--text-primary)'
                      }}>
                        {ai.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {ai.desc}
                      </div>
                    </div>
                    {(settings.gameplay.aiLevel || 3) === ai.level && (
                      <span style={{
                        background: ai.color,
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        fontFamily: "'Comic Sans MS', cursive",
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}>
                        ✓ Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
              🔊 Audio Settings
            </h3>

            <ToggleSwitch
              label="Mute All"
              checked={settings.audio.muted}
              category="audio"
              keyName="muted"
              icon="🔇"
            />

            <SliderControl
              label="Master Volume"
              value={settings.audio.masterVolume}
              min={0}
              max={100}
              category="audio"
              keyName="masterVolume"
              icon="🔊"
            />
            <SliderControl
              label="Music Volume"
              value={settings.audio.musicVolume}
              min={0}
              max={100}
              category="audio"
              keyName="musicVolume"
              icon="🎵"
            />
            <SliderControl
              label="Sound Effects"
              value={settings.audio.sfxVolume}
              min={0}
              max={100}
              category="audio"
              keyName="sfxVolume"
              icon="🔔"
            />
          </div>
        );

      case 'graphics':
        return (
          <div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
              🎨 Graphics Settings
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'block',
                marginBottom: '0.75rem'
              }}>
                ⚡ Quality
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['low', 'medium', 'high'].map(quality => (
                  <button
                    key={quality}
                    onClick={() => handleSelect('graphics', 'quality', quality)}
                    className={settings.graphics.quality === quality ? 'cartoony-btn' : 'cartoony-btn cartoony-btn-secondary'}
                    style={{
                      fontSize: '1rem',
                      padding: '0.75rem 1.5rem',
                      textTransform: 'capitalize'
                    }}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSwitch
              label="Visual Effects"
              checked={settings.graphics.effects}
              category="graphics"
              keyName="effects"
              icon="✨"
            />
            <ToggleSwitch
              label="Particle Effects"
              checked={settings.graphics.particles}
              category="graphics"
              keyName="particles"
              icon="🎆"
            />
            <ToggleSwitch
              label="Scanlines"
              checked={settings.graphics.scanlines}
              category="graphics"
              keyName="scanlines"
              icon="📺"
            />
            <ToggleSwitch
              label="CRT Effect"
              checked={settings.graphics.crtEffect}
              category="graphics"
              keyName="crtEffect"
              icon="🖥️"
            />
          </div>
        );

      case 'display':
        return (
          <div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
              🖥️ Display Settings
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'block',
                marginBottom: '0.75rem'
              }}>
                🎨 Theme
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'default', color: '#FF6B35', label: 'Orange' },
                  { id: 'blue', color: '#4ECDC4', label: 'Teal' },
                  { id: 'green', color: '#95E1D3', label: 'Mint' },
                  { id: 'red', color: '#E63946', label: 'Red' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleSelect('display', 'theme', theme.id)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: settings.display.theme === theme.id
                        ? '4px solid var(--text-primary)'
                        : '3px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      background: settings.display.theme === theme.id ? theme.color : 'var(--bg-card)',
                      color: settings.display.theme === theme.id ? 'white' : 'var(--text-primary)',
                      fontFamily: "'Comic Sans MS', cursive",
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: settings.display.theme === theme.id
                        ? '0 4px 0 var(--text-primary)'
                        : '0 3px 0 var(--border-color)'
                    }}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSwitch
              label="Show FPS"
              checked={settings.display.fps}
              category="display"
              keyName="fps"
              icon="📊"
            />
            <ToggleSwitch
              label="Fullscreen"
              checked={settings.display.fullscreen}
              category="display"
              keyName="fullscreen"
              icon="⛶"
            />
          </div>
        );

      case 'data':
        return (
          <div>
            <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem' }}>
              💾 Data Management
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                className="cartoony-btn cartoony-btn-secondary"
                onClick={clearCache}
                style={{ width: '100%' }}
              >
                🗑️ Clear Cache
              </button>

              <button
                className="cartoony-btn cartoony-btn-secondary"
                style={{ width: '100%' }}
              >
                📤 Export Save Data
              </button>

              <button
                className="cartoony-btn cartoony-btn-secondary"
                style={{ width: '100%' }}
              >
                📥 Import Save Data
              </button>

              <div style={{ marginTop: '1rem', borderTop: '3px dashed var(--border-color)', paddingTop: '1rem' }}>
                <button
                  className="cartoony-btn cartoony-btn-danger"
                  onClick={() => setShowResetConfirm(true)}
                  style={{ width: '100%' }}
                >
                  ⚠️ Reset All Settings
                </button>
              </div>
            </div>

            {showResetConfirm && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'rgba(230, 57, 70, 0.1)',
                border: '3px solid var(--danger)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <p style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  color: 'var(--danger)',
                  marginBottom: '1rem'
                }}>
                  Are you sure? This cannot be undone!
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="cartoony-btn cartoony-btn-danger"
                    onClick={handleReset}
                  >
                    Yes, Reset
                  </button>
                  <button
                    className="cartoony-btn cartoony-btn-secondary"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="cartoony-title" style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          ⚙️ Settings
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '2rem',
          background: 'var(--bg-card)',
          border: '4px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Tabs Sidebar */}
          <div style={{
            background: 'var(--bg-pattern)',
            padding: '1.5rem 1rem',
            borderRight: '4px solid var(--border-color)'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  border: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-primary)',
                  transition: 'var(--transition-normal)',
                  boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{ padding: '2rem' }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
