/**
 * SPACE EXPLORER - Menu System
 * 
 * Complete menu system with:
 * - Main Menu
 * - Settings (Graphics, Audio)
 * - In-Game HUD
 * - Pause Menu
 * - Controls Guide
 */

export class SpaceExplorerMenu {
  private container: HTMLElement;
  private currentScreen: 'main' | 'settings' | 'controls' | 'playing' | 'paused' = 'main';
  private onStartGame: (settings: GameSettings) => void;
  private onResumeGame: () => void;
  private onSettingsChange: (settings: GameSettings) => void;
  
  private settings: GameSettings = {
    graphics: 'high',
    shadows: true,
    particles: true,
    postProcessing: true,
    antialiasing: true,
    volume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8
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
      <div class="space-explorer-menu">
        <div class="menu-background space-theme"></div>
        <div class="menu-content">
          <div class="game-title">
            <h1>🚀 SPACE EXPLORER</h1>
            <p class="subtitle">Peaceful Journey Through the Cosmos</p>
          </div>
          
          <div class="menu-buttons">
            <button class="menu-btn primary" id="btn-start">
              <span class="btn-icon">🌌</span>
              <span>Begin Exploration</span>
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
            <p>Explore infinite space • No objectives, just wonder</p>
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
      <div class="space-explorer-menu">
        <div class="menu-background space-theme"></div>
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
                <label>
                  <input type="checkbox" id="particles" ${this.settings.particles ? 'checked' : ''}>
                  <span>Nebula Particles</span>
                </label>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="postprocessing" ${this.settings.postProcessing ? 'checked' : ''}>
                  <span>Post-Processing (Bloom)</span>
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
                <label>Ambient Sounds</label>
                <input type="range" id="music-volume" min="0" max="1" step="0.1" value="${this.settings.musicVolume}">
                <span class="volume-value">${Math.round(this.settings.musicVolume * 100)}%</span>
              </div>
              
              <div class="setting-item">
                <label>Sound Effects</label>
                <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="${this.settings.sfxVolume}">
                <span class="volume-value">${Math.round(this.settings.sfxVolume * 100)}%</span>
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
      <div class="space-explorer-menu">
        <div class="menu-background space-theme"></div>
        <div class="menu-content">
          <div class="menu-header">
            <button class="back-btn" id="btn-back">← Back</button>
            <h2>Controls</h2>
          </div>
          
          <div class="controls-grid">
            <div class="control-item">
              <div class="control-key">W / ↑</div>
              <div class="control-desc">Accelerate Forward</div>
            </div>
            <div class="control-item">
              <div class="control-key">S / ↓</div>
              <div class="control-desc">Slow Down</div>
            </div>
            <div class="control-item">
              <div class="control-key">A / ←</div>
              <div class="control-desc">Turn Left</div>
            </div>
            <div class="control-item">
              <div class="control-key">D / →</div>
              <div class="control-desc">Turn Right</div>
            </div>
            <div class="control-item">
              <div class="control-key">Q / E</div>
              <div class="control-desc">Roll Ship</div>
            </div>
            <div class="control-item">
              <div class="control-key">Space</div>
              <div class="control-desc">Boost Speed</div>
            </div>
            <div class="control-item">
              <div class="control-key">C</div>
              <div class="control-desc">Change Camera</div>
            </div>
            <div class="control-item">
              <div class="control-key">ESC</div>
              <div class="control-desc">Pause Menu</div>
            </div>
            <div class="control-item">
              <div class="control-key">Mouse</div>
              <div class="control-desc">Look Around</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('btn-back')?.addEventListener('click', () => this.createMainMenu());
    this.currentScreen = 'controls';
  }
  
  public showInGameHUD(): void {
    this.container.innerHTML = `
      <div class="in-game-hud">
        <div class="hud-top-left">
          <div class="hud-item space-hud">
            <span class="hud-label">Speed</span>
            <span class="hud-value" id="hud-speed">0</span>
            <span class="hud-unit">u/s</span>
          </div>
          <div class="hud-item space-hud">
            <span class="hud-label">Distance</span>
            <span class="hud-value" id="hud-distance">0</span>
            <span class="hud-unit">ly</span>
          </div>
        </div>
        
        <div class="hud-top-right">
          <div class="hud-item space-hud">
            <span class="hud-label" id="hud-sector">Unknown Sector</span>
          </div>
          <div class="hud-item space-hud">
            <span class="hud-label" id="hud-fps">60 FPS</span>
          </div>
        </div>
        
        <div class="hud-bottom">
          <div class="hud-nearby">
            <span id="hud-nearby">Scanning...</span>
          </div>
        </div>
        
        <div class="hud-controls-hint">
          <span>ESC - Menu | C - Camera | Space - Boost</span>
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
      <div class="pause-menu space-pause">
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
    const speedEl = document.getElementById('hud-speed');
    const distanceEl = document.getElementById('hud-distance');
    const sectorEl = document.getElementById('hud-sector');
    const fpsEl = document.getElementById('hud-fps');
    const nearbyEl = document.getElementById('hud-nearby');
    
    if (speedEl) speedEl.textContent = Math.round(info.speed).toString();
    if (distanceEl) distanceEl.textContent = info.distance.toFixed(1);
    if (sectorEl) sectorEl.textContent = info.sector || 'Unknown Sector';
    if (fpsEl) fpsEl.textContent = `${info.fps} FPS`;
    if (nearbyEl) nearbyEl.textContent = info.nearby || 'Empty space';
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
      this.settings.particles = (document.getElementById('particles') as HTMLInputElement).checked;
      this.settings.postProcessing = (document.getElementById('postprocessing') as HTMLInputElement).checked;
      this.settings.antialiasing = (document.getElementById('antialiasing') as HTMLInputElement).checked;
      this.settings.volume = parseFloat((document.getElementById('volume') as HTMLInputElement).value);
      this.settings.musicVolume = parseFloat((document.getElementById('music-volume') as HTMLInputElement).value);
      this.settings.sfxVolume = parseFloat((document.getElementById('sfx-volume') as HTMLInputElement).value);
      
      this.onSettingsChange(this.settings);
    };
    
    document.getElementById('btn-apply-settings')?.addEventListener('click', () => {
      updateSettings();
      this.createMainMenu();
    });
    
    // Update volume displays
    const volumeSliders = ['volume', 'music-volume', 'sfx-volume'];
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
    if (document.getElementById('space-explorer-menu-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'space-explorer-menu-styles';
    style.textContent = `
      .space-theme {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
      }
      
      .space-hud {
        background: rgba(10, 25, 47, 0.85) !important;
        border: 1px solid rgba(52, 152, 219, 0.3);
      }
      
      .space-pause {
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 52, 96, 0.95) 100%);
      }
      
      .space-pause h2 {
        color: #3498db;
      }
    `;
    
    document.head.appendChild(style);
  }
}

export interface GameSettings {
  graphics: 'ultra' | 'high' | 'medium' | 'low';
  shadows: boolean;
  particles: boolean;
  postProcessing: boolean;
  antialiasing: boolean;
  volume: number;
  musicVolume: number;
  sfxVolume: number;
}
