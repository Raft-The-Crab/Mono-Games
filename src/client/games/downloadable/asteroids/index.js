// Asteroids - Classic Arcade Shooter
import BaseGame from '../../shared/framework/BaseGame.js';
import { GameMenu } from '../../shared/GameMenu.js';

class AsteroidsGame extends BaseGame {
    constructor(containerId) {
        super(containerId, 'asteroids', 800, 600);

        this.ship = null;
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        this.menu = new GameMenu(this);
        this.lives = 3;
    }

    setup() {
        this.score = 0;
        this.lives = 3;
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];

        // Initialize ship
        this.ship = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            angle: 0,
            vx: 0,
            vy: 0,
            thrust: false
        };

        // Spawn initial asteroids
        for (let i = 0; i < 4; i++) {
            this.spawnAsteroid('large');
        }

        this.setupControls();
    }

    setupControls() {
        const keys = {};

        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (e.key === ' ') this.shoot();
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        this.keys = keys;

        this.addKeyHandler('escape', () => {
            if (!this.menu.isOpen) {
                this.pause();
                this.menu.show('pause');
            }
        });
    }

    spawnAsteroid(size, x = null, y = null) {
        const sizes = {
            large: { radius: 40, points: 20 },
            medium: { radius: 25, points: 50 },
            small: { radius: 15, points: 100 }
        };

        const asteroid = {
            x: x ?? (Math.random() * this.canvas.width),
            y: y ?? (Math.random() * this.canvas.height),
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            angle: Math.random() * Math.PI * 2,
            rotation: (Math.random() - 0.5) * 2,
            size: size,
            ...sizes[size]
        };

        this.asteroids.push(asteroid);
    }

    shoot() {
        const bullet = {
            x: this.ship.x + Math.cos(this.ship.angle) * 20,
            y: this.ship.y + Math.sin(this.ship.angle) * 20,
            vx: Math.cos(this.ship.angle) * 300,
            vy: Math.sin(this.ship.angle) * 300,
            life: 1.5
        };
        this.bullets.push(bullet);
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        // Ship controls
        if (this.keys['ArrowLeft']) this.ship.angle -= 5 * deltaTime;
        if (this.keys['ArrowRight']) this.ship.angle += 5 * deltaTime;

        if (this.keys['ArrowUp']) {
            this.ship.thrust = true;
            this.ship.vx += Math.cos(this.ship.angle) * 200 * deltaTime;
            this.ship.vy += Math.sin(this.ship.angle) * 200 * deltaTime;

            // Thrust particles
            this.particles.push({
                x: this.ship.x - Math.cos(this.ship.angle) * 15,
                y: this.ship.y - Math.sin(this.ship.angle) * 15,
                vx: -Math.cos(this.ship.angle) * 100 + (Math.random() - 0.5) * 50,
                vy: -Math.sin(this.ship.angle) * 100 + (Math.random() - 0.5) * 50,
                life: 0.5,
                color: '#FFA07A'
            });
        } else {
            this.ship.thrust = false;
        }

        // Friction
        this.ship.vx *= 0.99;
        this.ship.vy *= 0.99;

        // Update ship position
        this.ship.x += this.ship.vx * deltaTime;
        this.ship.y += this.ship.vy * deltaTime;

        // Wrap around screen
        this.ship.x = (this.ship.x + this.canvas.width) % this.canvas.width;
        this.ship.y = (this.ship.y + this.canvas.height) % this.canvas.height;

        // Update asteroids
        this.asteroids.forEach(asteroid => {
            asteroid.x += asteroid.vx * deltaTime;
            asteroid.y += asteroid.vy * deltaTime;
            asteroid.angle += asteroid.rotation * deltaTime;

            asteroid.x = (asteroid.x + this.canvas.width) % this.canvas.width;
            asteroid.y = (asteroid.y + this.canvas.height) % this.canvas.height;
        });

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.vx * deltaTime;
            bullet.y += bullet.vy * deltaTime;
            bullet.life -= deltaTime;
            return bullet.life > 0;
        });

        // Collision detection
        this.checkCollisions();

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.life -= deltaTime;
            return p.life > 0;
        });
    }

    checkCollisions() {
        // Bullet-asteroid collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                const dist = Math.sqrt(
                    (bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2
                );

                if (dist < asteroid.radius) {
                    // Hit!
                    this.score += asteroid.points;
                    this.createExplosion(asteroid.x, asteroid.y);

                    // Split asteroid
                    if (asteroid.size === 'large') {
                        this.spawnAsteroid('medium', asteroid.x, asteroid.y);
                        this.spawnAsteroid('medium', asteroid.x, asteroid.y);
                    } else if (asteroid.size === 'medium') {
                        this.spawnAsteroid('small', asteroid.x, asteroid.y);
                        this.spawnAsteroid('small', asteroid.x, asteroid.y);
                    }

                    this.asteroids.splice(j, 1);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Ship-asteroid collisions
        this.asteroids.forEach((asteroid, i) => {
            const dist = Math.sqrt(
                (this.ship.x - asteroid.x) ** 2 + (this.ship.y - asteroid.y) ** 2
            );

            if (dist < asteroid.radius + 10) {
                this.lives--;
                this.createExplosion(this.ship.x, this.ship.y);
                this.ship.x = this.canvas.width / 2;
                this.ship.y = this.canvas.height / 2;
                this.ship.vx = 0;
                this.ship.vy = 0;

                if (this.lives <= 0) {
                    this.pause();
                    this.menu.show('gameover');
                }
            }
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1.0,
                color: '#FF' + Math.floor(Math.random() * 16).toString(16) + '6B6B'
            });
        }
    }

    render() {
        // Space background
        this.ctx.fillStyle = '#0a0a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.canvas.width;
            const y = (i * 217.3) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2);
        }

        // Draw ship
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);

        this.ctx.strokeStyle = '#4ECDC4';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(-10, -8);
        this.ctx.lineTo(-10, 8);
        this.ctx.closePath();
        this.ctx.stroke();

        if (this.ship.thrust) {
            this.ctx.strokeStyle = '#FFA07A';
            this.ctx.beginPath();
            this.ctx.moveTo(-10, -5);
            this.ctx.lineTo(-18, 0);
            this.ctx.lineTo(-10, 5);
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Draw asteroids
        this.asteroids.forEach(asteroid => {
            this.ctx.save();
            this.ctx.translate(asteroid.x, asteroid.y);
            this.ctx.rotate(asteroid.angle);

            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const r = asteroid.radius * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.restore();
        });

        // Draw bullets
        this.ctx.fillStyle = '#FFD93D';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
        });

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            this.ctx.globalAlpha = 1;
        });

        // HUD
        this.ctx.font = 'bold 24px "Comic Sans MS"';
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        this.ctx.fillText(`Lives: ${'❤️'.repeat(this.lives)}`, 20, 75);
    }
}

export default AsteroidsGame;
