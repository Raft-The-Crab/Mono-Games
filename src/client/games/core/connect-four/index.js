import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';

export default class ConnectFour extends BaseGame {
    constructor(containerId, aiLevel = 3) {
        super(containerId, 'connect-four', 700, 630);

        // AI System
        this.ai = getAI(aiLevel);
        this.aiLevel = aiLevel;

        // Board: 6 rows x 7 columns
        this.rows = 6;
        this.cols = 7;
        this.board = this.createEmptyBoard();

        // Cell dimensions
        this.cellSize = 80;
        this.padding = 60;

        // Game state
        this.currentPlayer = 1; // 1 = Player (Red), 2 = AI (Yellow)
        this.winner = null;
        this.winningCells = [];
        this.gameOver = false;

        // Animation
        this.droppingPiece = null;
        this.dropProgress = 0;
        this.hoverColumn = -1;

        // AI thinking
        this.aiThinking = false;
    }

    createEmptyBoard() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
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
        // Mouse movement for hover effect
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

        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverColumn = -1;
        });

        // Mouse click
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.currentPlayer !== 1 || this.aiThinking || this.droppingPiece) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;

            const col = Math.floor((x - this.padding) / this.cellSize);
            if (col >= 0 && col < this.cols) {
                this.dropPiece(col);
            }
        });

        // Reset with R key
        this.addKeyHandler('r', () => {
            this.resetGame();
        });
    }

    resetGame() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = 1;
        this.winner = null;
        this.winningCells = [];
        this.gameOver = false;
        this.droppingPiece = null;
        this.aiThinking = false;
    }

    dropPiece(col) {
        if (this.board[0][col] !== 0 || this.gameOver) return false;

        // Find the lowest empty row
        let targetRow = -1;
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                targetRow = row;
                break;
            }
        }

        if (targetRow === -1) return false;

        // Start drop animation
        this.droppingPiece = {
            col,
            targetRow,
            currentY: 0,
            player: this.currentPlayer
        };
        this.dropProgress = 0;

        return true;
    }

    finishDrop() {
        if (!this.droppingPiece) return;

        const { col, targetRow, player } = this.droppingPiece;
        this.board[targetRow][col] = player;
        this.droppingPiece = null;

        // Check for winner
        this.checkWinner(targetRow, col);

        if (!this.gameOver) {
            // Switch player
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

            // AI turn
            if (this.currentPlayer === 2) {
                this.aiThinking = true;
                const thinkTime = 400 + Math.random() * 600;
                setTimeout(() => this.makeAIMove(), thinkTime);
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
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonal down-right
            [1, -1]   // Diagonal down-left
        ];

        for (const [dr, dc] of directions) {
            const cells = [[lastRow, lastCol]];

            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const r = lastRow + dr * i;
                const c = lastCol + dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                    cells.push([r, c]);
                } else break;
            }

            // Check negative direction
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

                if (player === 1) {
                    this.score += 100;
                    this.endGame('You Win! 🎉');
                } else {
                    this.endGame('AI Wins! 🤖');
                }
                return;
            }
        }

        // Check for draw
        if (this.board[0].every(cell => cell !== 0)) {
            this.gameOver = true;
            this.score += 25;
            this.endGame("It's a Draw! 🤝");
        }
    }

    update(deltaTime) {
        // Drop animation
        if (this.droppingPiece) {
            const targetY = this.padding + this.droppingPiece.targetRow * this.cellSize + this.cellSize / 2;
            this.dropProgress += deltaTime * 12;
            this.droppingPiece.currentY = Math.min(this.dropProgress * this.cellSize, targetY);

            if (this.droppingPiece.currentY >= targetY) {
                this.finishDrop();
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

        // Hover preview
        if (this.hoverColumn >= 0 && !this.droppingPiece) {
            this.drawPiece(
                this.padding + this.hoverColumn * this.cellSize + this.cellSize / 2,
                this.padding / 2,
                1,
                0.5
            );
        }

        // Dropping piece
        if (this.droppingPiece) {
            this.drawPiece(
                this.padding + this.droppingPiece.col * this.cellSize + this.cellSize / 2,
                this.droppingPiece.currentY,
                this.droppingPiece.player,
                1
            );
        }

        // Board background
        this.ctx.fillStyle = '#3B82F6';
        this.roundRect(
            this.padding - 10,
            this.padding - 10,
            this.cols * this.cellSize + 20,
            this.rows * this.cellSize + 20,
            16
        );
        this.ctx.fill();

        // Board border
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Draw cells and pieces
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = this.padding + col * this.cellSize + this.cellSize / 2;
                const y = this.padding + row * this.cellSize + this.cellSize / 2;

                // Cell hole
                this.ctx.fillStyle = '#1E3A5F';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 32, 0, Math.PI * 2);
                this.ctx.fill();

                // Inner lighter
                this.ctx.fillStyle = '#234B73';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 28, 0, Math.PI * 2);
                this.ctx.fill();

                // Piece
                if (this.board[row][col] !== 0) {
                    const isWinning = this.winningCells.some(([r, c]) => r === row && c === col);
                    this.drawPiece(x, y, this.board[row][col], 1, isWinning);
                }
            }
        }

        // UI
        this.drawUI();
    }

    drawPiece(x, y, player, alpha = 1, isWinning = false) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        const color = player === 1 ? '#E63946' : '#FFD93D';
        const darkColor = player === 1 ? '#B91C2C' : '#D4A210';

        // Shadow
        this.ctx.beginPath();
        this.ctx.arc(x, y + 3, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fill();

        // Main piece
        const gradient = this.ctx.createRadialGradient(x - 8, y - 8, 5, x, y, 30);
        gradient.addColorStop(0, player === 1 ? '#FF6B6B' : '#FFE66D');
        gradient.addColorStop(1, color);

        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = isWinning ? '#FFFFFF' : darkColor;
        this.ctx.lineWidth = isWinning ? 4 : 3;
        this.ctx.stroke();

        // Highlight
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 8, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.fill();

        // Winning glow
        if (isWinning) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, 36, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    drawUI() {
        // Status
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = 'bold 22px "Comic Sans MS", cursive';
        this.ctx.textAlign = 'center';

        let statusText;
        if (this.gameOver) {
            statusText = this.winner
                ? (this.winner === 1 ? '🎉 You Win!' : '🤖 AI Wins!')
                : "🤝 It's a Draw!";
        } else if (this.aiThinking) {
            statusText = '🤖 AI is thinking...';
        } else if (this.droppingPiece) {
            statusText = '💫 Dropping...';
        } else {
            statusText = this.currentPlayer === 1 ? '🔴 Your Turn' : '🟡 AI Turn';
        }

        this.ctx.fillText(statusText, this.canvas.width / 2, 28);

        // AI Level
        const aiLevelName = AI_LEVELS[this.aiLevel].name;
        this.ctx.font = '14px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#90A4AE';
        this.ctx.fillText(`AI: ${aiLevelName}`, this.canvas.width / 2, this.canvas.height - 10);

        // Restart hint
        if (this.gameOver) {
            this.ctx.font = '16px "Comic Sans MS", cursive';
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height - 30);
        }
    }
}
