import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Flappy Bird Clone - Simple and Fun
 */
class FlappyBirdGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'flappy-bird', 400, 600);
    
    this.bird = {
      x: 80,
      y: 300,
      velocity: 0,
      radius: 15,
      gravity: 0.5,
      jumpStrength: -9
    };
    
    this.pipes = [];
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeSpeed = 3;
    this.spawnTimer = 0;
    this.spawnInterval = 90;
    
    this.gameStarted = false;
  }

  setup() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameStarted = false;
    this.spawnTimer = 0;
    
    this.setupControls();
  }

  setupControls() {
    this.addKeyHandler(' ', () => this.jump());
    this.addKeyHandler('arrowup', () => this.jump());
    this.addKeyHandler('w', () => this.jump());
    this.addKeyHandler('r', () => this.reset());
    
    // Mouse/touch support
    this.canvas.addEventListener('click', () => {
      if (this.isRunning && !this.isPaused) {
        this.jump();
      }
    });
  }

  jump() {
    if (!this.gameStarted) {
      this.gameStarted = true;
    }
    this.bird.velocity = this.bird.jumpStrength;
  }

  update(deltaTime) {
    if (!this.gameStarted) return;
    
    // Update bird
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;
    
    // Check ground/ceiling collision
    if (this.bird.y + this.bird.radius > this.height || this.bird.y - this.bird.radius < 0) {
      this.endGame('Game Over! 🐦');
      return;
    }
    
    // Spawn pipes
    this.spawnTimer++;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0;
      const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: this.width,
        gapY: gapY,
        scored: false
      });
    }
    
    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;
      
      // Remove off-screen pipes
      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
        continue;
      }
      
      // Score point
      if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.scored = true;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          this.saveHighScore();
        }
      }
      
      // Check collision
      if (this.bird.x + this.bird.radius > pipe.x && 
          this.bird.x - this.bird.radius < pipe.x + this.pipeWidth) {
        if (this.bird.y - this.bird.radius < pipe.gapY || 
            this.bird.y + this.bird.radius > pipe.gapY + this.pipeGap) {
          this.endGame('Game Over! Hit pipe! 💥');
          return;
        }
      }
    }
  }

  render() {
    this.clearCanvas();
    
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Clouds
    this.drawClouds();
    
    // Pipes
    for (const pipe of this.pipes) {
      this.drawPipe(pipe);
    }
    
    // Bird
    this.drawBird();
    
    // Ground
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.height - 50, this.width, 50);
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, this.height - 55, this.width, 5);
    
    // Score
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    this.ctx.textAlign = 'center';
    this.ctx.strokeText(this.score.toString(), this.width / 2, 50);
    this.ctx.fillText(this.score.toString(), this.width / 2, 50);
    
    // Start message
    if (!this.gameStarted) {
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(this.width / 2 - 100, this.height / 2 + 50, 200, 40);
      this.ctx.fillStyle = 'white';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Click or Space to Start', this.width / 2, this.height / 2 + 75);
    }
  }

  drawBird() {
    const ctx = this.ctx;
    
    // Bird body (yellow circle)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(this.bird.x - 5, this.bird.y + 5, 8, 6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.bird.x + 5, this.bird.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.bird.x + 6, this.bird.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(this.bird.x + 12, this.bird.y);
    ctx.lineTo(this.bird.x + 18, this.bird.y - 2);
    ctx.lineTo(this.bird.x + 18, this.bird.y + 2);
    ctx.closePath();
    ctx.fill();
  }

  drawPipe(pipe) {
    const ctx = this.ctx;
    
    // Top pipe
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
    ctx.fillStyle = '#01FF70';
    ctx.fillRect(pipe.x + 5, 0, this.pipeWidth - 10, pipe.gapY);
    
    // Top pipe cap
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(pipe.x - 5, pipe.gapY - 20, this.pipeWidth + 10, 20);
    
    // Bottom pipe
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.height);
    ctx.fillStyle = '#01FF70';
    ctx.fillRect(pipe.x + 5, pipe.gapY + this.pipeGap, this.pipeWidth - 10, this.height);
    
    // Bottom pipe cap
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(pipe.x - 5, pipe.gapY + this.pipeGap, this.pipeWidth + 10, 20);
  }

  drawClouds() {
    const offset = (Date.now() / 50) % this.width;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    for (let i = -1; i < 3; i++) {
      const x = i * 200 - offset;
      this.drawCloud(x, 100);
      this.drawCloud(x + 100, 180);
    }
  }

  drawCloud(x, y) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default FlappyBirdGame;
