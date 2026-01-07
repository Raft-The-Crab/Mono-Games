/**
 * AI Opponent System for Mono Games
 * Provides configurable AI difficulty with 5 levels
 */

export const AI_LEVELS = {
    1: { name: 'Very Easy', accuracy: 0.4, reactionDelay: 500, mistakeChance: 0.4 },
    2: { name: 'Easy', accuracy: 0.6, reactionDelay: 300, mistakeChance: 0.25 },
    3: { name: 'Normal', accuracy: 0.8, reactionDelay: 150, mistakeChance: 0.12 },
    4: { name: 'Hard', accuracy: 0.92, reactionDelay: 80, mistakeChance: 0.05 },
    5: { name: 'Expert', accuracy: 0.98, reactionDelay: 30, mistakeChance: 0.01 }
};

export class AIOpponent {
    constructor(level = 3) {
        this.setLevel(level);
        this.lastActionTime = 0;
    }

    /**
     * Set AI difficulty level (1-5)
     */
    setLevel(level) {
        this.level = Math.max(1, Math.min(5, level));
        this.config = AI_LEVELS[this.level];
    }

    /**
     * Get AI level config
     */
    getConfig() {
        return this.config;
    }

    /**
     * Check if AI should make a mistake based on level
     */
    shouldMakeMistake() {
        return Math.random() < this.config.mistakeChance;
    }

    /**
     * Check if AI can act based on reaction delay
     */
    canAct(currentTime) {
        if (currentTime - this.lastActionTime >= this.config.reactionDelay) {
            this.lastActionTime = currentTime;
            return true;
        }
        return false;
    }

    /**
     * Calculate AI move with accuracy factor
     * @param {number} targetPosition - The ideal position to reach
     * @param {number} currentPosition - Current AI position
     * @param {number} maxSpeed - Maximum movement speed
     * @returns {number} - Movement delta
     */
    calculateMove(targetPosition, currentPosition, maxSpeed) {
        const diff = targetPosition - currentPosition;

        // Add inaccuracy based on level
        if (this.shouldMakeMistake()) {
            // Make a mistake - move slightly wrong direction or overshoot
            const mistakeAmount = (Math.random() - 0.5) * maxSpeed * 3;
            return Math.max(-maxSpeed, Math.min(maxSpeed, mistakeAmount));
        }

        // Apply accuracy factor - lower accuracy means less precise tracking
        const accuracyFactor = this.config.accuracy;
        const adjustedDiff = diff * accuracyFactor;

        // Clamp to max speed
        return Math.max(-maxSpeed, Math.min(maxSpeed, adjustedDiff));
    }

    /**
     * For Pong: Calculate paddle movement
     */
    calculatePaddleMove(ballY, paddleY, paddleHeight, paddleSpeed) {
        const paddleCenter = paddleY + paddleHeight / 2;
        const targetY = ballY;

        // Add prediction error based on level
        const predictionError = (1 - this.config.accuracy) * 100 * (Math.random() - 0.5);
        const adjustedTarget = targetY + predictionError;

        if (this.shouldMakeMistake()) {
            // Random movement on mistake
            return (Math.random() - 0.5) * paddleSpeed;
        }

        if (paddleCenter < adjustedTarget - 10) {
            return paddleSpeed * this.config.accuracy;
        } else if (paddleCenter > adjustedTarget + 10) {
            return -paddleSpeed * this.config.accuracy;
        }
        return 0;
    }

