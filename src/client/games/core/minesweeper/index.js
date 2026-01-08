import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Minesweeper - Classic Puzzle Game
 */
class MinesweeperGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'minesweeper', 500, 600);
    
    this.gridSize = 10;
    this.mineCount = 15;
    this.cellSize = 45;
    this.grid = [];
    this.revealed = [];
    this.flagged = [];
    this.gameWon = false;
    this.gameLost = false;
    this.firstClick = true;
  }

  setup() {
    this.grid = [];
    this.revealed = [];
    this.flagged = [];
    this.gameWon = false;
    this.gameLost = false;
    this.firstClick = true;
    this.score = 0;
    
    // Initialize empty grid
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      this.revealed[row] = [];
      this.flagged[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = 0;
        this.revealed[row][col] = false;
        this.flagged[row][col] = false;
      }
    }
    
    this.setupControls();
  }

  setupControls() {
    this.addKeyHandler('r', () => this.reset());
    
    // Mouse controls
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(e);
    });
  }

  placeMines(avoidRow, avoidCol) {
    let placed = 0;
    while (placed < this.mineCount) {
      const row = Math.floor(Math.random() * this.gridSize);
      const col = Math.floor(Math.random() * this.gridSize);
      
      // Don't place mine on first click or where mine already exists
      if ((row === avoidRow && col === avoidCol) || this.grid[row][col] === -1) {
        continue;
      }
      
      this.grid[row][col] = -1;
      placed++;
      
      // Update adjacent cell counts
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (this.isValidCell(newRow, newCol) && this.grid[newRow][newCol] !== -1) {
            this.grid[newRow][newCol]++;
          }
        }
      }
    }
  }

  isValidCell(row, col) {
    return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
  }

  handleClick(e) {
    if (this.gameLost || this.gameWon) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - 50; // Account for header
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (!this.isValidCell(row, col) || this.flagged[row][col]) return;
    
    if (this.firstClick) {
      this.placeMines(row, col);
      this.firstClick = false;
    }
    
    this.revealCell(row, col);
  }

  handleRightClick(e) {
    if (this.gameLost || this.gameWon) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - 50;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (!this.isValidCell(row, col) || this.revealed[row][col]) return;
    
    this.flagged[row][col] = !this.flagged[row][col];
  }

  revealCell(row, col) {
    if (!this.isValidCell(row, col) || this.revealed[row][col]) return;
    
    this.revealed[row][col] = true;
    
    // Hit a mine
    if (this.grid[row][col] === -1) {
      this.gameLost = true;
      this.revealAllMines();
      this.endGame('Game Over! 💣');
      return;
    }
    
    // Empty cell - reveal neighbors
    if (this.grid[row][col] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            this.revealCell(row + dr, col + dc);
          }
        }
      }
    }
    
    // Check win condition
    this.checkWin();
  }

  revealAllMines() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === -1) {
          this.revealed[row][col] = true;
        }
      }
    }
  }

  checkWin() {
    let revealedCount = 0;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.revealed[row][col] && this.grid[row][col] !== -1) {
          revealedCount++;
        }
      }
    }
    
    const totalSafe = this.gridSize * this.gridSize - this.mineCount;
    if (revealedCount === totalSafe) {
      this.gameWon = true;
      this.score = 100;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      this.endGame('You Win! 🎉');
    }
  }

  update(deltaTime) {
    // Game is mostly event-driven
  }

  render() {
    this.clearCanvas();
    
    // Background
    this.drawRect(0, 0, this.width, this.height, '#E8E8E8');
    
    // Header
    this.drawRect(0, 0, this.width, 50, '#4A4A4A');
    this.drawText('Minesweeper', this.width / 2, 25, {
      font: 'bold 24px Arial',
      color: '#FFD700'
    });
    
    // Grid
    const offsetX = (this.width - this.gridSize * this.cellSize) / 2;
    const offsetY = 60;
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = offsetX + col * this.cellSize;
        const y = offsetY + row * this.cellSize;
        
        // Draw cell background
        if (this.revealed[row][col]) {
          if (this.grid[row][col] === -1) {
            this.drawRect(x, y, this.cellSize - 2, this.cellSize - 2, '#FF6B6B');
          } else {
            this.drawRect(x, y, this.cellSize - 2, this.cellSize - 2, '#D0D0D0');
          }
        } else {
          this.drawRect(x, y, this.cellSize - 2, this.cellSize - 2, '#9E9E9E');
        }
        
        // Draw cell border
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this.cellSize - 2, this.cellSize - 2);
        
        // Draw content
        if (this.revealed[row][col] && this.grid[row][col] > 0) {
          const colors = ['', '#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
          this.drawText(
            this.grid[row][col].toString(),
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            {
              font: 'bold 20px Arial',
              color: colors[this.grid[row][col]]
            }
          );
        } else if (this.revealed[row][col] && this.grid[row][col] === -1) {
          this.drawText('💣', x + this.cellSize / 2, y + this.cellSize / 2, {
            font: '24px Arial'
          });
        } else if (this.flagged[row][col]) {
          this.drawText('🚩', x + this.cellSize / 2, y + this.cellSize / 2, {
            font: '24px Arial'
          });
        }
      }
    }
    
    // Instructions
    if (this.firstClick) {
      this.drawRect(this.width / 2 - 120, this.height - 70, 240, 60, 'rgba(0, 0, 0, 0.8)');
      this.drawText('Left click: Reveal', this.width / 2, this.height - 50, {
        font: '14px Arial',
        color: '#FFFFFF'
      });
      this.drawText('Right click: Flag', this.width / 2, this.height - 30, {
        font: '14px Arial',
        color: '#FFFFFF'
      });
    }
  }
}

export default MinesweeperGame;
