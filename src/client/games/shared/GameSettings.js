// Enhanced Game Settings with AI Difficulty Integration
// Extends GameMenu to include AI opponent settings for applicable games

export class GameSettings {
    constructor(game) {
        this.game = game;
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const stored = localStorage.getItem(`game_settings_${this.game.gameId}`);
        if (stored) {
            return JSON.parse(stored);
        }

        // Default settings
        return {
            // AI Settings (for games with AI opponents)
            aiDifficulty: 'medium', // easy, medium, hard, expert
            aiEnabled: true,

            // Audio Settings
            soundEffects: true,
            music: true,
            volume: 0.7,

            // Graphics Settings (integrated with graphicsManager)
            quality: 'high', // low, medium, high, ultra
            particles: true,
            screenShake: true,

            // Gameplay Settings
            showHints: true,
            showTutorial: true,
            vibration: true
        };
    }

    saveSettings() {
        localStorage.setItem(`game_settings_${this.game.gameId}`, JSON.stringify(this.settings));
    }

    // AI Difficulty Settings
    setAIDifficulty(level) {
        this.settings.aiDifficulty = level;
        this.saveSettings();

        // Update game AI if it has one
        if (this.game.ai) {
            this.game.ai.setDifficulty(level);
        }
    }

    getAIDifficulty() {
        return this.settings.aiDifficulty;
    }

    toggleAI() {
        this.settings.aiEnabled = !this.settings.aiEnabled;
        this.saveSettings();
        return this.settings.aiEnabled;
    }

    // Audio Settings
    toggleSoundEffects() {
        this.settings.soundEffects = !this.settings.soundEffects;
        this.saveSettings();
        return this.settings.soundEffects;
    }

    toggleMusic() {
        this.settings.music = !this.settings.music;
        this.saveSettings();
        return this.settings.music;
    }

    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    // Graphics Settings
    setQuality(quality) {
        this.settings.quality = quality;
        this.saveSettings();

        // Update global graphics manager
        import('../services/graphicsManager').then(({ default: gfx }) => {
            gfx.setQuality(quality);
        });
    }

    toggleParticles() {
        this.settings.particles = !this.settings.particles;
        this.saveSettings();
        return this.settings.particles;
    }

    toggleScreenShake() {
        this.settings.screenShake = !this.settings.screenShake;
        this.saveSettings();
        return this.settings.screenShake;
    }

    // Gameplay Settings
    toggleHints() {
        this.settings.showHints = !this.settings.showHints;
        this.saveSettings();
        return this.settings.showHints;
    }

    toggleVibration() {
        this.settings.vibration = !this.settings.vibration;
        this.saveSettings();
        return this.settings.vibration;
    }

    // Get all settings
    getSettings() {
        return { ...this.settings };
    }

    // Reset to defaults
    resetToDefaults() {
        this.settings = {
            aiDifficulty: 'medium',
            aiEnabled: true,
            soundEffects: true,
            music: true,
            volume: 0.7,
            quality: 'high',
            particles: true,
            screenShake: true,
            showHints: true,
            showTutorial: true,
            vibration: true
        };
        this.saveSettings();
    }
}

