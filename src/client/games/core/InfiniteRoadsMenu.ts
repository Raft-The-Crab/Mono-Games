/**
 * INFINITE ROADS - Menu System
 * 
 * Complete menu system with:
 * - Main Menu
 * - Car Selection
 * - Settings (Graphics, Audio, Controls)
 * - In-Game HUD
 * - Pause Menu
 */

export class InfiniteRoadsMenu {
  private container: HTMLElement;
  private currentScreen: 'main' | 'cars' | 'settings' | 'controls' | 'playing' | 'paused' = 'main';
  private onStartGame: (carIndex: number, settings: GameSettings) => void;
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
  
  private selectedCarIndex: number = 0;
  
  constructor(
    containerId: string,
    onStartGame: (carIndex: number, settings: GameSettings) => void,
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
      <div class="infinite-roads-menu">
        <div class="menu-background"></div>
        <div class="menu-content">
          <div class="game-title">
            <h1>INFINITE ROADS</h1>
            <p class="subtitle">The Ultimate Driving Experience</p>
          </div>
          
          <div class="menu-buttons">
            <button class="menu-btn primary" id="btn-start">
              <span class="btn-icon">🎮</span>
              <span>Start Driving</span>
            </button>
            <button class="menu-btn" id="btn-cars">
              <span class="btn-icon">🚗</span>
              <span>Choose Car</span>
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
            <p>Use WASD or Arrow Keys to drive • No goals, just relax</p>
          </div>
        </div>
      </div>
    `;
    
    this.addStyles();
    this.attachMainMenuListeners();
    this.currentScreen = 'main';
  }
  
  private createCarSelectionMenu(): void {
    const cars = this.getCarList();
    
    const carsHTML = cars.map((car, index) => `
      <div class="car-card ${index === this.selectedCarIndex ? 'selected' : ''}" data-index="${index}">
        <div class="car-icon">${car.icon}</div>
        <h3>${car.name}</h3>
        <p class="car-description">${car.description}</p>
        <div class="car-stats">
          <div class="stat">
            <span class="stat-label">Speed</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${car.maxSpeed / 4.2}%"></div>
            </div>
            <span class="stat-value">${car.maxSpeed} km/h</span>
          </div>
          <div class="stat">
            <span class="stat-label">Acceleration</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${car.acceleration * 10}%"></div>
            </div>
          </div>
          <div class="stat">
            <span class="stat-label">Handling</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${car.handling * 100}%"></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    this.container.innerHTML = `
      <div class="infinite-roads-menu">
        <div class="menu-background"></div>
        <div class="menu-content">
          <div class="menu-header">
            <button class="back-btn" id="btn-back">← Back</button>
            <h2>Choose Your Car</h2>
          </div>
          
          <div class="car-grid">
            ${carsHTML}
          </div>
          
          <div class="menu-footer">
            <button class="menu-btn primary" id="btn-start-with-car">Start Driving</button>
          </div>
        </div>
      </div>
    `;
    
    this.attachCarSelectionListeners();
    this.currentScreen = 'cars';
  }
  
  private createSettingsMenu(): void {
    this.container.innerHTML = `
      <div class="infinite-roads-menu">
        <div class="menu-background"></div>
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
                  <option value="ultra" ${this.settings.graphics === 'ultra' ? 'selected' : ''}>Ultra (Best)</option>
                  <option value="high" ${this.settings.graphics === 'high' ? 'selected' : ''}>High</option>
                  <option value="medium" ${this.settings.graphics === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="low" ${this.settings.graphics === 'low' ? 'selected' : ''}>Low (Performance)</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="shadows" ${this.settings.shadows ? 'checked' : ''}>
                  <span>Shadows</span>
                </label>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="particles" ${this.settings.particles ? 'checked' : ''}>
                  <span>Particle Effects</span>
                </label>
              </div>
              
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="postprocessing" ${this.settings.postProcessing ? 'checked' : ''}>
                  <span>Post-Processing (Bloom, DOF)</span>
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
                <label>Music Volume</label>
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
      <div class="infinite-roads-menu">
        <div class="menu-background"></div>
        <div class="menu-content">
          <div class="menu-header">
            <button class="back-btn" id="btn-back">← Back</button>
            <h2>Controls</h2>
          </div>
          
          <div class="controls-grid">
            <div class="control-item">
              <div class="control-key">W / ↑</div>
              <div class="control-desc">Accelerate</div>
            </div>
            <div class="control-item">
              <div class="control-key">S / ↓</div>
              <div class="control-desc">Brake / Reverse</div>
            </div>
            <div class="control-item">
              <div class="control-key">A / ←</div>
              <div class="control-desc">Steer Left</div>
            </div>
            <div class="control-item">
              <div class="control-key">D / →</div>
              <div class="control-desc">Steer Right</div>
            </div>
            <div class="control-item">
              <div class="control-key">C</div>
              <div class="control-desc">Change Camera</div>
            </div>
            <div class="control-item">
              <div class="control-key">V</div>
              <div class="control-desc">Change Car</div>
            </div>
            <div class="control-item">
              <div class="control-key">H</div>
              <div class="control-desc">Toggle Headlights</div>
            </div>
            <div class="control-item">
              <div class="control-key">N</div>
              <div class="control-desc">Change Weather</div>
            </div>
            <div class="control-item">
              <div class="control-key">B</div>
              <div class="control-desc">Change Biome</div>
            </div>
            <div class="control-item">
              <div class="control-key">T</div>
              <div class="control-desc">Change Time of Day</div>
            </div>
            <div class="control-item">
              <div class="control-key">ESC</div>
              <div class="control-desc">Pause Menu</div>
            </div>
            <div class="control-item">
              <div class="control-key">Mouse</div>
              <div class="control-desc">Rotate Camera</div>
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
          <div class="hud-item">
            <span class="hud-label">Speed</span>
            <span class="hud-value" id="hud-speed">0</span>
            <span class="hud-unit">km/h</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Distance</span>
            <span class="hud-value" id="hud-distance">0.0</span>
            <span class="hud-unit">km</span>
          </div>
        </div>
        
        <div class="hud-top-right">
          <div class="hud-item">
            <span class="hud-label" id="hud-time">14:00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label" id="hud-weather">Clear</span>
          </div>
          <div class="hud-item">
            <span class="hud-label" id="hud-fps">60 FPS</span>
          </div>
        </div>
        
        <div class="hud-bottom">
          <div class="hud-car-info">
            <span id="hud-car">Sedan</span>
          </div>
          <div class="hud-biome">
            <span id="hud-biome">Grassland</span>
          </div>
          <div class="hud-camera">
            <span id="hud-camera">Chase Camera</span>
          </div>
        </div>
        
        <div class="hud-controls-hint">
          <span>ESC - Menu | C - Camera | V - Change Car | H - Lights</span>
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
      <div class="pause-menu">
        <h2>Paused</h2>
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
      this.onStartGame(this.selectedCarIndex, this.settings);
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
    document.getElementById('hud-speed')!.textContent = Math.round(info.speed).toString();
    document.getElementById('hud-distance')!.textContent = (info.distance / 1000).toFixed(1);
    document.getElementById('hud-time')!.textContent = info.time;
    document.getElementById('hud-weather')!.textContent = info.weather;
    document.getElementById('hud-fps')!.textContent = `${info.fps} FPS`;
    document.getElementById('hud-car')!.textContent = info.car;
    document.getElementById('hud-biome')!.textContent = info.biome;
    document.getElementById('hud-camera')!.textContent = info.camera || 'Chase Camera';
  }
  
  private attachMainMenuListeners(): void {
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.showInGameHUD();
      this.onStartGame(this.selectedCarIndex, this.settings);
    });
    
