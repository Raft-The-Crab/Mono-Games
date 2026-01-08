import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Doodle Jump Clone
 */
class DoodleJumpGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'doodle-jump', 400, 600);
    
    this.player = {
      x: 200,
      y: 400,
      width: 60,
      height: 60,
      velocityY: 0,
      velocityX: 0,
      speed: 5,
      jumpPower: -12
    };
    
    this.platforms = [];
    this.gravity = 0.4;
    this.cameraY = 0;
    this.gameOver = false;
  }

  setup() {
    this.player.x = this.width / 2 - this.player.width / 2;
    this.player.y = this.height - 150;
    this.player.velocityY = 0;
    this.player.velocityX = 0;
    
    this.platforms = [];
    this.cameraY = 0;
    this.score = 0;
    this.gameOver = false;
    
    // Create initial platforms
    this.createInitialPlatforms();
    this.setupControls();
  }

  createInitialPlatforms() {
    // Ground platform
    this.platforms.push({
      x: 0,
      y: this.height - 30,
      width: this.width,
      height: 30,
      type: 'static'
    });
    
    // Generate platforms going up
    for (let i = 0; i < 15; i++) {
      this.addPlatform(this.height - 150 - i * 80);
    }
  }

  addPlatform(y) {
    const types = ['static', 'static', 'static', 'moving'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.platforms.push({
      x: Math.random() * (this.width - 80),
      y: y,
      width: 80,
      height: 15,
      type: type,
      direction: type === 'moving' ? (Math.random() > 0.5 ? 1 : -1) : 0,
      speed: 2
    });
  }

  setupControls() {
    this.addKeyHandler('arrowleft', () => { this.player.velocityX = -this.player.speed; });
    this.addKeyHandler('arrowright', () => { this.player.velocityX = this.player.speed; });
    this.addKeyHandler('a', () => { this.player.velocityX = -this.player.speed; });
    this.addKeyHandler('d', () => { this.player.velocityX = this.player.speed; });
    this.addKeyHandler('r', () => this.reset());
    
    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'arrowright' || key === 'a' || key === 'd') {
        this.player.velocityX = 0;
      }
    });
  }

  update(deltaTime) {
    if (this.gameOver) return;
    
    // Apply gravity
    this.player.velocityY += this.gravity;
    
    // Move player
    this.player.x += this.player.velocityX;
    this.player.y += this.player.velocityY;
    
    // Wrap around screen
    if (this.player.x < -this.player.width) {
      this.player.x = this.width;
    } else if (this.player.x > this.width) {
      this.player.x = -this.player.width;
    }
    
    // Platform collision (only when falling)
    if (this.player.velocityY > 0) {
      for (const platform of this.platforms) {
        if (this.player.x + this.player.width > platform.x &&
            this.player.x < platform.x + platform.width &&
            this.player.y + this.player.height > platform.y &&
            this.player.y + this.player.height < platform.y + platform.height + 10 &&
            this.player.velocityY > 0) {
          
          this.player.velocityY = this.player.jumpPower;
          break;
        }
      }
    }
    
    // Move camera when player is in upper half
    if (this.player.y < this.height / 2) {
      const diff = this.height / 2 - this.player.y;
      this.cameraY += diff;
      this.player.y = this.height / 2;
      
      // Move platforms down
      for (const platform of this.platforms) {
        platform.y += diff;
      }
      
      // Update score
      this.score = Math.floor(this.cameraY / 10);
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      
      // Remove platforms that are off screen and add new ones
      this.platforms = this.platforms.filter(p => p.y < this.height + 50);
      
      while (this.platforms.length < 15) {
        const highestY = Math.min(...this.platforms.map(p => p.y));
        this.addPlatform(highestY - 80);
      }
    }
    
    // Update moving platforms
    for (const platform of this.platforms) {
      if (platform.type === 'moving') {
        platform.x += platform.direction * platform.speed;
        
        if (platform.x < 0 || platform.x + platform.width > this.width) {
          platform.direction *= -1;
        }
      }
    }
    
    // Check if fell off screen
    if (this.player.y > this.height) {
      this.gameOver = true;
      this.endGame('Fell off! 🎈');
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
    
    // Platforms
    for (const platform of this.platforms) {
      if (platform.type === 'moving') {
        this.ctx.fillStyle = '#FF6B6B';
      } else {
        this.ctx.fillStyle = '#4ECDC4';
      }
      
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Platform shine
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height / 2);
    }
    
    // Player (doodle character)
    this.drawPlayer();
    
    // Score
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Score: ${this.score}`, this.width / 2, 30);
  }

  drawPlayer() {
    const ctx = this.ctx;
    const x = this.player.x + this.player.width / 2;
    const y = this.player.y + this.player.height / 2;
    
    // Body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 3, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    ctx.beginPath();
    ctx.arc(x, y + 5, 8, 0, Math.PI);
    ctx.stroke();
    
    // Nose
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Legs
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 15);
    ctx.lineTo(x - 10, y + 30);
    ctx.moveTo(x + 5, y + 15);
    ctx.lineTo(x + 10, y + 30);
    ctx.stroke();
  }
}

export default DoodleJumpGame;
