/**
 * Local AI Opponent System
 * No cloud services required - all algorithms run locally
 * 
 * Supports multiple games with 5 difficulty levels:
 * - Easy: Random moves with mistakes
 * - Medium: Basic strategy
 * - Hard: Advanced strategy
 * - Expert: Near-optimal play
 * - Impossible: Perfect algorithm (minimax)
 */

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'impossible';

export interface AIMove {
  row?: number;
  col?: number;
  x?: number;
  y?: number;
  action?: string;
  confidence?: number;
}

/**
 * Tic-Tac-Toe AI using Minimax algorithm
 */
export class TicTacToeAI {
  private difficulty: AIDifficulty;
  private playerSymbol: string = 'O';
  private aiSymbol: string = 'X';

  constructor(difficulty: AIDifficulty = 'medium', aiSymbol: string = 'X') {
    this.difficulty = difficulty;
    this.aiSymbol = aiSymbol;
    this.playerSymbol = aiSymbol === 'X' ? 'O' : 'X';
  }

  /**
   * Get best move for AI
   */
  getBestMove(board: string[][]): AIMove {
    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(board);
      case 'medium':
        return Math.random() < 0.5 ? this.getRandomMove(board) : this.getStrategicMove(board);
      case 'hard':
        return Math.random() < 0.8 ? this.getStrategicMove(board) : this.getMinimaxMove(board, 3);
      case 'expert':
        return this.getMinimaxMove(board, 5);
      case 'impossible':
        return this.getMinimaxMove(board, 9);
      default:
        return this.getRandomMove(board);
    }
  }

  private getRandomMove(board: string[][]): AIMove {
    const emptySpots: AIMove[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === '') {
          emptySpots.push({ row, col });
        }
      }
    }
    return emptySpots[Math.floor(Math.random() * emptySpots.length)] || { row: 0, col: 0 };
  }

  private getStrategicMove(board: string[][]): AIMove {
    // Try to win
    const winMove = this.findWinningMove(board, this.aiSymbol);
    if (winMove) return winMove;

    // Block opponent win
    const blockMove = this.findWinningMove(board, this.playerSymbol);
    if (blockMove) return blockMove;

    // Take center if available
    if (board[1][1] === '') return { row: 1, col: 1 };

    // Take corners
    const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
    for (const [row, col] of corners) {
      if (board[row][col] === '') return { row, col };
    }

    // Take any available spot
    return this.getRandomMove(board);
  }

  private findWinningMove(board: string[][], symbol: string): AIMove | null {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === '') {
          board[row][col] = symbol;
          if (this.checkWin(board, symbol)) {
            board[row][col] = '';
            return { row, col };
          }
          board[row][col] = '';
        }
      }
    }
    return null;
  }

  private getMinimaxMove(board: string[][], depth: number): AIMove {
    let bestScore = -Infinity;
    let bestMove: AIMove = { row: 0, col: 0 };

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === '') {
          board[row][col] = this.aiSymbol;
          const score = this.minimax(board, depth, false, -Infinity, Infinity);
          board[row][col] = '';

          if (score > bestScore) {
            bestScore = score;
            bestMove = { row, col, confidence: score };
          }
        }
      }
    }

    return bestMove;
  }

  private minimax(board: string[][], depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
    if (this.checkWin(board, this.aiSymbol)) return 10 - depth;
    if (this.checkWin(board, this.playerSymbol)) return depth - 10;
    if (this.isBoardFull(board)) return 0;
    if (depth === 0) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (board[row][col] === '') {
            board[row][col] = this.aiSymbol;
            const score = this.minimax(board, depth - 1, false, alpha, beta);
            board[row][col] = '';
            maxScore = Math.max(score, maxScore);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
          }
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (board[row][col] === '') {
            board[row][col] = this.playerSymbol;
            const score = this.minimax(board, depth - 1, true, alpha, beta);
            board[row][col] = '';
            minScore = Math.min(score, minScore);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
          }
        }
      }
      return minScore;
    }
  }

  private checkWin(board: string[][], symbol: string): boolean {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (board[row][0] === symbol && board[row][1] === symbol && board[row][2] === symbol) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[0][col] === symbol && board[1][col] === symbol && board[2][col] === symbol) {
        return true;
      }
    }

    // Check diagonals
    if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
      return true;
    }
    if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
      return true;
    }

    return false;
  }

  private isBoardFull(board: string[][]): boolean {
    return board.every(row => row.every(cell => cell !== ''));
  }
}

/**
 * Connect Four AI
 */
export class ConnectFourAI {
  private difficulty: AIDifficulty;
  private aiPlayer: number = 2;
  private humanPlayer: number = 1;

  constructor(difficulty: AIDifficulty = 'medium', aiPlayer: number = 2) {
    this.difficulty = difficulty;
    this.aiPlayer = aiPlayer;
    this.humanPlayer = aiPlayer === 1 ? 2 : 1;
  }

  getBestMove(board: number[][]): AIMove {
    const validMoves = this.getValidColumns(board);
    if (validMoves.length === 0) return { col: 0 };

    switch (this.difficulty) {
      case 'easy':
        return { col: validMoves[Math.floor(Math.random() * validMoves.length)] };
      case 'medium':
        return this.getMediumMove(board, validMoves);
      case 'hard':
        return this.getHardMove(board, validMoves, 4);
      case 'expert':
        return this.getHardMove(board, validMoves, 6);
      case 'impossible':
        return this.getHardMove(board, validMoves, 8);
      default:
        return { col: validMoves[0] };
    }
  }

  private getValidColumns(board: number[][]): number[] {
    const cols: number[] = [];
    for (let col = 0; col < board[0].length; col++) {
      if (board[0][col] === 0) {
        cols.push(col);
      }
    }
    return cols;
  }