    /**
     * For Tic-Tac-Toe: Get best move
     * @param {Array} board - 3x3 board array (null, 'X', or 'O')
     * @param {string} aiSymbol - 'X' or 'O'
     */
    getTicTacToeMove(board, aiSymbol) {
        const opponentSymbol = aiSymbol === 'X' ? 'O' : 'X';
        const emptySpots = [];

        for (let i = 0; i < 9; i++) {
            if (!board[i]) emptySpots.push(i);
        }

        if (emptySpots.length === 0) return null;

        // Maybe make a mistake
        if (this.shouldMakeMistake()) {
            return emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }

        // Based on level, use different strategies
        if (this.level >= 4) {
            // Minimax for hard/expert
            return this.minimaxMove(board, aiSymbol, opponentSymbol);
        } else if (this.level >= 2) {
            // Check for winning move, then blocking, then random
            const winMove = this.findWinningMove(board, aiSymbol);
            if (winMove !== null) return winMove;

            const blockMove = this.findWinningMove(board, opponentSymbol);
            if (blockMove !== null && Math.random() < this.config.accuracy) return blockMove;

            // Prefer center, then corners
            if (!board[4] && Math.random() < this.config.accuracy) return 4;
            const corners = [0, 2, 6, 8].filter(i => !board[i]);
            if (corners.length && Math.random() < this.config.accuracy) {
                return corners[Math.floor(Math.random() * corners.length)];
            }
        }

        // Random move
        return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }

    findWinningMove(board, symbol) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (const line of lines) {
            const values = line.map(i => board[i]);
            const symbolCount = values.filter(v => v === symbol).length;
            const emptyCount = values.filter(v => !v).length;

            if (symbolCount === 2 && emptyCount === 1) {
                return line.find(i => !board[i]);
            }
        }
        return null;
    }

    minimaxMove(board, aiSymbol, opponentSymbol) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = aiSymbol;
                const score = this.minimax(board, 0, false, aiSymbol, opponentSymbol);
                board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing, aiSymbol, opponentSymbol) {
        const winner = this.checkWinner(board);
        if (winner === aiSymbol) return 10 - depth;
        if (winner === opponentSymbol) return depth - 10;
        if (board.every(cell => cell)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = aiSymbol;
                    bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false, aiSymbol, opponentSymbol));
                    board[i] = null;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = opponentSymbol;
                    bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true, aiSymbol, opponentSymbol));
                    board[i] = null;
                }
            }
            return bestScore;
        }
    }

    checkWinner(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    /**
     * For Connect Four: Get column to drop
     * @param {Array} board - 6x7 2D array
     * @param {number} aiPiece - AI's piece (1 or 2)
     */
    getConnectFourMove(board, aiPiece) {
        const opponentPiece = aiPiece === 1 ? 2 : 1;
        const validCols = [];

        for (let col = 0; col < 7; col++) {
            if (board[0][col] === 0) validCols.push(col);
        }

        if (validCols.length === 0) return null;

        // Maybe make mistake
        if (this.shouldMakeMistake()) {
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        // Check for winning move
        for (const col of validCols) {
            if (this.simulateWin(board, col, aiPiece)) {
                return col;
            }
        }

        // Block opponent's winning move
        if (Math.random() < this.config.accuracy) {
            for (const col of validCols) {
                if (this.simulateWin(board, col, opponentPiece)) {
                    return col;
                }
            }
        }

        // Prefer center columns
        const centerPreference = [3, 2, 4, 1, 5, 0, 6];
        for (const col of centerPreference) {
            if (validCols.includes(col)) {
                return col;
            }
        }

        return validCols[Math.floor(Math.random() * validCols.length)];
    }

    simulateWin(board, col, piece) {
        // Find the row where piece would land
        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (board[r][col] === 0) {
                row = r;
                break;
            }
        }
        if (row === -1) return false;

        // Temporarily place piece
        board[row][col] = piece;
        const wins = this.checkConnectFourWin(board, row, col, piece);
        board[row][col] = 0;

        return wins;
    }

    checkConnectFourWin(board, row, col, piece) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === piece) {
                    count++;
                } else break;
            }

            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === piece) {
                    count++;
                } else break;
            }

            if (count >= 4) return true;
        }

        return false;
    }
}

// Singleton factory for getting AI instance
let aiInstance = null;

export function getAI(level = 3) {
    if (!aiInstance) {
        aiInstance = new AIOpponent(level);
    } else if (aiInstance.level !== level) {
        aiInstance.setLevel(level);
    }
    return aiInstance;
}

export default AIOpponent;
