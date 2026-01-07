import BaseGame from '../BaseGame';
import audioManager, { Sounds } from '../../../utils/audioManager';

export default class Breakout extends BaseGame {
  constructor() {
    super('breakout', 'Breakout');
    
    // Paddle
    this.paddle = {
      x: 0,
      y: 0,
      width: 100,
      height: 15,
      speed: 8,
      moveLeft: false,
      moveRight: false
    };
    
    // Ball
    this.ball = {
      x: 0,
      y: 0,
      radius: 8,
      dx: 4,
      dy: -4,
      speed: 4,
      stuck: true
    };
    
    // Bricks
    this.bricks = [];
    this.brickRows = 6;
    this.brickCols = 10;
    this.brickWidth = 70;
    this.brickHeight = 25;
    this.brickPadding = 5;
    this.brickOffsetTop = 60;
    this.brickOffsetLeft = 35;
    
    // Power-ups
    this.powerUps = [];
    this.activePowerUps = {
      widerPaddle: 0,
      multiball: 0,
      fireball: 0,
      slowBall: 0
    };
    
    // Particles
    this.particles = [];
    
    // Game state
    this.lives = 3;
    this.level = 1;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    
    // Controls
    this.keys = {};
    this.touchStartX = 0;
  }
  
  init(canvas) {
    super.init(canvas);
    
    // Initialize paddle position
    this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
    this.paddle.y = this.canvas.height - 40;
    
    // Initialize ball position
    this.resetBall();
    
    // Create bricks
    this.createBricks();
    
    // Event listeners
    this.setupControls();
    
    // Play start sound
    audioManager.playSound(Sounds.start);
    
    this.isPaused = false;
  }
  
  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' && this.ball.stuck) {
        this.launchBall();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    // Touch/Mouse controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchStartX = e.touches[0].clientX;
      if (this.ball.stuck) {
        this.launchBall();
      }
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
    });
    
    this.canvas.addEventListener('click', () => {
      if (this.ball.stuck) {
        this.launchBall();
      }
    });
  }
  
  createBricks() {
    this.bricks = [];
    const colors = ['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#A855F7'];
    const points = [60, 50, 40, 30, 20, 10];
    
    for (let row = 0; row < this.brickRows; row++) {
      for (let col = 0; col < this.brickCols; col++) {
        const x = col * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
        const y = row * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
        
        this.bricks.push({
          x,
          y,
          width: this.brickWidth,
          height: this.brickHeight,
          color: colors[row],
          points: points[row],
          hits: row >= 4 ? 2 : 1, // Bottom two rows need 2 hits
          maxHits: row >= 4 ? 2 : 1,
          powerUp: Math.random() < 0.1 ? this.getRandomPowerUp() : null
        });
      }
    }
  }
  
  getRandomPowerUp() {
    const powerUps = ['wider', 'multiball', 'fireball', 'slowball', 'life'];
    return powerUps[Math.floor(Math.random() * powerUps.length)];
  }
  
  resetBall() {
    this.ball.x = this.paddle.x + this.paddle.width / 2;
    this.ball.y = this.paddle.y - this.ball.radius - 5;
    this.ball.dx = (Math.random() - 0.5) * 6;
    this.ball.dy = -4;
    this.ball.stuck = true;
  }
  
  launchBall() {
    this.ball.stuck = false;
    audioManager.playSound(Sounds.start);
  }
  
  update() {
    if (this.isPaused || this.isGameOver) return;
    
    // Update paddle position with keyboard
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.paddle.x -= this.paddle.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.paddle.x += this.paddle.speed;
    }
    
    // Keep paddle in bounds
    this.paddle.x = Math.max(0, Math.min(this.paddle.x, this.canvas.width - this.paddle.width));
    
    // Update ball if not stuck
    if (!this.ball.stuck) {
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;
      
      // Wall collision
      if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
        this.ball.dx *= -1;
        audioManager.playSound(Sounds.hit);
      }
      
      // Top wall collision
      if (this.ball.y - this.ball.radius <= 0) {
        this.ball.dy *= -1;
        audioManager.playSound(Sounds.hit);
      }
      
      // Paddle collision
      if (this.checkPaddleCollision()) {
        this.ball.dy = -Math.abs(this.ball.dy);
        // Angle based on hit position
        const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
        this.ball.dx = (hitPos - 0.5) * 8;
        audioManager.playSound(Sounds.collect);
      }
      
      // Brick collision
      this.checkBrickCollision();
      
      // Bottom boundary (lose life)
      if (this.ball.y - this.ball.radius > this.canvas.height) {
        this.loseLife();
      }
    } else {
      // Ball follows paddle when stuck
      this.ball.x = this.paddle.x + this.paddle.width / 2;
      this.ball.y = this.paddle.y - this.ball.radius - 5;
    }
    
    // Update power-ups
    this.updatePowerUps();
    
    // Update particles
    this.updateParticles();
    
    // Decrease active power-up timers
    Object.keys(this.activePowerUps).forEach(key => {
      if (this.activePowerUps[key] > 0) {
        this.activePowerUps[key]--;
        if (this.activePowerUps[key] === 0) {
          this.deactivatePowerUp(key);
        }
      }
    });
    
    // Check level complete
    if (this.bricks.length === 0) {
      this.levelComplete();
    }
  }
  
  checkPaddleCollision() {
    return this.ball.y + this.ball.radius >= this.paddle.y &&
           this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
           this.ball.x >= this.paddle.x &&
           this.ball.x <= this.paddle.x + this.paddle.width;
  }
  
  checkBrickCollision() {
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      
      if (this.ball.x + this.ball.radius > brick.x &&
          this.ball.x - this.ball.radius < brick.x + brick.width &&
          this.ball.y + this.ball.radius > brick.y &&
          this.ball.y - this.ball.radius < brick.y + brick.height) {
        
        // Determine collision side
        const ballCenterX = this.ball.x;
        const ballCenterY = this.ball.y;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;
        
        if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
          this.ball.dx *= -1;
        } else {
          this.ball.dy *= -1;
        }
        
        // Damage brick
        brick.hits--;
        
        if (brick.hits <= 0) {
          // Brick destroyed
          this.score += brick.points * (1 + this.combo * 0.1);
          this.combo++;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          
          // Create particles
          this.createBrickParticles(brick);
          
          // Drop power-up
          if (brick.powerUp) {
            this.dropPowerUp(brick);
          }
          
          // Remove brick
          this.bricks.splice(i, 1);
          
          audioManager.playSound(Sounds.explosion);
        } else {
          // Brick damaged
          brick.color = this.shadeColor(brick.color, -20);
          audioManager.playSound(Sounds.hit);
          this.combo = 0;
        }
        
        break;
      }
    }
  }
  
  createBrickParticles(brick) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        maxLife: 30,
        color: brick.color,
        size: Math.random() * 4 + 2
      });
    }
  }
  
  dropPowerUp(brick) {
    this.powerUps.push({
      x: brick.x + brick.width / 2,
      y: brick.y + brick.height / 2,
      width: 30,
      height: 30,
      type: brick.powerUp,
      dy: 2
    });
  }
  
  updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.y += powerUp.dy;
      
      // Check paddle collision
      if (powerUp.y + powerUp.height >= this.paddle.y &&
          powerUp.y <= this.paddle.y + this.paddle.height &&
          powerUp.x + powerUp.width >= this.paddle.x &&
          powerUp.x <= this.paddle.x + this.paddle.width) {
        this.activatePowerUp(powerUp.type);
        this.powerUps.splice(i, 1);
        audioManager.playSound(Sounds.powerUp);
      }
      
      // Remove if off screen
      if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  activatePowerUp(type) {
    switch (type) {
      case 'wider':
        this.paddle.width = 150;
        this.activePowerUps.widerPaddle = 600; // 10 seconds
        break;
      case 'multiball':
        // TODO: Implement multiball
        break;
      case 'fireball':
        this.activePowerUps.fireball = 600;
        break;
      case 'slowball':
        this.ball.dx *= 0.5;
        this.ball.dy *= 0.5;
        this.activePowerUps.slowBall = 300;
        break;
      case 'life':
        this.lives++;
        audioManager.playSound(Sounds.win);
        break;
    }
  }
  
  deactivatePowerUp(type) {
    switch (type) {
      case 'widerPaddle':
        this.paddle.width = 100;
        break;
      case 'slowBall':
        this.ball.dx *= 2;
        this.ball.dy *= 2;
        break;
    }
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.life--;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  loseLife() {
    this.lives--;
    this.combo = 0;
    audioManager.playSound(Sounds.hit);
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.resetBall();
    }
  }
  
  levelComplete() {
    this.level++;
    this.lives++;
    this.createBricks();
    this.resetBall();
    this.ball.speed += 0.5;
    audioManager.playSound(Sounds.win);
  }
  
  gameOver() {
    this.isGameOver = true;
    audioManager.playSound(Sounds.lose);
    
    // Save high score
    const savedScore = localStorage.getItem('breakout_highscore') || 0;
    if (this.score > savedScore) {
      localStorage.setItem('breakout_highscore', this.score);
    }
  }
  
  render() {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw bricks
    this.bricks.forEach(brick => {
      this.ctx.fillStyle = brick.color;
      this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      this.ctx.strokeStyle = '#2a2a3e';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      
      // Draw hit indicator
      if (brick.hits < brick.maxHits) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
    
    // Draw paddle
    const gradient = this.ctx.createLinearGradient(this.paddle.x, 0, this.paddle.x + this.paddle.width, 0);
    gradient.addColorStop(0, '#41EAD4');
    gradient.addColorStop(1, '#6BCB77');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    
    // Draw ball
    this.ctx.fillStyle = this.activePowerUps.fireball > 0 ? '#FF6B35' : '#FFF8DC';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw power-ups
    this.powerUps.forEach(powerUp => {
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      this.ctx.strokeStyle = '#2C3E50';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      
      // Draw icon
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.getPowerUpIcon(powerUp.type), powerUp.x + 15, powerUp.y + 15);
    });
    
    // Draw particles
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;
    
    // Draw UI
    this.drawUI();
  }
  
  drawUI() {
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 18px "Comic Sans MS"';
    this.ctx.textAlign = 'left';
    
    // Score
    this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 10, 30);
    
    // Lives
    this.ctx.fillText(`Lives: ${'❤️'.repeat(this.lives)}`, 10, 55);
    
    // Level
    this.ctx.fillText(`Level: ${this.level}`, this.canvas.width - 100, 30);
    
    // Combo
    if (this.combo > 1) {
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.font = 'bold 24px "Comic Sans MS"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`COMBO x${this.combo}!`, this.canvas.width / 2, 30);
    }
    
    // Instructions
    if (this.ball.stuck) {
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '16px "Comic Sans MS"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Click or press SPACE to launch!', this.canvas.width / 2, this.canvas.height - 20);
    }
    
    // Game Over
    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FF6B35';
      this.ctx.font = 'bold 48px "Comic Sans MS"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 60);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '24px "Comic Sans MS"';
      this.ctx.fillText(`Final Score: ${Math.floor(this.score)}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
      this.ctx.fillText(`Max Combo: ${this.maxCombo}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
      this.ctx.fillText(`Level Reached: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 70);
    }
  }
  
  getPowerUpColor(type) {
    const colors = {
      wider: '#41EAD4',
      multiball: '#FF6B6B',
      fireball: '#FF6B35',
      slowball: '#A855F7',
      life: '#6BCB77'
    };
    return colors[type] || '#FFF';
  }
  
  getPowerUpIcon(type) {
    const icons = {
      wider: '↔️',
      multiball: '⚫',
      fireball: '🔥',
      slowball: '🐌',
      life: '❤️'
    };
    return icons[type] || '?';
  }
  
  shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
  
  cleanup() {
    super.cleanup();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
