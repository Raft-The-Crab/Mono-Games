/**
 * CAMPFIRE SIMULATOR - Menu System
 * 
 * Cozy menu system for the most relaxing campfire experience
 */

export class CampfireSimulatorMenu {
  private container: HTMLElement;
  private currentScreen: 'main' | 'settings' | 'controls' | 'playing' | 'paused' = 'main';
  private onStartGame: (settings: GameSettings) => void;
  private onResumeGame: () => void;
  private onSettingsChange: (settings: GameSettings) => void;
  
  private settings: GameSettings = {
    graphics: 'high',
    fireIntensity: 0.8,
    particles: true,
    postProcessing: true,
    antialiasing: true,
    volume: 0.7,
    fireVolume: 0.8,
    ambienceVolume: 0.6
  };
  
  constructor(
    containerId: string,
    onStartGame: (settings: GameSettings) => void,
    onResumeGame: () => void,
    onSettingsChange: (settings: GameSettings) => void
  ) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Menu container not found');
    
    this.container = container;
    this.onStartGame = onStartGame;
    this.onResumeGame = onResumeGame;
    this.onSettingsChange = onSettingsChange;
    
    this.createMainMenu();
  }
  
  private createMainMenu(): void {
    this.container.innerHTML = `
      <div class="campfire-menu">
        <div class="menu-background campfire-theme"></div>
        <div class="menu-content">
          <div class="game-title">
            <h1>🔥 CAMPFIRE SIMULATOR</h1>
            <p class="subtitle">Cozy Up by the Fire</p>
          </div>
          
          <div class="menu-buttons">
            <button class="menu-btn primary" id="btn-start">
              <span class="btn-icon">🪵</span>
              <span>Light the Fire</span>
            </button>
            <button class="menu-btn" id="btn-settings">
              <span class="btn-icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button class="menu-btn" id="btn-controls">
              <span class="btn-icon">🎮</span>
              <span>Controls</span>
            </button>
          </div>
          
          <div class="menu-footer">
            <p>Watch the flames dance • Listen to nature • Just relax</p>
          </div>
        </div>
      </div>
    `;
    
    this.addStyles();
    this.attachMainMenuListeners();
    this.currentScreen = 'main';
  }
  
  private createSettingsMenu(): void {
    this.container.innerHTML = `
      <div class="campfire-menu">
        <div class="menu-background campfire-theme"></div>
        <div class="menu-content">
          <div class="menu-header">
            <button class="back-btn" id="btn-back">← Back</button>
            <h2>Settings</h2>
          </div>
          
          <div class="settings-container">
            <div class="settings-section">
              <h3>Graphics</h3>
              
              <div class="setting-item">
                <label>Quality Preset</label>
                <select id="graphics-quality">
                  <option value="ultra" ${this.settings.graphics === 'ultra' ? 'selected' : ''}>Ultra</option>
                  <option value="high" ${this.settings.graphics === 'high' ? 'selected' : ''}>High</option>
                  <option value="medium" ${this.settings.graphics === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="low" ${this.settings.graphics === 'low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label>Fire Intensity</label>
                <input type="range" id="fire-intensity" min="0.3" max="1" step="0.1" value="${this.settings.fireIntensity}">
                <span class="volume-value">${Math.round(this.settings.fireIntensity * 100)}%</span>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="particles" ${this.settings.particles ? 'checked' : ''}>
                  <span>Fire Particles (Smoke, Sparks)</span>
                </label>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="postprocessing" ${this.settings.postProcessing ? 'checked' : ''}>
                  <span>Post-Processing (Glow)</span>
                </label>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="antialiasing" ${this.settings.antialiasing ? 'checked' : ''}>
                  <span>Anti-Aliasing</span>
                </label>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>Audio</h3>
              
              <div class="setting-item">
                <label>Master Volume</label>
                <input type="range" id="volume" min="0" max="1" step="0.1" value="${this.settings.volume}">
                <span class="volume-value">${Math.round(this.settings.volume * 100)}%</span>
              </div>
              
              <div class="setting-item">
                <label>Fire Crackling</label>
                <input type="range" id="fire-volume" min="0" max="1" step="0.1" value="${this.settings.fireVolume}">
                <span class="volume-value">${Math.round(this.settings.fireVolume * 100)}%</span>
              </div>
              
              <div class="setting-item">
                <label>Nature Ambience</label>
                <input type="range" id="ambience-volume" min="0" max="1" step="0.1" value="${this.settings.ambienceVolume}">
                <span class="volume-value">${Math.round(this.settings.ambienceVolume * 100)}%</span>
              </div>
            </div>
          </div>
          
          <div class="menu-footer">
            <button class="menu-btn primary" id="btn-apply-settings">Apply Settings</button>
          </div>
        </div>
      </div>
    `;
    
    this.attachSettingsListeners();
    this.currentScreen = 'settings';
  }
  
  private createControlsMenu(): void {
    this.container.innerHTML = `
      <div class="campfire-menu">
        <div class="menu-background campfire-theme"></div>
        <div class="menu-content">
          <div class="menu-header">
            <button class="back-btn" id="btn-back">← Back</button>
            <h2>Controls</h2>
          </div>
          
          <div class="controls-grid">
            <div class="control-item">
              <div class="control-key">Mouse Drag</div>
              <div class="control-desc">Rotate Camera</div>
            </div>
            <div class="control-item">
              <div class="control-key">Scroll Wheel</div>
              <div class="control-desc">Zoom In/Out</div>
            </div>
            <div class="control-item">
              <div class="control-key">Left Click</div>
              <div class="control-desc">Add Logs to Fire</div>
            </div>
            <div class="control-item">
              <div class="control-key">ESC</div>
              <div class="control-desc">Pause Menu</div>
            </div>
            <div class="control-item">
              <div class="control-key">Space</div>
              <div class="control-desc">Stoke the Fire</div>
            </div>
          </div>
          
          <div class="menu-footer">
            <p class="help-text">💡 Tip: This is a relaxation experience - no objectives, just enjoy the fire!</p>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('btn-back')?.addEventListener('click', () => this.createMainMenu());
    this.currentScreen = 'controls';
  }
  
  public showInGameHUD(): void {
    this.container.innerHTML = `
      <div class="in-game-hud campfire-hud">
        <div class="hud-top-right">
          <div class="hud-item cozy-hud">
            <span class="hud-label">🔥</span>
            <span class="hud-value" id="hud-fire">Burning</span>
          </div>
          <div class="hud-item cozy-hud">
            <span class="hud-label" id="hud-time">Night</span>
          </div>
        </div>
        
        <div class="hud-controls-hint cozy-hint">
          <span>ESC - Menu | Space - Stoke Fire | Scroll - Zoom</span>
        </div>
      </div>
    `;
    
    this.currentScreen = 'playing';
  }
  
  public showPauseMenu(): void {
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'pause-overlay';
    pauseOverlay.id = 'pause-overlay';
    pauseOverlay.innerHTML = `
      <div class="pause-menu campfire-pause">
        <h2>⏸️ Paused</h2>
        <div class="pause-buttons">
          <button class="menu-btn primary" id="btn-resume">Resume</button>
          <button class="menu-btn" id="btn-pause-settings">Settings</button>
          <button class="menu-btn" id="btn-restart">Restart</button>
          <button class="menu-btn" id="btn-main-menu">Main Menu</button>
        </div>
      </div>
    `;
    
    this.container.appendChild(pauseOverlay);
    
    document.getElementById('btn-resume')?.addEventListener('click', () => this.hidePauseMenu());
    document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
      this.hidePauseMenu();
      this.createSettingsMenu();
    });
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.hidePauseMenu();
      this.onStartGame(this.settings);
    });
    document.getElementById('btn-main-menu')?.addEventListener('click', () => {
      this.hidePauseMenu();
      this.createMainMenu();
    });
    
    this.currentScreen = 'paused';
  }
  
  public hidePauseMenu(): void {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.remove();
    this.currentScreen = 'playing';
    this.onResumeGame();
  }
  
  public updateHUD(info: any): void {
    const fireEl = document.getElementById('hud-fire');
    const timeEl = document.getElementById('hud-time');
    
    if (fireEl) fireEl.textContent = info.fireState || 'Burning';
    if (timeEl) timeEl.textContent = info.timeOfDay || 'Night';
  }
  
  private attachMainMenuListeners(): void {
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.showInGameHUD();
      this.onStartGame(this.settings);
    });
    
    document.getElementById('btn-settings')?.addEventListener('click', () => this.createSettingsMenu());
    document.getElementById('btn-controls')?.addEventListener('click', () => this.createControlsMenu());
  }
  
  private attachSettingsListeners(): void {
    document.getElementById('btn-back')?.addEventListener('click', () => this.createMainMenu());
    
    const updateSettings = () => {
      this.settings.graphics = (document.getElementById('graphics-quality') as HTMLSelectElement).value as any;
      this.settings.fireIntensity = parseFloat((document.getElementById('fire-intensity') as HTMLInputElement).value);
      this.settings.particles = (document.getElementById('particles') as HTMLInputElement).checked;
      this.settings.postProcessing = (document.getElementById('postprocessing') as HTMLInputElement).checked;
      this.settings.antialiasing = (document.getElementById('antialiasing') as HTMLInputElement).checked;
      this.settings.volume = parseFloat((document.getElementById('volume') as HTMLInputElement).value);
      this.settings.fireVolume = parseFloat((document.getElementById('fire-volume') as HTMLInputElement).value);
      this.settings.ambienceVolume = parseFloat((document.getElementById('ambience-volume') as HTMLInputElement).value);
      
      this.onSettingsChange(this.settings);
    };
    
    document.getElementById('btn-apply-settings')?.addEventListener('click', () => {
      updateSettings();
      this.createMainMenu();
    });
    
    // Update volume displays
    const volumeSliders = ['volume', 'fire-volume', 'ambience-volume', 'fire-intensity'];
    volumeSliders.forEach(id => {
      const slider = document.getElementById(id) as HTMLInputElement;
      slider?.addEventListener('input', (e) => {
        const value = parseFloat((e.target as HTMLInputElement).value);
        const display = slider.nextElementSibling as HTMLElement;
        if (display) display.textContent = `${Math.round(value * 100)}%`;
      });
    });
  }
  
  private addStyles(): void {
    if (document.getElementById('campfire-menu-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'campfire-menu-styles';
    style.textContent = `
      .campfire-theme {
        background: linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #5a3a2a 100%) !important;
      }
      
      .cozy-hud {
        background: rgba(44, 24, 16, 0.85) !important;
        border: 1px solid rgba(255, 138, 61, 0.3);
        color: #ffb380;
      }
      
      .cozy-hint {
        background: rgba(44, 24, 16, 0.7) !important;
        color: #ffb380;
      }
      
      .campfire-pause {
        background: linear-gradient(135deg, rgba(44, 24, 16, 0.95) 0%, rgba(90, 58, 42, 0.95) 100%);
      }
      
      .campfire-pause h2 {
        color: #ff8a3d;
      }
      
      .help-text {
        margin-top: 15px;
        padding: 12px;
        background: rgba(255, 138, 61, 0.1);
        border-radius: 8px;
        font-size: 14px;
        color: #ffb380;
      }
    `;
    
    document.head.appendChild(style);
  }
}

export interface GameSettings {
  graphics: 'ultra' | 'high' | 'medium' | 'low';
  fireIntensity: number;
  particles: boolean;
  postProcessing: boolean;
  antialiasing: boolean;
  volume: number;
  fireVolume: number;
  ambienceVolume: number;
}