    document.getElementById('btn-cars')?.addEventListener('click', () => this.createCarSelectionMenu());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.createSettingsMenu());
    document.getElementById('btn-controls')?.addEventListener('click', () => this.createControlsMenu());
  }
  
  private attachCarSelectionListeners(): void {
    document.getElementById('btn-back')?.addEventListener('click', () => this.createMainMenu());
    
    document.querySelectorAll('.car-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.getAttribute('data-index') || '0');
        this.selectedCarIndex = index;
        
        document.querySelectorAll('.car-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
    
    document.getElementById('btn-start-with-car')?.addEventListener('click', () => {
      this.showInGameHUD();
      this.onStartGame(this.selectedCarIndex, this.settings);
    });
  }
  
  private attachSettingsListeners(): void {
    document.getElementById('btn-back')?.addEventListener('click', () => this.createMainMenu());
    
    const updateSettings = () => {
      this.settings.graphics = (document.getElementById('graphics-quality') as HTMLSelectElement).value as any;
      this.settings.shadows = (document.getElementById('shadows') as HTMLInputElement).checked;
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
  
  private getCarList() {
    return [
      { icon: '🚗', name: 'Classic Sedan', description: 'Reliable daily driver', maxSpeed: 160, acceleration: 3.5, handling: 0.75 },
      { icon: '🏎️', name: 'Apex GT-R', description: 'Twin-turbo sports car', maxSpeed: 310, acceleration: 9.0, handling: 0.88 },
      { icon: '🚙', name: 'Trail Master SUV', description: 'Rugged off-roader', maxSpeed: 150, acceleration: 3.0, handling: 0.65 },
      { icon: '🚚', name: 'Heavy Hauler', description: 'Massive hauling truck', maxSpeed: 130, acceleration: 2.2, handling: 0.55 },
      { icon: '🏍️', name: 'Speed Demon', description: 'Nimble sportbike', maxSpeed: 250, acceleration: 7.5, handling: 0.98 },
      { icon: '🚐', name: 'Family Van', description: 'Spacious transport', maxSpeed: 140, acceleration: 2.5, handling: 0.60 },
      { icon: '🚌', name: 'City Bus', description: 'Public transport giant', maxSpeed: 110, acceleration: 1.5, handling: 0.45 },
      { icon: '🏖️', name: 'Beach Convertible', description: 'Top-down cruiser', maxSpeed: 190, acceleration: 5.0, handling: 0.80 },
      { icon: '🏁', name: 'Rally Beast', description: 'AWD rally champion', maxSpeed: 270, acceleration: 8.0, handling: 0.92 },
      { icon: '⚡', name: 'Silent Volt', description: 'Electric powerhouse', maxSpeed: 200, acceleration: 9.5, handling: 0.85 }
    ];
  }
  
  private addStyles(): void {
    if (document.getElementById('infinite-roads-menu-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'infinite-roads-menu-styles';
    style.textContent = `
      .infinite-roads-menu {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .menu-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        opacity: 0.95;
      }
      
      .menu-content {
        position: relative;
        max-width: 900px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      
      .game-title {
        text-align: center;
        margin-bottom: 40px;
      }
      
      .game-title h1 {
        font-size: 64px;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .subtitle {
        font-size: 20px;
        color: #666;
        margin-top: 10px;
      }
      
      .menu-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 30px 0;
      }
      
      .menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 18px 30px;
        font-size: 18px;
        font-weight: 600;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #f0f0f0;
        color: #333;
      }
      
      .menu-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }
      
      .menu-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .menu-btn.primary:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      }
      
      .btn-icon {
        font-size: 24px;
      }
      
      .menu-footer {
        text-align: center;
        margin-top: 30px;
        color: #666;
        font-size: 14px;
      }
      
      .menu-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .back-btn {
        padding: 10px 20px;
        background: #f0f0f0;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .back-btn:hover {
        background: #e0e0e0;
      }
      
      .car-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      
      .car-card {
        background: white;
        border: 3px solid transparent;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .car-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
      
      .car-card.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      }
      
      .car-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 10px;
      }
      
      .car-card h3 {
        font-size: 18px;
        margin: 10px 0 5px;
        color: #333;
      }
      
      .car-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
      }
      
      .car-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        color: #666;
        font-weight: 600;
      }
      
      .stat-bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .stat-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s;
      }
      
      .stat-value {
        font-size: 12px;
        color: #333;
        font-weight: 600;
      }
      
      .settings-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin: 20px 0;
      }
      
      .settings-section {
        background: #f8f8f8;
        border-radius: 12px;
        padding: 20px;
      }
      
      .settings-section h3 {
        margin-top: 0;
        color: #333;
      }
      
      .setting-item {
        margin: 15px 0;
      }
      
      .setting-item label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
      
      .setting-item select,
      .setting-item input[type="range"] {
        width: 100%;
        padding: 8px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }
      
      .volume-value {
        font-size: 14px;
        color: #667eea;
        font-weight: 600;
        margin-left: 10px;
      }
      
      .controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
      }
      
      .control-item {
        background: #f8f8f8;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
      }
      
      .control-key {
        font-size: 18px;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 8px;
      }
      
      .control-desc {
        font-size: 14px;
        color: #666;
      }
      
      .in-game-hud {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
      }
      
      .hud-top-left {
        position: absolute;
        top: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .hud-top-right {
        position: absolute;
        top: 20px;
        right: 20px;
        text-align: right;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .hud-bottom {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 30px;
      }
      
      .hud-item {
        background: rgba(0, 0, 0, 0.7);
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 16px;
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      
      .hud-label {
        font-size: 12px;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .hud-value {
        font-size: 32px;
        font-weight: 700;
        color: #667eea;
      }
      
      .hud-unit {
        font-size: 14px;
        opacity: 0.8;
      }
      
      .hud-controls-hint {
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.6);
        padding: 10px 15px;
        border-radius: 6px;
        color: white;
        font-size: 12px;
        opacity: 0.7;
      }
      
      .pause-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }
      
      .pause-menu {
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        text-align: center;
      }
      
      .pause-menu h2 {
        margin-top: 0;
        font-size: 36px;
        color: #333;
      }
      
      .pause-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 30px;
      }
      
      @media (max-width: 768px) {
        .game-title h1 {
          font-size: 40px;
        }
        
        .settings-container {
          grid-template-columns: 1fr;
        }
        
        .car-grid {
          grid-template-columns: 1fr;
        }
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

interface RoadSegment {
  mesh: BABYLON.Mesh;
  curve: number;
  elevation: number;
  index: number;
}

interface TerrainChunk {
  mesh: BABYLON.Mesh;
  index: number;
}
