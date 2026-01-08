/**
 * Flappy Bird Clone
 * Simple tap-to-flap arcade game
 * No external dependencies - pure canvas
 */

import type { Game } from '../shared/types';

interface Pipe {
  x: number;
  y: number;
  gap: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export class FlappyGame implements Game {
  name = 'Flappy Bird';
  description = 'Tap to flap and avoid pipes!';
  category = 'arcade' as const;
  difficulty = 'easy' as const;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private isPaused = false;
  private isGameOver = false;

  private bird = {
    x: 80,
    y: 250,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jump: -9,
    rotation: 0
  };

  private pipes: Pipe[] = [];
  private pipeGap = 150;
  private pipeWidth = 60;
  private pipeSpeed = 2;
  private pipeSpawnTimer = 0;
  private pipeSpawnInterval = 90;

  private score = 0;
  private highScore = 0;
  private particles: Particle[] = [];

  private background = {
    x1: 0,
    x2: 800,
    speed: 1
  };

  init(container: HTMLElement): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.border = '3px solid #333';
    this.canvas.style.borderRadius = '12px';
    this.canvas.style.background = 'linear-gradient(to bottom, #4EC0CA 0%, #87CEEB 70%, #E0F6F7 100%)';
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Load high score
    this.highScore = parseInt(localStorage.getItem('flappy_highscore') || '0');

    // Controls
    this.canvas.addEventListener('click', () => this.flap());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isGameOver) {
        e.preventDefault();
        this.flap();
      }
      if (e.code === 'KeyR' && this.isGameOver) {
        this.reset();
      }
    });
  }

  start(): void {
    this.reset();
    this.gameLoop();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    if (!this.isGameOver) {
      this.isPaused = false;
    }
  }

  reset(): void {
    this.bird.y = 250;
    this.bird.velocity = 0;
    this.bird.rotation = 0;
    this.pipes = [];
    this.score = 0;
    this.pipeSpawnTimer = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.particles = [];
    this.background.x1 = 0;
    this.background.x2 = 800;
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.canvas.remove();
  }

  private flap(): void {
    if (this.isGameOver || this.isPaused) return;
    
    this.bird.velocity = this.bird.jump;
    
    // Create particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.bird.x,
        y: this.bird.y + this.bird.height / 2,
        vx: Math.random() * 2 - 3,
        vy: Math.random() * 2 + 1,
        life: 30,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`
      });
    }
  }

  private gameLoop = (): void => {
    if (!this.isPaused && !this.isGameOver) {
      this.update();
    }
    this.render();
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    // Update bird
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;
    
    // Rotate bird based on velocity
    this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);

    // Check boundaries
    if (this.bird.y + this.bird.height > this.canvas.height - 100) {
      this.bird.y = this.canvas.height - 100 - this.bird.height;
      this.gameOver();
    }
    if (this.bird.y < 0) {
      this.bird.y = 0;
      this.bird.velocity = 0;
    }

    // Spawn pipes
    this.pipeSpawnTimer++;
    if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.pipeSpawnTimer = 0;
      const gapY = Math.random() * (this.canvas.height - this.pipeGap - 200) + 100;
      this.pipes.push({
        x: this.canvas.width,
        y: gapY,
        gap: this.pipeGap,
        passed: false
      });
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      // Check collision
      if (this.checkCollision(pipe)) {
        this.gameOver();
      }

      // Check score
      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
        this.createScoreParticles();
      }

      // Remove off-screen pipes
      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update background (parallax)
    this.background.x1 -= this.background.speed;
    this.background.x2 -= this.background.speed;

    if (this.background.x1 <= -800) {
      this.background.x1 = this.background.x2 + 800;
    }
    if (this.background.x2 <= -800) {
      this.background.x2 = this.background.x1 + 800;
    }
  }

  private checkCollision(pipe: Pipe): boolean {
    const birdLeft = this.bird.x;
    const birdRight = this.bird.x + this.bird.width;
    const birdTop = this.bird.y;
    const birdBottom = this.bird.y + this.bird.height;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + this.pipeWidth;
    const topPipeBottom = pipe.y;
    const bottomPipeTop = pipe.y + pipe.gap;

    // Check if bird is within pipe x-range
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check if bird hits top or bottom pipe
      if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
        return true;
      }
    }

    return false;
  }

  private createScoreParticles(): void {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.bird.x + this.bird.width / 2,
        y: this.bird.y + this.bird.height / 2,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        life: 30,
        color: `rgba(255, 215, 0, ${Math.random()})`
      });
    }
  }

  private gameOver(): void {
    this.isGameOver = true;
    
    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('flappy_highscore', this.score.toString());
    }

    // Explosion particles
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: this.bird.x + this.bird.width / 2,
        y: this.bird.y + this.bird.height / 2,
        vx: Math.random() * 8 - 4,
        vy: Math.random() * 8 - 4,
        life: 60,
        color: `rgba(255, ${Math.random() * 100}, 0, 1)`
      });
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#DEB887';
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
    
    // Draw grass
    this.ctx.fillStyle = '#8BC34A';
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 20);

    // Draw pipes
    this.pipes.forEach(pipe => {
      this.drawPipe(pipe);
    });

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / 30;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });

    // Draw bird
    this.ctx.save();
    this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
    this.ctx.rotate((this.bird.rotation * Math.PI) / 180);
    
    // Bird body
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bird wing
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.ellipse(-5, 0, 10, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bird eye
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(8, -5, 6, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(10, -5, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bird beak
    this.ctx.fillStyle = '#FF6347';
    this.ctx.beginPath();
    this.ctx.moveTo(15, 0);
    this.ctx.lineTo(22, -3);
    this.ctx.lineTo(22, 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();

    // Draw UI
    this.drawUI();

    // Draw game over screen
    if (this.isGameOver) {
      this.drawGameOver();
    }

    // Draw pause overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 48px Comic Sans MS';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  private drawPipe(pipe: Pipe): void {
    const capHeight = 30;
    const capWidth = this.pipeWidth + 10;

    // Top pipe
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.y - capHeight);
    
    // Top pipe cap
    this.ctx.fillStyle = '#66BB6A';
    this.ctx.fillRect(pipe.x - 5, pipe.y - capHeight, capWidth, capHeight);

    // Bottom pipe
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(pipe.x, pipe.y + pipe.gap + capHeight, this.pipeWidth, this.canvas.height - pipe.y - pipe.gap - capHeight);
    
    // Bottom pipe cap
    this.ctx.fillStyle = '#66BB6A';
    this.ctx.fillRect(pipe.x - 5, pipe.y + pipe.gap, capWidth, capHeight);

    // Pipe highlights
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(pipe.x + 5, 0, 8, pipe.y - capHeight);
    this.ctx.fillRect(pipe.x + 5, pipe.y + pipe.gap + capHeight, 8, this.canvas.height - pipe.y - pipe.gap - capHeight);
  }

  private drawUI(): void {
    // Score
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 4;
    this.ctx.font = 'bold 48px Comic Sans MS';
    this.ctx.textAlign = 'center';
    this.ctx.strokeText(this.score.toString(), this.canvas.width / 2, 60);
    this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 60);

    // High score
    this.ctx.font = '20px Comic Sans MS';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width - 20, 30);
  }

  private drawGameOver(): void {
    // Overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Game Over text
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 4;
    this.ctx.font = 'bold 64px Comic Sans MS';
    this.ctx.textAlign = 'center';
    this.ctx.strokeText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

    // Final score
    this.ctx.fillStyle = 'white';
    this.ctx.font = '32px Comic Sans MS';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

    // High score
    if (this.score === this.highScore && this.score > 0) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 28px Comic Sans MS';
      this.ctx.fillText('🎉 NEW HIGH SCORE! 🎉', this.canvas.width / 2, this.canvas.height / 2 + 60);
    } else {
      this.ctx.fillStyle = '#AAA';
      this.ctx.font = '24px Comic Sans MS';
      this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    // Restart instruction
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Comic Sans MS';
    this.ctx.fillText('Press R to Restart or Click to Try Again', this.canvas.width / 2, this.canvas.height / 2 + 100);
  }

  getScore(): number {
    return this.score;
  }

  isOver(): boolean {
    return this.isGameOver;
  }
}

export default FlappyGame;
