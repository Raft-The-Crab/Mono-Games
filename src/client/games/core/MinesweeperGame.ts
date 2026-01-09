/**
 * Minesweeper Game
 * Classic mine-finding puzzle with multiple difficulties
 * Click to reveal, right-click to flag
 */

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const DIFFICULTY_SETTINGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
  expert: { rows: 24, cols: 30, mines: 150 }
};

export class MinesweeperGame {
  name = 'Minesweeper';
  description = 'Find all mines without detonating them!';
  category = 'puzzle' as const;
  difficulty = 'medium' as const;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId: number | null = null;

  private currentDifficulty: Difficulty = 'easy';
  private rows = 9;
  private cols = 9;
  private totalMines = 10;
  private cellSize = 30;
  private grid: Cell[][] = [];

  private isGameOver = false;
  private isWin = false;
  private firstClick = true;
  private flagCount = 0;
  private revealedCount = 0;
  private startTime = 0;
  private elapsedTime = 0;
  private timerInterval: number | null = null;

  init(container: HTMLElement): void {
    // Create difficulty selector
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.cssText = 'margin-bottom: 10px; text-align: center;';
    
    const difficultyLabel = document.createElement('label');
    difficultyLabel.textContent = 'Difficulty: ';
    difficultyLabel.style.cssText = 'font-family: Comic Sans MS; font-size: 16px; margin-right: 10px;';
    
    const difficultySelect = document.createElement('select');
    difficultySelect.style.cssText = 'padding: 5px 10px; font-family: Comic Sans MS; border-radius: 5px;';
    ['easy', 'medium', 'hard', 'expert'].forEach(diff => {
      const option = document.createElement('option');
      option.value = diff;
      option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
      if (diff === 'easy') option.selected = true;
      difficultySelect.appendChild(option);
    });
    
    difficultySelect.addEventListener('change', (e) => {
      this.currentDifficulty = (e.target as HTMLSelectElement).value as Difficulty;
      this.reset();
    });
    
    difficultyContainer.appendChild(difficultyLabel);
    difficultyContainer.appendChild(difficultySelect);
    container.appendChild(difficultyContainer);

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.updateCanvasSize();
    this.canvas.style.border = '3px solid #333';
    this.canvas.style.borderRadius = '8px';
    this.canvas.style.cursor = 'pointer';
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Mouse controls
    this.canvas.addEventListener('click', (e) => this.handleClick(e, false));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleClick(e, true);
    });
  }

  private updateCanvasSize(): void {
    const settings = DIFFICULTY_SETTINGS[this.currentDifficulty];
    this.rows = settings.rows;
    this.cols = settings.cols;
    this.totalMines = settings.mines;
    
    this.canvas.width = this.cols * this.cellSize + 1;
    this.canvas.height = this.rows * this.cellSize + 50; // Extra space for UI
  }

  start(): void {
    this.reset();
    this.render();
  }

  pause(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resume(): void {
    if (!this.isGameOver && !this.timerInterval) {
      this.startTimer();
    }
  }

  reset(): void {
    this.updateCanvasSize();
    this.initializeGrid();
    this.isGameOver = false;
    this.isWin = false;
    this.firstClick = true;
    this.flagCount = 0;
    this.revealedCount = 0;
    this.elapsedTime = 0;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    this.render();
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.canvas.remove();
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = {
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }
  }

  private placeMines(avoidRow: number, avoidCol: number): void {
    let minesPlaced = 0;
    
    while (minesPlaced < this.totalMines) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      
      // Don't place mine on first click or adjacent cells
      const isAdjacentToFirst = Math.abs(row - avoidRow) <= 1 && Math.abs(col - avoidCol) <= 1;
      
      if (!this.grid[row][col].isMine && !isAdjacentToFirst) {
        this.grid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor counts
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col].isMine) {
          this.grid[row][col].neighborMines = this.countNeighborMines(row, col);
        }
      }
    }
  }

  private countNeighborMines(row: number, col: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const newRow = row + dr;
        const newCol = col + dc;
        if (this.isValidCell(newRow, newCol) && this.grid[newRow][newCol].isMine) {
          count++;
        }
      }
    }
    return count;
  }

  private isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  private handleClick(e: MouseEvent, isRightClick: boolean): void {
    if (this.isGameOver) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - 50; // Account for UI space

    if (y < 0) return; // Clicked in UI area

    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (!this.isValidCell(row, col)) return;

    const cell = this.grid[row][col];

    if (isRightClick) {
      // Flag/unflag
      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
        this.flagCount += cell.isFlagged ? 1 : -1;
      }
    } else {
      // Reveal cell
      if (cell.isFlagged) return;

      // Place mines on first click
      if (this.firstClick) {
        this.placeMines(row, col);
        this.firstClick = false;
        this.startTimer();
      }

      this.revealCell(row, col);
    }

    this.render();
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.timerInterval = window.setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.render();
    }, 100);
  }

  private revealCell(row: number, col: number): void {
    if (!this.isValidCell(row, col)) return;

    const cell = this.grid[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    this.revealedCount++;

    if (cell.isMine) {
      this.gameOver(false);
      return;
    }

    // Auto-reveal adjacent cells if no neighbor mines
    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            this.revealCell(row + dr, col + dc);
          }
        }
      }
    }

    // Check win condition
    if (this.revealedCount === this.rows * this.cols - this.totalMines) {
      this.gameOver(true);
    }
  }

  private gameOver(win: boolean): void {
    this.isGameOver = true;
    this.isWin = win;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Reveal all mines
    if (!win) {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (this.grid[row][col].isMine) {
            this.grid[row][col].isRevealed = true;
          }
        }
      }
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw UI panel
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);

    // Draw mine counter
    this.ctx.fillStyle = '#E74C3C';
    this.ctx.font = 'bold 20px Comic Sans MS';
    this.ctx.fillText(`💣 ${this.totalMines - this.flagCount}`, 10, 30);

    // Draw timer
    this.ctx.fillStyle = '#3498DB';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`⏱️ ${this.elapsedTime}s`, this.canvas.width - 10, 30);
    this.ctx.textAlign = 'left';

    // Draw grid
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.drawCell(this.grid[row][col]);
      }
    }

    // Draw game over overlay
    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 50, this.canvas.width, this.canvas.height - 50);

      this.ctx.textAlign = 'center';
      if (this.isWin) {
        this.ctx.fillStyle = '#2ECC71';
        this.ctx.font = 'bold 32px Comic Sans MS';
        this.ctx.fillText('🎉 YOU WIN! 🎉', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillText(`Time: ${this.elapsedTime}s`, this.canvas.width / 2, this.canvas.height / 2 + 40);
      } else {
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.font = 'bold 32px Comic Sans MS';
        this.ctx.fillText('💥 GAME OVER 💥', this.canvas.width / 2, this.canvas.height / 2);
      }
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '16px Comic Sans MS';
      this.ctx.fillText('Click Reset to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
      this.ctx.textAlign = 'left';
    }
  }

  private drawCell(cell: Cell): void {
    const x = cell.col * this.cellSize;
    const y = cell.row * this.cellSize + 50; // Offset for UI

    if (cell.isRevealed) {
      if (cell.isMine) {
        // Mine cell
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        this.ctx.fillStyle = 'black';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💣', x + this.cellSize / 2, y + this.cellSize / 2);
      } else {
        // Revealed empty cell
        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

        if (cell.neighborMines > 0) {
          const colors = ['', '#0074D9', '#2ECC40', '#FF4136', '#B10DC9', '#FF851B', '#FFDC00', '#001f3f', '#85144b'];
          this.ctx.fillStyle = colors[cell.neighborMines];
          this.ctx.font = 'bold 18px Comic Sans MS';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(cell.neighborMines.toString(), x + this.cellSize / 2, y + this.cellSize / 2);
        }
      }
    } else {
      // Unrevealed cell
      this.ctx.fillStyle = '#95A5A6';
      this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
      
      // Highlight effect
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize / 2 - 2);

      if (cell.isFlagged) {
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚩', x + this.cellSize / 2, y + this.cellSize / 2);
      }
    }

    // Cell border
    this.ctx.strokeStyle = '#7F8C8D';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
  }

  getScore(): number {
    if (this.isWin) {
      // Score based on difficulty and time
      const baseScore = this.totalMines * 10;
      const timeBonus = Math.max(0, 1000 - this.elapsedTime * 2);
      return baseScore + timeBonus;
    }
    return 0;
  }

  isOver(): boolean {
    return this.isGameOver;
  }
}

export default MinesweeperGame;
