import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';

/**
 * Tic Tac Toe with AI
 */
class TicTacToe extends BaseGame {
    constructor(containerId) {
        super(containerId, 'tic-tac-toe', 400, 450);

        this.ai = getAI(3);
        this.aiLevel = 3;

        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X = human, O = AI
        this.winner = null;
        this.winningLine = null;
        this.gameOver = false;
        this.aiThinking = false;
    }

    setup() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.winningLine = null;
        this.gameOver = false;
        this.aiThinking = false;
        this.score = 0;

        this.setupControls();
    }

    setupControls() {
        // Click handling
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.currentPlayer !== 'X' || this.aiThinking) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top - 50; // Account for header area

            if (y < 0) return;

            const cellSize = this.canvas.width / 3;
            const col = Math.floor(x / cellSize);
            const row = Math.floor(y / cellSize);
            const index = row * 3 + col;

            if (index >= 0 && index < 9 && this.board[index] === null) {
                this.makeMove(index);
            }
        });

        this.addKeyHandler('r', () => { this.reset(); });
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;

        // Check for winner
        const result = this.checkWinner();
        if (result) {
            this.winner = result.winner;
            this.winningLine = result.line;
            this.gameOver = true;

            if (this.winner === 'X') {
                this.score += 100;
            }
            return;
        }

        // Check for draw
        if (!this.board.includes(null)) {
            this.gameOver = true;
            this.score += 25;
            return;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

        // AI turn
        if (this.currentPlayer === 'O') {
            this.aiThinking = true;
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeAIMove() {
        const move = this.ai.getTicTacToeMove(this.board, 'O');
        this.aiThinking = false;

        if (move !== null) {
            this.makeMove(move);
        }
    }

    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { winner: this.board[a], line };
            }
        }
        return null;
    }

    update(deltaTime) {
        // Not much to update - game is turn-based
    }

    render() {
        this.clearCanvas();

        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        bgGradient.addColorStop(0, '#FFF8DC');
        bgGradient.addColorStop(1, '#FFE5B4');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Header
        this.ctx.font = 'bold 24px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.textAlign = 'center';

        let statusText;
        if (this.gameOver) {
            if (this.winner) {
                statusText = this.winner === 'X' ? '🎉 You Win!' : '🤖 AI Wins!';
            } else {
                statusText = "🤝 It's a Draw!";
            }
        } else if (this.aiThinking) {
            statusText = '🤖 AI thinking...';
        } else {
            statusText = this.currentPlayer === 'X' ? '❌ Your Turn' : '⭕ AI Turn';
        }
        this.ctx.fillText(statusText, this.canvas.width / 2, 35);

        // Grid
        const offsetY = 50;
        const cellSize = this.canvas.width / 3;

        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';

        // Vertical lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cellSize, offsetY + 10);
            this.ctx.lineTo(i * cellSize, offsetY + 3 * cellSize - 10);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(10, offsetY + i * cellSize);
            this.ctx.lineTo(this.canvas.width - 10, offsetY + i * cellSize);
            this.ctx.stroke();
        }

        // Draw pieces
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const centerX = col * cellSize + cellSize / 2;
            const centerY = offsetY + row * cellSize + cellSize / 2;

            if (this.board[i] === 'X') {
                this.drawX(centerX, centerY, 40);
            } else if (this.board[i] === 'O') {
                this.drawO(centerX, centerY, 35);
            }
        }

        // Draw winning line
        if (this.winningLine) {
            const [a, , c] = this.winningLine;
            const startRow = Math.floor(a / 3);
            const startCol = a % 3;
            const endRow = Math.floor(c / 3);
            const endCol = c % 3;

            this.ctx.strokeStyle = '#FFD93D';
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.moveTo(startCol * cellSize + cellSize / 2, offsetY + startRow * cellSize + cellSize / 2);
            this.ctx.lineTo(endCol * cellSize + cellSize / 2, offsetY + endRow * cellSize + cellSize / 2);
            this.ctx.stroke();
        }

        // Footer
        this.ctx.font = '14px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#90A4AE';
        this.ctx.fillText(`AI: ${AI_LEVELS[this.aiLevel].name}`, this.canvas.width / 2, this.canvas.height - 10);

        if (this.gameOver) {
            this.ctx.font = '16px "Comic Sans MS", cursive';
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.fillText('Press R to play again', this.canvas.width / 2, this.canvas.height - 30);
        }
    }

    drawX(x, y, size) {
        this.ctx.strokeStyle = '#4ECDC4';
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y - size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + size, y - size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.stroke();
    }

    drawO(x, y, radius) {
        this.ctx.strokeStyle = '#E63946';
        this.ctx.lineWidth = 10;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}

export default TicTacToe;
