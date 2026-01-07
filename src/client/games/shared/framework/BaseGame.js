/**
 * Base Game Class - Simplified and Working Version
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
    this.boundKeyHandler = this.handleKeyPress.bind(this);
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
    document.addEventListener('keydown', this.boundKeyHandler);

    // Run setup
    this.setup();

    return this;
  }

  setup() {
    // Override in child class
  }

  handleKeyPress(e) {
    const key = e.key.toLowerCase();
    if (this.keyHandlers[key]) {
      e.preventDefault();
      this.keyHandlers[key]();
    }
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
    document.removeEventListener('keydown', this.boundKeyHandler);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export default BaseGame;
