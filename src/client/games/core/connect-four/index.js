import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';

/**
 * Connect Four with AI
 */
class ConnectFour extends BaseGame {
    constructor(containerId) {
        super(containerId, 'connect-four', 700, 630);

        this.ai = getAI(3);
        this.aiLevel = 3;

        this.rows = 6;
        this.cols = 7;
        this.cellSize = 80;
        this.padding = 60;

        this.board = this.createEmptyBoard();
        this.currentPlayer = 1; // 1 = human (red), 2 = AI (yellow)
        this.winner = null;
        this.winningCells = [];
        this.gameOver = false;
        this.hoverColumn = -1;
        this.aiThinking = false;
    }

    createEmptyBoard() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    }

    setup() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = 1;
        this.winner = null;
        this.winningCells = [];
        this.gameOver = false;
        this.hoverColumn = -1;
        this.aiThinking = false;
        this.score = 0;

        this.setupControls();
    }

    setupControls() {
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameOver || this.currentPlayer !== 1 || this.aiThinking) {
                this.hoverColumn = -1;
                return;
            }

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const col = Math.floor((x - this.padding) / this.cellSize);
            this.hoverColumn = (col >= 0 && col < this.cols && this.board[0][col] === 0) ? col : -1;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoverColumn = -1;
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.currentPlayer !== 1 || this.aiThinking) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const col = Math.floor((x - this.padding) / this.cellSize);

            if (col >= 0 && col < this.cols && this.board[0][col] === 0) {
                this.dropPiece(col);
            }
        });

        this.addKeyHandler('r', () => { this.reset(); });
    }

    dropPiece(col) {
        // Find lowest empty row
        let row = -1;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                row = r;
                break;
            }
        }

        if (row === -1) return;

        this.board[row][col] = this.currentPlayer;
        this.checkWinner(row, col);

        if (!this.gameOver) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

            if (this.currentPlayer === 2) {
                this.aiThinking = true;
                setTimeout(() => this.makeAIMove(), 600);
            }
        }
    }

    makeAIMove() {
        if (this.gameOver) {
            this.aiThinking = false;
            return;
        }

        const col = this.ai.getConnectFourMove(this.board, 2);
        this.aiThinking = false;

        if (col !== null) {
            this.dropPiece(col);
        }
    }

    checkWinner(lastRow, lastCol) {
        const player = this.board[lastRow][lastCol];
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            const cells = [[lastRow, lastCol]];

            for (let i = 1; i < 4; i++) {
                const r = lastRow + dr * i;
                const c = lastCol + dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                    cells.push([r, c]);
                } else break;
            }

            for (let i = 1; i < 4; i++) {
                const r = lastRow - dr * i;
                const c = lastCol - dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                    cells.push([r, c]);
                } else break;
            }

            if (cells.length >= 4) {
                this.winner = player;
                this.winningCells = cells;
                this.gameOver = true;
                if (player === 1) this.score += 100;
                return;
            }
        }

        // Check for draw
        if (this.board[0].every(cell => cell !== 0)) {
            this.gameOver = true;
            this.score += 25;
        }
    }

    update(deltaTime) {
        // Turn-based game
    }

    render() {
        this.clearCanvas();

        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        bgGradient.addColorStop(0, '#FFF8DC');
        bgGradient.addColorStop(1, '#FFE5B4');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Status
        this.ctx.font = 'bold 22px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.textAlign = 'center';

        let statusText;
        if (this.gameOver) {
            statusText = this.winner ? (this.winner === 1 ? '🎉 You Win!' : '🤖 AI Wins!') : "🤝 Draw!";
        } else if (this.aiThinking) {
            statusText = '🤖 AI thinking...';
        } else {
            statusText = this.currentPlayer === 1 ? '🔴 Your Turn' : '🟡 AI Turn';
        }
        this.ctx.fillText(statusText, this.canvas.width / 2, 35);

        // Hover preview
        if (this.hoverColumn >= 0) {
            this.drawPiece(
                this.padding + this.hoverColumn * this.cellSize + this.cellSize / 2,
                30,
                1, 0.5
            );
        }

        // Board
        this.ctx.fillStyle = '#3B82F6';
        this.roundRect(
            this.padding - 10,
            this.padding - 10,
            this.cols * this.cellSize + 20,
            this.rows * this.cellSize + 20,
            16
        );
        this.ctx.fill();

        // Cells and pieces
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = this.padding + col * this.cellSize + this.cellSize / 2;
                const y = this.padding + row * this.cellSize + this.cellSize / 2;

                // Hole
                this.ctx.fillStyle = '#1E3A5F';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 32, 0, Math.PI * 2);
                this.ctx.fill();

                // Piece
                if (this.board[row][col] !== 0) {
                    const isWinning = this.winningCells.some(([r, c]) => r === row && c === col);
                    this.drawPiece(x, y, this.board[row][col], 1, isWinning);
                }
            }
        }

        // Footer
        this.ctx.font = '14px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#90A4AE';
        this.ctx.fillText(`AI: ${AI_LEVELS[this.aiLevel].name}`, this.canvas.width / 2, this.canvas.height - 10);

        if (this.gameOver) {
            this.ctx.font = '16px "Comic Sans MS", cursive';
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height - 30);
        }
    }

    drawPiece(x, y, player, alpha = 1, isWinning = false) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        const color = player === 1 ? '#E63946' : '#FFD93D';

        // Shadow
        this.ctx.beginPath();
        this.ctx.arc(x, y + 3, 28, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fill();

        // Piece
        const gradient = this.ctx.createRadialGradient(x - 8, y - 8, 5, x, y, 28);
        gradient.addColorStop(0, player === 1 ? '#FF6B6B' : '#FFE66D');
        gradient.addColorStop(1, color);

        this.ctx.beginPath();
        this.ctx.arc(x, y, 28, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Highlight
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 8, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.fill();

        // Winning glow
        if (isWinning) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, 34, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }
}

export default ConnectFour;
