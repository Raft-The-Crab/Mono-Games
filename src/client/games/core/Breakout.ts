/**
 * Breakout/Arkanoid - Classic Brick Breaking Game
 * 
 * Features:
 * - Paddle control with mouse/touch
 * - Bouncing ball physics
 * - Multiple brick types with different durability
 * - Power-ups: multi-ball, wider paddle, laser, speed up/down
 * - Progressive difficulty (ball speed increases)
 * - Score multipliers for combos
 * - Lives system (3 lives)
 * - Level progression
 */

export interface BreakoutConfig {
  canvas: HTMLCanvasElement;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
  onLevelComplete?: (level: number) => void;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  maxHits: number;
  color: string;
  points: number;
}

interface PowerUp {
  x: number;
  y: number;
  dy: number;
  type: 'multi-ball' | 'wide-paddle' | 'laser' | 'slow-ball' | 'life';
  color: string;
  active: boolean;
}

export default class Breakout {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onScoreUpdate?: (score: number) => void;
  private onGameOver?: (finalScore: number) => void;
  private onLevelComplete?: (level: number) => void;

  private paddle: Paddle;
  private balls: Ball[];
  private bricks: Brick[];
  private powerUps: PowerUp[];
  
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private combo: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrame: number | null = null;

  private mouseX: number = 0;
  private touchX: number = 0;

  // Power-up effects
  private paddleWidthMultiplier: number = 1;
  private ballSpeedMultiplier: number = 1;
  private laserEnabled: boolean = false;
  private laserCooldown: number = 0;

  constructor(config: BreakoutConfig) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.onScoreUpdate = config.onScoreUpdate;
    this.onGameOver = config.onGameOver;
    this.onLevelComplete = config.onLevelComplete;

    // Initialize paddle
    this.paddle = {
      x: this.canvas.width / 2 - 50,
      y: this.canvas.height - 30,
      width: 100,
      height: 10,
      speed: 8
    };

    // Initialize ball
    this.balls = [{
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      dx: 3,
      dy: -3,
      radius: 6,
      speed: 3
    }];

    this.bricks = [];
    this.powerUps = [];

