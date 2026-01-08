// Slow Roads - Infinite Driving Game (Inspired by slowroads.io)
// A peaceful, procedurally generated driving experience

import BaseGame from '../../shared/framework/BaseGame.js';

class SlowRoadsGame extends BaseGame {
    constructor(containerId) {
        super(containerId, 'slow-roads', 800, 600);

        this.roadWidth = 200;
        this.roadY = 400;
        this.roadSegments = [];
        this.cameraZ = 0;
        this.speed = 5;
        this.playerX = 0;
        this.trees = [];
        this.clouds = [];
        this.roadColor = '#666';
        this.grassColor = '#7EC850';
        this.skyColor = '#87CEEB';
        this.timeOfDay = 0; // 0-24 hours
    }

    setup() {
        this.score = 0;
        this.cameraZ = 0;
        this.playerX = 0;
        this.speed = 5;

        // Generate initial road
        for (let i = 0; i < 100; i++) {
            this.roadSegments.push({
                z: i * 20,
                curve: Math.sin(i * 0.1) * 50,
                y: Math.sin(i * 0.05) * 30
            });
        }

        // Generate trees
        for (let i = 0; i < 50; i++) {
            this.trees.push({
                x: (Math.random() - 0.5) * 1000,
                z: Math.random() * 2000,
                size: 20 + Math.random() * 30
            });
        }

        // Generate clouds
        for (let i = 0; i < 10; i++) {
            this.clouds.push({
                x: (Math.random() - 0.5) * 1200,
                y: 50 + Math.random() * 150,
                size: 40 + Math.random() * 60,
                speed: 0.1 + Math.random() * 0.3
            });
        }

        this.setupControls();
    }

    setupControls() {
        this.addKeyHandler('arrowleft', () => {
            this.playerX -= 3;
        });
        this.addKeyHandler('a', () => {
            this.playerX -= 3;
        });
        this.addKeyHandler('arrowright', () => {
            this.playerX += 3;
        });
        this.addKeyHandler('d', () => {
            this.playerX += 3;
        });
        this.addKeyHandler('arrowup', () => {
            this.speed = Math.min(this.speed + 0.5, 15);
        });
        this.addKeyHandler('w', () => {
            this.speed = Math.min(this.speed + 0.5, 15);
        });
        this.addKeyHandler('arrowdown', () => {
            this.speed = Math.max(this.speed - 0.5, 1);
        });
        this.addKeyHandler('s', () => {
            this.speed = Math.max(this.speed - 0.5, 1);
        });
    }

    update(deltaTime) {
        // Move camera forward
        this.cameraZ += this.speed;
        this.score = Math.floor(this.cameraZ / 10);

        // Keep player on road
        this.playerX = Math.max(-this.roadWidth / 2, Math.min(this.roadWidth / 2, this.playerX));

        // Generate new road segments
        const lastSegment = this.roadSegments[this.roadSegments.length - 1];
        if (lastSegment.z < this.cameraZ + 1000) {
            const newZ = lastSegment.z + 20;
            this.roadSegments.push({
                z: newZ,
                curve: Math.sin(newZ * 0.01) * 50,
                y: Math.sin(newZ * 0.005) * 30
            });
        }

        // Remove old segments
        this.roadSegments = this.roadSegments.filter(s => s.z > this.cameraZ - 500);

        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -600) cloud.x = 600;
        });

        // Day/night cycle (very slow)
        this.timeOfDay += deltaTime * 0.1;
        if (this.timeOfDay > 24) this.timeOfDay = 0;
    }

    render() {
        // Sky with day/night cycle
        const dayness = Math.sin((this.timeOfDay / 24) * Math.PI * 2);
        const r = Math.floor(135 + dayness * 50);
        const g = Math.floor(206 + dayness * 49);
        const b = Math.floor(235 - dayness * 135);
        this.skyColor = `rgb(${r}, ${g}, ${b})`;

        this.ctx.fillStyle = this.skyColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds
        this.clouds.forEach(cloud => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.ellipse(
                this.canvas.width / 2 + cloud.x,
                cloud.y,
                cloud.size,
                cloud.size * 0.6,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();
        });

        // Draw road (3D perspective)
        for (let i = 0; i < this.roadSegments.length; i++) {
            const segment = this.roadSegments[i];
            const distance = segment.z - this.cameraZ;

            if (distance < 0) continue;

            const scale = 200 / (distance + 200);
            const x = this.canvas.width / 2 + (segment.curve - this.playerX) * scale;
            const y = this.roadY - segment.y * scale;
            const w = this.roadWidth * scale;

            // Road
            this.ctx.fillStyle = i % 2 === 0 ? '#555' : '#666';
            this.ctx.fillRect(x - w / 2, y, w, 5 * scale);

            // Road lines
            if (i % 5 === 0) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.fillRect(x - 5 * scale, y, 10 * scale, 3 * scale);
            }

            // Grass
            this.ctx.fillStyle = this.grassColor;
            this.ctx.fillRect(0, y, x - w / 2, 5 * scale);
            this.ctx.fillRect(x + w / 2, y, this.canvas.width, 5 * scale);
        }

        // Draw trees
        this.trees.forEach(tree => {
            const distance = tree.z - this.cameraZ;
            if (distance < 0 || distance > 1000) return;

            const scale = 200 / (distance + 200);
            const x = this.canvas.width / 2 + tree.x * scale;
            const y = this.roadY - tree.size * scale;
            const size = tree.size * scale;

            // Tree trunk
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x - size * 0.2, y, size * 0.4, size);

            // Tree foliage
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(x, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw player car
        const carX = this.canvas.width / 2;
        const carY = this.roadY + 100;

        // Car body
        this.ctx.fillStyle = '#E63946';
        this.ctx.fillRect(carX - 20, carY - 40, 40, 60);

        // Car windows
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(carX - 15, carY - 35, 30, 20);

        // Wheels
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(carX - 20, carY - 30, 8, 15);
        this.ctx.fillRect(carX + 12, carY - 30, 8, 15);
        this.ctx.fillRect(carX - 20, carY, 8, 15);
        this.ctx.fillRect(carX + 12, carY, 8, 15);

        // UI
        this.ctx.font = 'bold 20px "Comic Sans MS"';
        this.ctx.fillStyle = '#FFF';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(`🛣️ Distance: ${this.score}m`, 20, 30);
        this.ctx.fillText(`🛣️ Distance: ${this.score}m`, 20, 30);

        this.ctx.strokeText(`⚡ Speed: ${Math.floor(this.speed * 10)} km/h`, 20, 60);
        this.ctx.fillText(`⚡ Speed: ${Math.floor(this.speed * 10)} km/h`, 20, 60);

        // Instructions
        if (this.score < 50) {
            this.ctx.font = '16px "Comic Sans MS"';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillText('Arrow Keys to Drive | Relax and Enjoy!', this.canvas.width / 2 - 150, this.canvas.height - 20);
        }
    }
}

export default SlowRoadsGame;
