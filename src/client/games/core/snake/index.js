import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Classic Snake Game - Retro Style
 */
class SnakeGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'snake', 600, 600);

    this.gridSize = 20;
    this.tileCount = 30;
    this.fps = 10;

    this.snake = [];
    this.apple = { x: 0, y: 0 };
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
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
      this.endGame('Game Over! Hit the wall 💥');
      return;
    }

    // Check self collision
    for (const segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.endGame('Game Over! Ate yourself 🐍');
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
      this.spawnApple();
      // Snake grows - don't remove tail
    } else {
      this.snake.pop();
    }
  }

  render() {
    this.clearCanvas();

    // Background - retro grid
    const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    bgGradient.addColorStop(0, '#1E3A5F');
    bgGradient.addColorStop(1, '#16213E');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.1)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Draw snake
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const isHead = i === 0;

      // Body color gradient based on position
      const hue = 160 + (i / this.snake.length) * 40;
      this.ctx.fillStyle = isHead ? '#4ECDC4' : `hsl(${hue}, 70%, 50%)`;

      // Rounded rectangle for segments
      const x = segment.x * this.gridSize + 2;
      const y = segment.y * this.gridSize + 2;
      const size = this.gridSize - 4;
      const radius = isHead ? 8 : 4;

      this.ctx.beginPath();
      this.ctx.roundRect(x, y, size, size, radius);
      this.ctx.fill();

      // Head highlight
      if (isHead) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 3, y + size / 3, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#FFFFFF';
        const eyeOffsetX = this.direction.x * 3;
        const eyeOffsetY = this.direction.y * 3;
        this.ctx.beginPath();
        this.ctx.arc(x + size / 3 + eyeOffsetX, y + size / 3 + eyeOffsetY, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 2 * size / 3 + eyeOffsetX, y + size / 3 + eyeOffsetY, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils
        this.ctx.fillStyle = '#1E3A5F';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 3 + eyeOffsetX + this.direction.x, y + size / 3 + eyeOffsetY + this.direction.y, 1.5, 0, Math.PI * 2);
        this.ctx.arc(x + 2 * size / 3 + eyeOffsetX + this.direction.x, y + size / 3 + eyeOffsetY + this.direction.y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Draw apple
    const appleX = this.apple.x * this.gridSize + this.gridSize / 2;
    const appleY = this.apple.y * this.gridSize + this.gridSize / 2;

    // Apple glow
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#E63946';

    // Apple body
    this.ctx.fillStyle = '#E63946';
    this.ctx.beginPath();
    this.ctx.arc(appleX, appleY, this.gridSize / 2 - 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    // Apple highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(appleX - 3, appleY - 3, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Apple stem
    this.ctx.strokeStyle = '#2D6A4F';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(appleX, appleY - this.gridSize / 2 + 3);
    this.ctx.lineTo(appleX + 2, appleY - this.gridSize / 2 - 3);
    this.ctx.stroke();

    // UI
    this.ctx.font = 'bold 20px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🐍 Score: ${this.score}`, 15, 30);

    this.ctx.fillStyle = '#FFD93D';
    this.ctx.fillText(`🏆 Best: ${this.highScore}`, 15, 55);

    // Paused overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.font = 'bold 48px "Comic Sans MS", cursive';
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.font = '20px "Comic Sans MS", cursive';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
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
