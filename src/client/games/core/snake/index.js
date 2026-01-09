import BaseGame from '../../shared/framework/BaseGame.js';
import useSettingsStore from '../../../store/settingsStore';
import { GameMenu } from '../../shared/GameMenu.js';

/**
 * Enhanced Snake Game - SUPER POLISHED!
 */
class SnakeGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'snake', 600, 600);

    const settings = useSettingsStore.getState().settings;
    this.difficulty = settings.gameplay.difficulty || 'normal';

    // Difficulty settings
    const speedMap = {
      'easy': 8,
      'normal': 12,
      'hard': 18
    };

    this.gridSize = 20;
    this.tileCount = 30;
    this.fps = speedMap[this.difficulty];

    this.snake = [];
    this.apple = { x: 0, y: 0 };
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    // Enhanced features
    this.particles = [];
    this.trail = [];
    this.menu = new GameMenu(this);
    this.appleGlow = 0;
    this.snakeColorIndex = 0;
    this.rainbowMode = false;
  }

  setup() {
    // Initialize snake in the center
    const centerX = Math.floor(this.tileCount / 2);
    const centerY = Math.floor(this.tileCount / 2);

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];

    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;

    this.spawnApple();
    this.setupControls();

    // Slower game loop for snake
    this.lastMoveTime = 0;
    this.moveInterval = 100; // ms between moves
  }

  setupControls() {
    this.addKeyHandler('arrowup', () => {
      if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
    });
    this.addKeyHandler('w', () => {
      if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
    });
    this.addKeyHandler('arrowdown', () => {
      if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
    });
    this.addKeyHandler('s', () => {
      if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
    });
    this.addKeyHandler('arrowleft', () => {
      if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
    });
    this.addKeyHandler('a', () => {
      if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
    });
    this.addKeyHandler('arrowright', () => {
      if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
    });
    this.addKeyHandler('d', () => {
      if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
    });
    this.addKeyHandler(' ', () => {
      this.isPaused ? this.resume() : this.pause();
    });
    this.addKeyHandler('escape', () => {
      if (!this.menu.isOpen) {
        this.pause();
        this.menu.show('pause');
      }
    });
    this.addKeyHandler('r', () => {
      this.reset();
    });
  }

  update(deltaTime) {
    this.lastMoveTime += deltaTime * 1000;

    if (this.lastMoveTime < this.moveInterval) return;
    this.lastMoveTime = 0;

    // Update direction
    this.direction = { ...this.nextDirection };

    // Move snake
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    // Check wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.pause();
      this.menu.show('gameover');
      return;
    }

    // Check self collision
    for (const segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.pause();
        this.menu.show('gameover');
        return;
      }
    }

    this.snake.unshift(head);

    // Check apple collision
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.score += 10;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }

      // CREATE PARTICLES! 🎉
      this.createAppleParticles(head.x * this.gridSize, head.y * this.gridSize);

      // Screen shake for juice
      this.shakeScreen(5);

      this.spawnApple();
      // Snake grows - don't remove tail
    } else {
      this.snake.pop();
    }

    // Update particles
    this.updateParticles(deltaTime);

    // Update apple glow animation
    this.appleGlow = (this.appleGlow + deltaTime * 3) % (Math.PI * 2);
  }

  createAppleParticles(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + this.gridSize / 2,
        y: y + this.gridSize / 2,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1.0,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
      });
    }
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 400 * deltaTime; // Gravity
      p.life -= deltaTime * 2;
      return p.life > 0;
    });
  }

  shakeScreen(intensity) {
    // Add screen shake effect (implemented in render)
    this.screenShake = {
      intensity,
      duration: 0.2,
      time: 0
    };
  }

  render() {
    // Apply screen shake if active
    if (this.screenShake && this.screenShake.time < this.screenShake.duration) {
      this.screenShake.time += 0.016; // Assuming 60fps
      const shake = this.screenShake.intensity * (1 - this.screenShake.time / this.screenShake.duration);
      this.ctx.save();
      this.ctx.translate(
        (Math.random() - 0.5) * shake,
        (Math.random() - 0.5) * shake
      );
    }

    this.clearCanvas();

    // Background - Enhanced grid
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.tileCount; i++) {
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Draw snake with gradient and glow
    this.snake.forEach((segment, index) => {
      const hue = this.rainbowMode ? (index * 10) % 360 : 120;
      const alpha = 1 - (index / this.snake.length) * 0.3;

      // Glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

      // Main segment
      this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
      this.ctx.fillRect(
        segment.x * this.gridSize + 2,
        segment.y * this.gridSize + 2,
        this.gridSize - 4,
        this.gridSize - 4
      );

      // Shine effect
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * alpha})`;
      this.ctx.fillRect(
        segment.x * this.gridSize + 4,
        segment.y * this.gridSize + 4,
        this.gridSize / 2,
        this.gridSize / 2
      );

      this.ctx.shadowBlur = 0;
    });

    // Draw apple with glow animation
    const glowIntensity = Math.sin(this.appleGlow) * 10 + 15;
    this.ctx.shadowBlur = glowIntensity;
    this.ctx.shadowColor = '#ff0000';

    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(
      this.apple.x * this.gridSize + this.gridSize / 2,
      this.apple.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Apple shine
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(
      this.apple.x * this.gridSize + this.gridSize / 3,
      this.apple.y * this.gridSize + this.gridSize / 3,
      this.gridSize / 6,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(p.x, p.y, 4, 4);
      this.ctx.globalAlpha = 1;
    });

    if (this.screenShake) {
      this.ctx.restore();
    }

    // HUD - Enhanced
    this.ctx.font = 'bold 20px "Comic Sans MS"';
    this.ctx.fillStyle = '#FFD93D';
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 4;

    const scoreText = `Score: ${this.score}`;
    this.ctx.strokeText(scoreText, 15, 30);
    this.ctx.fillText(scoreText, 15, 30);

    const highScoreText = `Best: ${this.highScore}`;
    this.ctx.strokeText(highScoreText, 15, 60);
    this.ctx.fillText(highScoreText, 15, 60);

    if (this.isPaused) {
      this.ctx.font = 'bold 48px "Comic Sans MS"';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.strokeStyle = '#2C3E50';
      this.ctx.lineWidth = 6;
      const pausedText = 'PAUSED';
      const textWidth = this.ctx.measureText(pausedText).width;
      this.ctx.strokeText(pausedText, (this.canvas.width - textWidth) / 2, this.canvas.height / 2);
      this.ctx.fillText(pausedText, (this.canvas.width - textWidth) / 2, this.canvas.height / 2);
    }
  }

  spawnApple() {
    let validPosition = false;

    while (!validPosition) {
      this.apple = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };

      validPosition = true;
      for (const segment of this.snake) {
        if (segment.x === this.apple.x && segment.y === this.apple.y) {
          validPosition = false;
          break;
        }
      }
    }
  }
}

export default SnakeGame;