    this.setupEventListeners();
  }

  init(): void {
    console.log('[Breakout] Initializing...');
    this.setupLevel(this.level);
  }

  start(): void {
    console.log('[Breakout] Starting game...');
    this.isRunning = true;
    this.isPaused = false;
    this.gameLoop();
  }

  pause(): void {
    console.log('[Breakout] Pausing game...');
    this.isPaused = true;
  }

  resume(): void {
    console.log('[Breakout] Resuming game...');
    this.isPaused = false;
    if (this.isRunning && !this.animationFrame) {
      this.gameLoop();
    }
  }

  reset(): void {
    console.log('[Breakout] Resetting game...');
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.combo = 0;
    this.balls = [{
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      dx: 3,
      dy: -3,
      radius: 6,
      speed: 3
    }];
    this.powerUps = [];
    this.paddleWidthMultiplier = 1;
    this.ballSpeedMultiplier = 1;
    this.laserEnabled = false;
    this.setupLevel(1);
    this.updateScore();
  }

  destroy(): void {
    console.log('[Breakout] Destroying game...');
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('click', this.handleClick);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('click', this.handleClick);
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    this.touchX = e.touches[0].clientX - rect.left;
  }

  private handleClick(): void {
    if (this.laserEnabled && this.laserCooldown <= 0) {
      this.fireLaser();
      this.laserCooldown = 30; // Cooldown frames
    }
  }

  private setupLevel(level: number): void {
    this.bricks = [];
    const rows = Math.min(5 + level, 10);
    const cols = 10;
    const brickWidth = (this.canvas.width - 20) / cols;
    const brickHeight = 20;
    const padding = 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hits = Math.min(Math.floor(row / 2) + 1, 3);
        const brick: Brick = {
          x: col * brickWidth + 10,
          y: row * brickHeight + 50,
          width: brickWidth - padding,
          height: brickHeight - padding,
          hits: hits,
          maxHits: hits,
          color: this.getBrickColor(hits),
          points: hits * 10
        };
        this.bricks.push(brick);
      }
    }
  }

  private getBrickColor(hits: number): string {
    switch (hits) {
      case 1: return '#4ade80'; // Green
      case 2: return '#facc15'; // Yellow
      case 3: return '#f87171'; // Red
      default: return '#a78bfa'; // Purple
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning || this.isPaused) {
      this.animationFrame = null;
      return;
    }

    this.update();
    this.draw();

    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    // Update paddle position
    const targetX = this.mouseX || this.touchX || this.paddle.x;
    this.paddle.x += (targetX - this.paddle.x - this.paddle.width / 2) * 0.3;
    this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
    this.paddle.width = 100 * this.paddleWidthMultiplier;

    // Update balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      
      ball.x += ball.dx * this.ballSpeedMultiplier;
      ball.y += ball.dy * this.ballSpeedMultiplier;

      // Wall collisions
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
        ball.dx *= -1;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
      }

      // Paddle collision
      if (
        ball.y + ball.radius > this.paddle.y &&
        ball.y - ball.radius < this.paddle.y + this.paddle.height &&
        ball.x > this.paddle.x &&
        ball.x < this.paddle.x + this.paddle.width
      ) {
        ball.dy = -Math.abs(ball.dy);
        // Add spin based on where ball hits paddle
        const hitPos = (ball.x - this.paddle.x) / this.paddle.width;
        ball.dx = (hitPos - 0.5) * 6;
      }

      // Brick collisions
      for (let j = this.bricks.length - 1; j >= 0; j--) {
        const brick = this.bricks[j];
        if (this.checkCollision(ball, brick)) {
          ball.dy *= -1;
          brick.hits--;
          
          if (brick.hits <= 0) {
            this.score += brick.points * (1 + this.combo * 0.1);
            this.combo++;
            this.bricks.splice(j, 1);
            
            // 10% chance to spawn power-up
            if (Math.random() < 0.1) {
              this.spawnPowerUp(brick.x + brick.width / 2, brick.y);
            }
          } else {
            brick.color = this.getBrickColor(brick.hits);
          }
          
          this.updateScore();
        }
      }

      // Ball fell off screen
      if (ball.y - ball.radius > this.canvas.height) {
        this.balls.splice(i, 1);
        if (this.balls.length === 0) {
          this.lives--;
          this.combo = 0;
          if (this.lives > 0) {
            this.resetBall();
          } else {
            this.gameOver();
          }
        }
      }
    }

    // Update power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.y += powerUp.dy;

      // Check paddle collision
      if (
        powerUp.y + 10 > this.paddle.y &&
        powerUp.y < this.paddle.y + this.paddle.height &&
        powerUp.x + 10 > this.paddle.x &&
        powerUp.x < this.paddle.x + this.paddle.width
      ) {
        this.activatePowerUp(powerUp.type);
        this.powerUps.splice(i, 1);
      } else if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(i, 1);
      }
    }

    // Update laser cooldown
    if (this.laserCooldown > 0) {
      this.laserCooldown--;
    }

    // Check level complete
    if (this.bricks.length === 0) {
      this.levelComplete();
    }
  }

  private checkCollision(ball: Ball, brick: Brick): boolean {
    return (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    );
  }

  private spawnPowerUp(x: number, y: number): void {
    const types: PowerUp['type'][] = ['multi-ball', 'wide-paddle', 'laser', 'slow-ball', 'life'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = {
      'multi-ball': '#60a5fa',
      'wide-paddle': '#34d399',
      'laser': '#f59e0b',
      'slow-ball': '#a78bfa',
      'life': '#f87171'
    };

    this.powerUps.push({
      x,
      y,
      dy: 2,
      type,
      color: colors[type],
      active: true
    });
  }

  private activatePowerUp(type: PowerUp['type']): void {
    switch (type) {
      case 'multi-ball':
        const currentBall = this.balls[0];
        if (currentBall) {
          this.balls.push({
            ...currentBall,
            dx: currentBall.dx * 1.2,
            dy: currentBall.dy * 1.2
          });
          this.balls.push({
            ...currentBall,
            dx: currentBall.dx * 0.8,
            dy: currentBall.dy * 0.8
          });
        }
        break;
      case 'wide-paddle':
        this.paddleWidthMultiplier = 1.5;
        setTimeout(() => { this.paddleWidthMultiplier = 1; }, 10000);
        break;
      case 'laser':
        this.laserEnabled = true;
        setTimeout(() => { this.laserEnabled = false; }, 15000);
        break;
      case 'slow-ball':
        this.ballSpeedMultiplier = 0.7;
        setTimeout(() => { this.ballSpeedMultiplier = 1; }, 8000);
        break;
      case 'life':
        this.lives++;
        break;
    }
  }

  private fireLaser(): void {
    const laserX = this.paddle.x + this.paddle.width / 2;
    // Check brick hits
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      if (laserX > brick.x && laserX < brick.x + brick.width) {
        brick.hits--;
        if (brick.hits <= 0) {
          this.score += brick.points;
          this.bricks.splice(i, 1);
        } else {
          brick.color = this.getBrickColor(brick.hits);
        }
        break; // Only hit first brick
      }
    }
    this.updateScore();
  }

  private resetBall(): void {
    this.balls = [{
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      dx: 3,
      dy: -3,
      radius: 6,
      speed: 3
    }];
  }

  private levelComplete(): void {
    this.level++;
    this.combo = 0;
    this.score += 500 * this.level;
    this.setupLevel(this.level);
    this.resetBall();
    this.ballSpeedMultiplier = Math.min(1 + this.level * 0.1, 2);
    this.updateScore();
    
    if (this.onLevelComplete) {
      this.onLevelComplete(this.level);
    }
  }

  private gameOver(): void {
    this.isRunning = false;
    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }

  private updateScore(): void {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw bricks
    this.bricks.forEach(brick => {
      this.ctx.fillStyle = brick.color;
      this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      
      // Draw brick border
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      
      // Draw hits indicator
      if (brick.hits > 1) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(brick.hits.toString(), brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
      }
    });

    // Draw paddle
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    
    // Draw paddle glow
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#60a5fa';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    this.ctx.shadowBlur = 0;

    // Draw balls
    this.balls.forEach(ball => {
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fill();
      this.ctx.closePath();
      
      // Ball glow
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw power-ups
    this.powerUps.forEach(powerUp => {
      this.ctx.fillStyle = powerUp.color;
      this.ctx.fillRect(powerUp.x, powerUp.y, 15, 15);
      this.ctx.strokeStyle = '#fff';
      this.ctx.strokeRect(powerUp.x, powerUp.y, 15, 15);
    });

    // Draw laser indicator
    if (this.laserEnabled && this.laserCooldown === 0) {
      const laserX = this.paddle.x + this.paddle.width / 2;
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(laserX, this.paddle.y);
      this.ctx.lineTo(laserX, 0);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Draw UI
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 10, 25);
    this.ctx.fillText(`Lives: ${'❤️'.repeat(this.lives)}`, 10, 45);
    this.ctx.fillText(`Level: ${this.level}`, this.canvas.width - 100, 25);
    
    if (this.combo > 0) {
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillText(`Combo: x${this.combo}`, this.canvas.width - 120, 45);
    }

    // Draw paused indicator
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  getScore(): number {
    return this.score;
  }

  getLevel(): number {
    return this.level;
  }

  getLives(): number {
    return this.lives;
  }
}
