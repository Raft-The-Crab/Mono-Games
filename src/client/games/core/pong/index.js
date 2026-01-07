import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';

export default class Pong extends BaseGame {
  constructor(containerId, aiLevel = 3) {
    super(containerId, 'pong', 800, 600);

    // AI System
    this.ai = getAI(aiLevel);
    this.aiLevel = aiLevel;

    // Paddles
    this.paddleWidth = 15;
    this.paddleHeight = 100;
    this.paddleSpeed = 6;

    this.leftPaddle = {
      x: 20,
      y: this.canvas.height / 2 - this.paddleHeight / 2,
      score: 0
    };

    this.rightPaddle = {
      x: this.canvas.width - 20 - this.paddleWidth,
      y: this.canvas.height / 2 - this.paddleHeight / 2,
      score: 0
    };

    // Ball
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 10,
      speedX: 5,
      speedY: 5
    };

    // Keys pressed
    this.keys = {};

    // Calculate AI speed based on level
    this.updateAISpeed();
  }

  updateAISpeed() {
    const config = this.ai.getConfig();
    // AI speed scales with level
    this.aiSpeed = 2 + (this.aiLevel * 0.8);
  }

  setAILevel(level) {
    this.aiLevel = Math.max(1, Math.min(5, level));
    this.ai.setLevel(this.aiLevel);
    this.updateAISpeed();
  }

  setup() {
    this.setupControls();
    this.resetBall();
  }

  setupControls() {
    // Player controls (left paddle)
    this.addKeyHandler('w', () => { this.keys.w = true; });
    this.addKeyHandler('s', () => { this.keys.s = true; });
    this.addKeyHandler('ArrowUp', () => { this.keys.w = true; });
    this.addKeyHandler('ArrowDown', () => { this.keys.s = true; });

    // Key up handlers
    window.addEventListener('keyup', (e) => {
      if (e.key === 'w' || e.key === 'ArrowUp') this.keys.w = false;
      if (e.key === 's' || e.key === 'ArrowDown') this.keys.s = false;
    });
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;

    const angle = (Math.random() - 0.5) * Math.PI / 3;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const speed = 5;

    this.ball.speedX = Math.cos(angle) * speed * direction;
    this.ball.speedY = Math.sin(angle) * speed;
  }

  update(deltaTime) {
    if (!this.isPlaying) return;

    // Player paddle movement
    if (this.keys.w && this.leftPaddle.y > 0) {
      this.leftPaddle.y -= this.paddleSpeed;
    }
    if (this.keys.s && this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
      this.leftPaddle.y += this.paddleSpeed;
    }

    // AI paddle movement using AI system
    const currentTime = Date.now();
    if (this.ai.canAct(currentTime)) {
      const movement = this.ai.calculatePaddleMove(
        this.ball.y,
        this.rightPaddle.y,
        this.paddleHeight,
        this.aiSpeed
      );
      this.rightPaddle.y += movement;
    }

    // Keep AI paddle in bounds
    this.rightPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.rightPaddle.y));

    // Ball movement
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;

    // Top/bottom collision
    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
      this.ball.speedY *= -1;
    }

    // Left paddle collision
    if (
      this.ball.x - this.ball.radius <= this.leftPaddle.x + this.paddleWidth &&
      this.ball.y >= this.leftPaddle.y &&
      this.ball.y <= this.leftPaddle.y + this.paddleHeight
    ) {
      this.ball.speedX = Math.abs(this.ball.speedX);
      this.ball.speedX *= 1.05;
      this.score += 10;
    }

    // Right paddle collision
    if (
      this.ball.x + this.ball.radius >= this.rightPaddle.x &&
      this.ball.y >= this.rightPaddle.y &&
      this.ball.y <= this.rightPaddle.y + this.paddleHeight
    ) {
      this.ball.speedX = -Math.abs(this.ball.speedX);
      this.ball.speedX *= 1.05;
      this.rightPaddle.score++;
    }

    // Score (ball out of bounds)
    if (this.ball.x < 0) {
      this.rightPaddle.score++;
      this.resetBall();
      if (this.rightPaddle.score >= 10) {
        this.endGame('AI Wins! Your score: ' + this.score);
      }
    } else if (this.ball.x > this.canvas.width) {
      this.leftPaddle.score++;
      this.score += 100;
      this.resetBall();
      if (this.leftPaddle.score >= 10) {
        this.endGame('You Win! Score: ' + this.score);
      }
    }
  }

  render() {
    this.clearCanvas();

    // Background with cartoony gradient
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGradient.addColorStop(0, '#FFF8DC');
    bgGradient.addColorStop(1, '#FFE5B4');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Center line
    this.ctx.strokeStyle = '#FFB347';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([20, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Left paddle (player) - with rounded corners
    this.drawRoundedRect(
      this.leftPaddle.x,
      this.leftPaddle.y,
      this.paddleWidth,
      this.paddleHeight,
      8,
      '#FF6B35'
    );

    // Right paddle (AI) - with rounded corners
    this.drawRoundedRect(
      this.rightPaddle.x,
      this.rightPaddle.y,
      this.paddleWidth,
      this.paddleHeight,
      8,
      '#4ECDC4'
    );

    // Ball with glow
    this.ctx.fillStyle = '#F7931E';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Ball border
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Ball glow
    const gradient = this.ctx.createRadialGradient(
      this.ball.x, this.ball.y, this.ball.radius / 2,
      this.ball.x, this.ball.y, this.ball.radius * 2
    );
    gradient.addColorStop(0, 'rgba(247, 147, 30, 0.5)');
    gradient.addColorStop(1, 'rgba(247, 147, 30, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Scores
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 56px "Comic Sans MS", cursive';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.leftPaddle.score, this.canvas.width / 4, 70);
    this.ctx.fillText(this.rightPaddle.score, (this.canvas.width * 3) / 4, 70);

    // Labels
    this.ctx.font = 'bold 18px "Comic Sans MS", cursive';
    this.ctx.fillText('YOU', this.canvas.width / 4, 95);

    // AI level indicator
    const aiLevelName = AI_LEVELS[this.aiLevel].name;
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.fillText(`AI (${aiLevelName})`, (this.canvas.width * 3) / 4, 95);

    // Total score
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 20px "Comic Sans MS", cursive';
    this.ctx.fillText(`Score: ${this.score}`, 20, this.canvas.height - 20);

    // Controls hint
    this.ctx.textAlign = 'right';
    this.ctx.font = '14px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#90A4AE';
    this.ctx.fillText('W/S or ↑/↓ to move', this.canvas.width - 20, this.canvas.height - 20);
  }

  drawRoundedRect(x, y, width, height, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();

    // Border
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }
}
