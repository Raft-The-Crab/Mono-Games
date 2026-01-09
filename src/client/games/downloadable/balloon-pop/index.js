// Balloon Pop - Physics-based arcade game
import BaseGame from '../../shared/framework/BaseGame.js';
import { GameMenu } from '../../shared/GameMenu.js';

class BalloonPopGame extends BaseGame {
    constructor(containerId) {
        super(containerId, 'balloon-pop', 600, 700);

        this.balloons = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1000; // ms
        this.level = 1;
        this.menu = new GameMenu(this);
    }

    setup() {
        this.score = 0;
        this.level = 1;
        this.balloons = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.setupControls();
    }

    setupControls() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleClick(touch);
        });

        this.addKeyHandler('escape', () => {
            if (!this.menu.isOpen) {
                this.pause();
                this.menu.show('pause');
            }
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on balloon
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            const dist = Math.sqrt(
                (x - balloon.x) ** 2 + (y - balloon.y) ** 2
            );

            if (dist < balloon.size) {
                this.popBalloon(i);
                break;
            }
        }
    }

    popBalloon(index) {
        const balloon = this.balloons[index];
        this.score += balloon.points;

        // Create particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: balloon.x,
                y: balloon.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200 - 100,
                life: 1.0,
                color: balloon.color
            });
        }

        this.balloons.splice(index, 1);

        // Level up every 500 points
        if (this.score >= this.level * 500) {
            this.level++;
            this.spawnInterval = Math.max(300, this.spawnInterval - 100);
        }
    }

    spawnBalloon() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#FF99C8', '#A8DADC'];
        const types = [
            { size: 40, speed: 2, points: 10 },      // Normal
            { size: 30, speed: 3.5, points: 25 },    // Fast small
            { size: 50, speed: 1.5, points: 5 }      // Slow big
        ];

        const type = types[Math.floor(Math.random() * types.length)];

        this.balloons.push({
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: this.canvas.height + 50,
            ...type,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        // Spawn balloons
        this.spawnTimer += deltaTime * 1000;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBalloon();
            this.spawnTimer = 0;
        }

        // Update balloons
        this.balloons.forEach((balloon, i) => {
            balloon.y -= balloon.speed * deltaTime * 60;

            // Remove if off screen
            if (balloon.y < -100) {
                this.balloons.splice(i, 1);
            }
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 400 * deltaTime; // Gravity
            p.life -= deltaTime * 2;
            return p.life > 0;
        });
    }

    render() {
        // Background gradient
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw balloons
        this.balloons.forEach(balloon => {
            // Balloon body
            this.ctx.save();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = balloon.color;

            this.ctx.fillStyle = balloon.color;
            this.ctx.beginPath();
            this.ctx.ellipse(
                balloon.x,
                balloon.y,
                balloon.size,
                balloon.size * 1.1,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();

            // Shine
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.ellipse(
                balloon.x - balloon.size * 0.3,
                balloon.y - balloon.size * 0.3,
                balloon.size * 0.3,
                balloon.size * 0.4,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();

            // String
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(balloon.x, balloon.y + balloon.size);
            this.ctx.lineTo(balloon.x, balloon.y + balloon.size + 30);
            this.ctx.stroke();

            this.ctx.restore();
        });

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            this.ctx.globalAlpha = 1;
        });

        // HUD
        this.ctx.font = 'bold 28px "Comic Sans MS"';
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 5;

        const scoreText = `Score: ${this.score}`;
        this.ctx.strokeText(scoreText, 20, 40);
        this.ctx.fillText(scoreText, 20, 40);

        const levelText = `Level: ${this.level}`;
        this.ctx.strokeText(levelText, 20, 80);
        this.ctx.fillText(levelText, 20, 80);
    }
}

export default BalloonPopGame;
