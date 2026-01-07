import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';

export default class TicTacToe extends BaseGame {
    constructor(containerId, aiLevel = 3) {
        super(containerId, 'tic-tac-toe', 500, 500);

        // AI System
        this.ai = getAI(aiLevel);
        this.aiLevel = aiLevel;

        // Game state
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // Player is X, AI is O
        this.winner = null;
        this.winningLine = null;
        this.gameOver = false;

        // Cell dimensions
        this.cellSize = 140;
        this.padding = 40;

        // Animation
        this.animatingCell = null;
        this.animationProgress = 0;

        // Thinking indicator
        this.aiThinking = false;
    }

    setAILevel(level) {
        this.aiLevel = Math.max(1, Math.min(5, level));
        this.ai.setLevel(this.aiLevel);
    }

    setup() {
        this.setupControls();
        this.resetGame();
    }

    setupControls() {
        // Mouse click handler
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.currentPlayer !== 'X' || this.aiThinking) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor((x - this.padding) / this.cellSize);
            const row = Math.floor((y - this.padding) / this.cellSize);

            if (col >= 0 && col < 3 && row >= 0 && row < 3) {
                const index = row * 3 + col;
                this.makeMove(index);
            }
        });

        // Reset with R key
        this.addKeyHandler('r', () => {
            this.resetGame();
        });
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.winningLine = null;
        this.gameOver = false;
        this.animatingCell = null;
        this.aiThinking = false;
    }

    makeMove(index) {
        if (this.board[index] || this.gameOver) return;

        // Place piece with animation
        this.board[index] = this.currentPlayer;
        this.animatingCell = index;
        this.animationProgress = 0;

        // Check for winner
        this.checkWinner();

        if (!this.gameOver) {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

            // If AI's turn, schedule AI move
            if (this.currentPlayer === 'O') {
                this.aiThinking = true;
                const thinkTime = 500 + Math.random() * 500; // 500-1000ms thinking time
                setTimeout(() => this.makeAIMove(), thinkTime);
            }
        }
    }

    makeAIMove() {
        if (this.gameOver) {
            this.aiThinking = false;
            return;
        }

        const move = this.ai.getTicTacToeMove(this.board, 'O');
        this.aiThinking = false;

        if (move !== null) {
            this.board[move] = 'O';
            this.animatingCell = move;
            this.animationProgress = 0;

            this.checkWinner();

            if (!this.gameOver) {
                this.currentPlayer = 'X';
            }
        }
    }

    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                this.winningLine = line;
                this.gameOver = true;

                // Update score
                if (this.winner === 'X') {
                    this.score += 100;
                    this.endGame('You Win! 🎉');
                } else {
                    this.endGame('AI Wins! 🤖');
                }
                return;
            }
        }

        // Check for draw
        if (this.board.every(cell => cell)) {
            this.gameOver = true;
            this.score += 25;
            this.endGame("It's a Draw! 🤝");
        }
    }

    update(deltaTime) {
        // Animation update
        if (this.animatingCell !== null) {
            this.animationProgress += deltaTime * 3;
            if (this.animationProgress >= 1) {
                this.animationProgress = 1;
                this.animatingCell = null;
            }
        }
    }

    render() {
        this.clearCanvas();

        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        bgGradient.addColorStop(0, '#FFF8DC');
        bgGradient.addColorStop(1, '#FFE5B4');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw pieces
        for (let i = 0; i < 9; i++) {
            if (this.board[i]) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const x = this.padding + col * this.cellSize + this.cellSize / 2;
                const y = this.padding + row * this.cellSize + this.cellSize / 2;

                const scale = i === this.animatingCell ? this.animationProgress : 1;
                const isWinning = this.winningLine && this.winningLine.includes(i);

                if (this.board[i] === 'X') {
                    this.drawX(x, y, scale, isWinning);
                } else {
                    this.drawO(x, y, scale, isWinning);
                }
            }
        }

        // Draw winning line
        if (this.winningLine) {
            this.drawWinningLine();
        }

        // UI
        this.drawUI();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';

        // Vertical lines
        for (let i = 1; i < 3; i++) {
            const x = this.padding + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding + 10);
            this.ctx.lineTo(x, this.padding + this.cellSize * 3 - 10);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            const y = this.padding + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + 10, y);
            this.ctx.lineTo(this.padding + this.cellSize * 3 - 10, y);
            this.ctx.stroke();
        }
    }

    drawX(x, y, scale, isWinning) {
        const size = 45 * scale;

        this.ctx.strokeStyle = isWinning ? '#FFD700' : '#FF6B35';
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';

        // Shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetY = 4;

        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y - size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.moveTo(x + size, y - size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawO(x, y, scale, isWinning) {
        const radius = 45 * scale;

        this.ctx.strokeStyle = isWinning ? '#FFD700' : '#4ECDC4';
        this.ctx.lineWidth = 12;

        // Shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetY = 4;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawWinningLine() {
        const [a, , c] = this.winningLine;

        const startRow = Math.floor(a / 3);
        const startCol = a % 3;
        const endRow = Math.floor(c / 3);
        const endCol = c % 3;

        const startX = this.padding + startCol * this.cellSize + this.cellSize / 2;
        const startY = this.padding + startRow * this.cellSize + this.cellSize / 2;
        const endX = this.padding + endCol * this.cellSize + this.cellSize / 2;
        const endY = this.padding + endRow * this.cellSize + this.cellSize / 2;

        this.ctx.strokeStyle = '#E63946';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    drawUI() {
        // Turn indicator / Status
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = 'bold 24px "Comic Sans MS", cursive';
        this.ctx.textAlign = 'center';

        let statusText;
        if (this.gameOver) {
            statusText = this.winner
                ? (this.winner === 'X' ? '🎉 You Win!' : '🤖 AI Wins!')
                : "🤝 It's a Draw!";
        } else if (this.aiThinking) {
            statusText = '🤖 AI is thinking...';
        } else {
            statusText = this.currentPlayer === 'X' ? '👆 Your Turn (X)' : '🤖 AI Turn (O)';
        }

        this.ctx.fillText(statusText, this.canvas.width / 2, 28);

        // AI Level indicator
        const aiLevelName = AI_LEVELS[this.aiLevel].name;
        this.ctx.font = '14px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#90A4AE';
        this.ctx.fillText(`AI: ${aiLevelName}`, this.canvas.width / 2, this.canvas.height - 12);

        // Restart hint
        if (this.gameOver) {
            this.ctx.font = '16px "Comic Sans MS", cursive';
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height - 35);
        }
    }
}