// Enhanced Settings Menu UI with AI Controls
export function createSettingsMenu(game, gameSettings) {
    const hasAI = ['pong', 'tic-tac-toe', 'connect-four', 'chess'].includes(game.gameId);

    const menu = document.createElement('div');
    menu.className = 'settings-menu';
    menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: 6px solid #2C3E50;
    border-radius: 32px;
    padding: 2rem;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 10000;
    font-family: 'Comic Sans MS', cursive;
  `;

    menu.innerHTML = `
    <h2 style="color: white; margin: 0 0 2rem 0; text-align: center; font-size: 2rem;">
      ⚙️ Game Settings
    </h2>
    
    ${hasAI ? `
      <div class="settings-section">
        <h3 style="color: white; margin: 1rem 0;">🤖 AI Opponent</h3>
        <div class="setting-row">
          <label>Difficulty:</label>
          <select id="ai-difficulty" style="padding: 0.5rem; border-radius: 8px; font-size: 1rem;">
            <option value="easy" ${gameSettings.settings.aiDifficulty === 'easy' ? 'selected' : ''}>Easy 😊</option>
            <option value="medium" ${gameSettings.settings.aiDifficulty === 'medium' ? 'selected' : ''}>Medium 🤔</option>
            <option value="hard" ${gameSettings.settings.aiDifficulty === 'hard' ? 'selected' : ''}>Hard 😤</option>
            <option value="expert" ${gameSettings.settings.aiDifficulty === 'expert' ? 'selected' : ''}>Expert 🔥</option>
          </select>
        </div>
        <div class="setting-row">
          <label>AI Enabled:</label>
          <button id="toggle-ai" class="toggle-btn ${gameSettings.settings.aiEnabled ? 'on' : 'off'}">
            ${gameSettings.settings.aiEnabled ? '✓ ON' : '✗ OFF'}
          </button>
        </div>
      </div>
    ` : ''}
    
    <div class="settings-section">
      <h3 style="color: white; margin: 1rem 0;">🎨 Graphics</h3>
      <div class="setting-row">
        <label>Quality:</label>
        <select id="graphics-quality" style="padding: 0.5rem; border-radius: 8px; font-size: 1rem;">
          <option value="low">Low (30 FPS)</option>
          <option value="medium">Medium (60 FPS)</option>
          <option value="high" selected>High (120 FPS)</option>
          <option value="ultra">Ultra (Unlimited)</option>
        </select>
      </div>
      <div class="setting-row">
        <label>Particles:</label>
        <button id="toggle-particles" class="toggle-btn ${gameSettings.settings.particles ? 'on' : 'off'}">
          ${gameSettings.settings.particles ? '✓ ON' : '✗ OFF'}
        </button>
      </div>
    </div>
    
    <div class="settings-section">
      <h3 style="color: white; margin: 1rem 0;">🔊 Audio</h3>
      <div class="setting-row">
        <label>Sound Effects:</label>
        <button id="toggle-sound" class="toggle-btn ${gameSettings.settings.soundEffects ? 'on' : 'off'}">
          ${gameSettings.settings.soundEffects ? '✓ ON' : '✗ OFF'}
        </button>
      </div>
      <div class="setting-row">
        <label>Music:</label>
        <button id="toggle-music" class="toggle-btn ${gameSettings.settings.music ? 'on' : 'off'}">
          ${gameSettings.settings.music ? '✓ ON' : '✗ OFF'}
        </button>
      </div>
    </div>
    
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
      <button id="reset-settings" style="flex: 1; padding: 1rem; background: #FF6B6B; border: 3px solid #2C3E50; border-radius: 16px; color: white; font-weight: 900; cursor: pointer;">
        🔄 Reset
      </button>
      <button id="close-settings" style="flex: 1; padding: 1rem; background: #4ECDC4; border: 3px solid #2C3E50; border-radius: 16px; color: white; font-weight: 900; cursor: pointer;">
        ✓ Done
      </button>
    </div>
  `;

    // Add event listeners
    if (hasAI) {
        menu.querySelector('#ai-difficulty').addEventListener('change', (e) => {
            gameSettings.setAIDifficulty(e.target.value);
        });

        menu.querySelector('#toggle-ai').addEventListener('click', (e) => {
            const enabled = gameSettings.toggleAI();
            e.target.className = `toggle-btn ${enabled ? 'on' : 'off'}`;
            e.target.textContent = enabled ? '✓ ON' : '✗ OFF';
        });
    }

    menu.querySelector('#graphics-quality').addEventListener('change', (e) => {
        gameSettings.setQuality(e.target.value);
    });

    menu.querySelector('#toggle-particles').addEventListener('click', (e) => {
        const enabled = gameSettings.toggleParticles();
        e.target.className = `toggle-btn ${enabled ? 'on' : 'off'}`;
        e.target.textContent = enabled ? '✓ ON' : '✗ OFF';
    });

    menu.querySelector('#toggle-sound').addEventListener('click', (e) => {
        const enabled = gameSettings.toggleSoundEffects();
        e.target.className = `toggle-btn ${enabled ? 'on' : 'off'}`;
        e.target.textContent = enabled ? '✓ ON' : '✗ OFF';
    });

    menu.querySelector('#toggle-music').addEventListener('click', (e) => {
        const enabled = gameSettings.toggleMusic();
        e.target.className = `toggle-btn ${enabled ? 'on' : 'off'}`;
        e.target.textContent = enabled ? '✓ ON' : '✗ OFF';
    });

    menu.querySelector('#reset-settings').addEventListener('click', () => {
        if (confirm('Reset all settings to default?')) {
            gameSettings.resetToDefaults();
            menu.remove();
            createSettingsMenu(game, gameSettings); // Recreate with defaults
        }
    });

    menu.querySelector('#close-settings').addEventListener('click', () => {
        menu.remove();
    });

    // Add CSS for toggle buttons
    const style = document.createElement('style');
    style.textContent = `
    .settings-section { margin: 1.5rem 0; }
    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      margin: 0.5rem 0;
      color: white;
      font-weight: 700;
    }
    .toggle-btn {
      padding: 0.5rem 1.5rem;
      border: 3px solid #2C3E50;
      border-radius: 12px;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn.on {
      background: #4ECDC4;
      color: white;
    }
    .toggle-btn.off {
      background: #999;
      color: #666;
    }
  `;
    document.head.appendChild(style);

    document.body.appendChild(menu);
    return menu;
}

export default GameSettings;
