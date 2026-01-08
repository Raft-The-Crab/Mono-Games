/**
 * Base Game Class - Enhanced Version with Audio Support
 * All games should extend this class for consistent behavior
 */
class BaseGame {
  constructor(containerId, gameId = 'game', width = 800, height = 600) {
    this.id = gameId;
    this.containerId = containerId;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.highScore = this.loadHighScore();

    // Settings
    this.width = width;
    this.height = height;
    this.fps = 60;

    // Game loop
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.fps;
    this.animationFrameId = null;

    // Key handlers
    this.keyHandlers = {};
    this.keysPressed = new Set();
    this.boundKeyDownHandler = this.handleKeyDown.bind(this);
    this.boundKeyUpHandler = this.handleKeyUp.bind(this);
    
    // Audio support
    this.soundEnabled = true;
  }

  /**
   * Initialize the game - call after construction
   */
  init() {
    // Create canvas
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container ${this.containerId} not found`);
      return this;
    }

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    this.canvas.style.borderRadius = '16px';
    this.canvas.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';

    container.innerHTML = '';
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    // Setup input
    document.addEventListener('keydown', this.boundKeyDownHandler);
    document.addEventListener('keyup', this.boundKeyUpHandler);

    // Run setup
    this.setup();

    return this;
  }

  setup() {
    // Override in child class
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    this.keysPressed.add(key);
    
    if (this.keyHandlers[key]) {
      e.preventDefault();
      this.keyHandlers[key]();
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keysPressed.delete(key);
  }

  isKeyPressed(key) {
    return this.keysPressed.has(key.toLowerCase());
  }

  addKeyHandler(key, handler) {
    this.keyHandlers[key.toLowerCase()] = handler;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));

    if (this.isPaused) return;

    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();
  }

  update(deltaTime) {
    // Override in child class
  }

  render() {
    // Override in child class
  }

  clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  endGame(message = 'Game Over!') {
    this.stop();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }

    // Draw game over screen
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = 'bold 36px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.font = '24px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);

    this.ctx.font = '18px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 70);
  }

  reset() {
    this.score = 0;
    this.setup();
    this.start();
  }

  loadHighScore() {
    const key = `highscore_${this.id}`;
    return parseInt(localStorage.getItem(key)) || 0;
  }

  saveHighScore() {
    const key = `highscore_${this.id}`;
    localStorage.setItem(key, this.highScore.toString());
  }

  destroy() {
    this.stop();
    document.removeEventListener('keydown', this.boundKeyDownHandler);
    document.removeEventListener('keyup', this.boundKeyUpHandler);
    
    // Safely remove canvas
    if (this.canvas) {
      try {
        if (this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
      } catch (e) {
        console.warn('Canvas removal error (safe to ignore):', e.message);
      }
      this.canvas = null;
    }
    this.ctx = null;
  }
  
  // Drawing utilities
  drawText(text, x, y, options = {}) {
    const {
      font = '24px Arial',
      color = '#FFFFFF',
      align = 'center',
      baseline = 'middle',
      strokeColor = null,
      strokeWidth = 0
    } = options;
    
    this.ctx.save();
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    
    if (strokeColor && strokeWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeText(text, x, y);
    }
    
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }
  
  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }
  
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
}

export default BaseGame;
