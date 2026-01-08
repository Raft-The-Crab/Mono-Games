import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Enhanced Brick Breaker with Power-ups
 */
class BrickBreakerGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'brick-breaker', 600, 700);
    
    this.paddle = {
      x: 0,
      y: 0,
      width: 100,
      height: 15,
      speed: 8
    };
    
    this.ball = {
      x: 0,
      y: 0,
      radius: 8,
      dx: 0,
      dy: 0,
      speed: 5
    };
    
    this.bricks = [];
    this.powerUps = [];
    this.lives = 3;
    this.level = 1;
    
    this.keys = {};
  }

  setup() {
    this.paddle.x = this.width / 2 - this.paddle.width / 2;
    this.paddle.y = this.height - 50;
    
    this.resetBall();
    this.createBricks();
    
    this.lives = 3;
    this.score = 0;
    this.powerUps = [];
    
    this.setupControls();
  }

  setupControls() {
    this.addKeyHandler('arrowleft', () => { this.keys.left = true; });
    this.addKeyHandler('arrowright', () => { this.keys.right = true; });
    this.addKeyHandler('a', () => { this.keys.left = true; });
    this.addKeyHandler('d', () => { this.keys.right = true; });
    this.addKeyHandler(' ', () => {
      if (this.ball.dy === 0) {
        this.launchBall();
      }
    });
    this.addKeyHandler('r', () => this.reset());
    
    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') this.keys.left = false;
      if (key === 'arrowright' || key === 'd') this.keys.right = false;
    });
  }

  createBricks() {
    this.bricks = [];
    const rows = 5 + this.level;
    const cols = 8;
    const brickWidth = (this.width - 40) / cols;
    const brickHeight = 25;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.bricks.push({
          x: col * brickWidth + 20,
          y: row * brickHeight + 60,
          width: brickWidth - 4,
          height: brickHeight - 4,
          color: colors[row % colors.length],
          hits: row < 2 ? 2 : 1,
          maxHits: row < 2 ? 2 : 1
        });
      }
    }
  }

  resetBall() {
    this.ball.x = this.paddle.x + this.paddle.width / 2;
    this.ball.y = this.paddle.y - this.ball.radius - 2;
    this.ball.dx = 0;
    this.ball.dy = 0;
  }

  launchBall() {
    const angle = (Math.random() * 60 - 30) * Math.PI / 180;
    this.ball.dx = this.ball.speed * Math.sin(angle);
    this.ball.dy = -this.ball.speed * Math.cos(angle);
  }

  update(deltaTime) {
    // Move paddle
    if (this.keys.left) {
      this.paddle.x -= this.paddle.speed;
    }
    if (this.keys.right) {
      this.paddle.x += this.paddle.speed;
    }
    
    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
    
    // Ball follows paddle if not launched
    if (this.ball.dy === 0) {
      this.ball.x = this.paddle.x + this.paddle.width / 2;
      this.ball.y = this.paddle.y - this.ball.radius - 2;
      return;
    }
    
    // Move ball
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Wall collisions
    if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.width) {
      this.ball.dx *= -1;
      this.ball.x = Math.max(this.ball.radius, Math.min(this.width - this.ball.radius, this.ball.x));
    }
    
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.dy *= -1;
      this.ball.y = this.ball.radius;
    }
    
    // Paddle collision
    if (this.ball.y + this.ball.radius > this.paddle.y &&
        this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
        this.ball.x > this.paddle.x &&
        this.ball.x < this.paddle.x + this.paddle.width) {
      
      this.ball.dy = -Math.abs(this.ball.dy);
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width - 0.5;
      this.ball.dx = hitPos * this.ball.speed * 2;
    }
    
    // Brick collisions
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      
      if (this.ball.x + this.ball.radius > brick.x &&
          this.ball.x - this.ball.radius < brick.x + brick.width &&
          this.ball.y + this.ball.radius > brick.y &&
          this.ball.y - this.ball.radius < brick.y + brick.height) {
        
        brick.hits--;
        
        if (brick.hits <= 0) {
          this.bricks.splice(i, 1);
          this.score += 10;
          
          if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
          }
          
          // Check level complete
          if (this.bricks.length === 0) {
            this.level++;
            this.resetBall();
            this.createBricks();
          }
        }
        
        this.ball.dy *= -1;
        break;
      }
    }
    
    // Ball out of bounds
    if (this.ball.y - this.ball.radius > this.height) {
      this.lives--;
      
      if (this.lives <= 0) {
        this.endGame('Game Over! 🎮');
      } else {
        this.resetBall();
      }
    }
  }

  render() {
    this.clearCanvas();
    
    // Background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Bricks
    for (const brick of this.bricks) {
      this.ctx.fillStyle = brick.color;
      this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      
      if (brick.hits > 1) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    }
    
    // Paddle
    const paddleGradient = this.ctx.createLinearGradient(0, this.paddle.y, 0, this.paddle.y + this.paddle.height);
    paddleGradient.addColorStop(0, '#00D9FF');
    paddleGradient.addColorStop(1, '#0099CC');
    this.ctx.fillStyle = paddleGradient;
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    
    // Ball
    const ballGradient = this.ctx.createRadialGradient(this.ball.x, this.ball.y, 0, this.ball.x, this.ball.y, this.ball.radius);
    ballGradient.addColorStop(0, '#FFFFFF');
    ballGradient.addColorStop(1, '#FFD700');
    this.ctx.fillStyle = ballGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // HUD
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#00D9FF';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    this.ctx.fillText(`Level: ${this.level}`, 20, 55);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Lives: ${'❤️'.repeat(this.lives)}`, this.width - 20, 30);
    
    // Instructions
    if (this.ball.dy === 0) {
      this.ctx.font = '18px Arial';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Press SPACE to launch', this.width / 2, this.height - 15);
    }
  }
}

export default BrickBreakerGame;