  private getMediumMove(board: number[][], validMoves: number[]): AIMove {
    // Try to win
    for (const col of validMoves) {
      const testBoard = this.copyBoard(board);
      this.dropPiece(testBoard, col, this.aiPlayer);
      if (this.checkWin(testBoard, this.aiPlayer)) {
        return { col };
      }
    }

    // Block opponent
    for (const col of validMoves) {
      const testBoard = this.copyBoard(board);
      this.dropPiece(testBoard, col, this.humanPlayer);
      if (this.checkWin(testBoard, this.humanPlayer)) {
        return { col };
      }
    }

    // Prefer center
    if (validMoves.includes(3)) return { col: 3 };

    return { col: validMoves[Math.floor(Math.random() * validMoves.length)] };
  }

  private getHardMove(board: number[][], validMoves: number[], depth: number): AIMove {
    let bestScore = -Infinity;
    let bestCol = validMoves[0];

    for (const col of validMoves) {
      const testBoard = this.copyBoard(board);
      this.dropPiece(testBoard, col, this.aiPlayer);
      const score = this.minimaxConnectFour(testBoard, depth - 1, -Infinity, Infinity, false);

      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }

    return { col: bestCol, confidence: bestScore };
  }

  private minimaxConnectFour(board: number[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (this.checkWin(board, this.aiPlayer)) return 1000 + depth;
    if (this.checkWin(board, this.humanPlayer)) return -1000 - depth;
    if (depth === 0 || this.getValidColumns(board).length === 0) {
      return this.evaluateBoard(board);
    }

    const validMoves = this.getValidColumns(board);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const col of validMoves) {
        const testBoard = this.copyBoard(board);
        this.dropPiece(testBoard, col, this.aiPlayer);
        const score = this.minimaxConnectFour(testBoard, depth - 1, alpha, beta, false);
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const col of validMoves) {
        const testBoard = this.copyBoard(board);
        this.dropPiece(testBoard, col, this.humanPlayer);
        const score = this.minimaxConnectFour(testBoard, depth - 1, alpha, beta, true);
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  private evaluateBoard(board: number[][]): number {
    let score = 0;
    // Center column preference
    const centerCol = Math.floor(board[0].length / 2);
    for (let row = 0; row < board.length; row++) {
      if (board[row][centerCol] === this.aiPlayer) score += 3;
    }
    return score;
  }

  private dropPiece(board: number[][], col: number, player: number): boolean {
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col] === 0) {
        board[row][col] = player;
        return true;
      }
    }
    return false;
  }

  private checkWin(board: number[][], player: number): boolean {
    // Check horizontal
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length - 3; col++) {
        if (board[row][col] === player &&
            board[row][col + 1] === player &&
            board[row][col + 2] === player &&
            board[row][col + 3] === player) {
          return true;
        }
      }
    }

    // Check vertical
    for (let row = 0; row < board.length - 3; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col] === player &&
            board[row + 1][col] === player &&
            board[row + 2][col] === player &&
            board[row + 3][col] === player) {
          return true;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < board.length - 3; row++) {
      for (let col = 0; col < board[0].length - 3; col++) {
        if (board[row][col] === player &&
            board[row + 1][col + 1] === player &&
            board[row + 2][col + 2] === player &&
            board[row + 3][col + 3] === player) {
          return true;
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < board.length - 3; row++) {
      for (let col = 3; col < board[0].length; col++) {
        if (board[row][col] === player &&
            board[row + 1][col - 1] === player &&
            board[row + 2][col - 2] === player &&
            board[row + 3][col - 3] === player) {
          return true;
        }
      }
    }

    return false;
  }

  private copyBoard(board: number[][]): number[][] {
    return board.map(row => [...row]);
  }
}

/**
 * Pong AI with difficulty-based paddle tracking
 */
export class PongAI {
  private difficulty: AIDifficulty;
  private reactionSpeed: number = 0.5;
  private accuracy: number = 0.5;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
    this.setDifficultyParams();
  }

  private setDifficultyParams() {
    switch (this.difficulty) {
      case 'easy':
        this.reactionSpeed = 0.3;
        this.accuracy = 0.5;
        break;
      case 'medium':
        this.reactionSpeed = 0.5;
        this.accuracy = 0.7;
        break;
      case 'hard':
        this.reactionSpeed = 0.7;
        this.accuracy = 0.85;
        break;
      case 'expert':
        this.reactionSpeed = 0.9;
        this.accuracy = 0.95;
        break;
      case 'impossible':
        this.reactionSpeed = 1.0;
        this.accuracy = 1.0;
        break;
    }
  }

  getPaddleMove(paddleY: number, ballY: number, paddleHeight: number): number {
    // Add some randomness based on accuracy
    const targetY = ballY + (Math.random() - 0.5) * paddleHeight * (1 - this.accuracy);
    const center = paddleY + paddleHeight / 2;
    
    // Move towards target based on reaction speed
    if (targetY < center - 5) {
      return -this.reactionSpeed * 5;
    } else if (targetY > center + 5) {
      return this.reactionSpeed * 5;
    }
    return 0;
  }
}

/**
 * Export AI manager for easy use
 */
export class AIManager {
  static createTicTacToeAI(difficulty: AIDifficulty, aiSymbol: string = 'X'): TicTacToeAI {
    return new TicTacToeAI(difficulty, aiSymbol);
  }

  static createConnectFourAI(difficulty: AIDifficulty, aiPlayer: number = 2): ConnectFourAI {
    return new ConnectFourAI(difficulty, aiPlayer);
  }

  static createPongAI(difficulty: AIDifficulty): PongAI {
    return new PongAI(difficulty);
  }
}

export default AIManager;
