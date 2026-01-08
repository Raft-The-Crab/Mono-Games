// Texas Hold'em Poker Game - Professional Implementation
export default class Poker {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Game state
  private deck: Card[] = [];
  private playerHand: Card[] = [];
  private opponentHand: Card[] = [];
  private communityCards: Card[] = [];
  private pot: number = 0;
  private playerChips: number = 1000;
  private opponentChips: number = 1000;
  private currentBet: number = 0;
  private playerBet: number = 0;
  private opponentBet: number = 0;
  private gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'gameover' = 'preflop';
  
  // UI state
  private message: string = 'Welcome to Texas Hold\'em!';
  
  // Callbacks
  public onScoreUpdate?: (score: number) => void;
  public onGameOver?: (finalScore: number) => void;
  
  private score: number = 0;
  private highScore: number = 0;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.background = '#0B5F31';
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');
    this.ctx = ctx;

    this.loadHighScore();
    this.setupInput();
  }

  private setupInput(): void {
    this.canvas.addEventListener('click', (e) => {
      if (this.isPaused || !this.isRunning) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      this.handleClick(x, y);
    });
  }

  private handleClick(x: number, y: number): void {
    // Button positions (bottom of screen)
    const buttonY = 520;
    const buttonHeight = 60;
    const buttonWidth = 150;
    
    if (y >= buttonY && y <= buttonY + buttonHeight) {
      // Fold button (left)
      if (x >= 50 && x <= 50 + buttonWidth) {
        this.fold();
      }
      // Call button (middle)
      else if (x >= 225 && x <= 225 + buttonWidth) {
        this.call();
      }
      // Raise button (right)
      else if (x >= 400 && x <= 400 + buttonWidth) {
        this.raise(this.currentBet * 2);
      }
      // All-in button (far right)
      else if (x >= 575 && x <= 575 + buttonWidth) {
        this.allIn();
      }
    }
  }

  setup(): void {
    this.isRunning = true;
    this.isPaused = false;
    this.score = this.playerChips;
    this.startNewRound();
  }

  private startNewRound(): void {
    if (this.playerChips < 10 || this.opponentChips < 10) {
      this.gameOver();
      return;
    }

    this.deck = this.createDeck();
    this.shuffleDeck();
    this.playerHand = [this.deck.pop()!, this.deck.pop()!];
    this.opponentHand = [this.deck.pop()!, this.deck.pop()!];
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 10; // Small blind
    this.playerBet = 10;
    this.opponentBet = 20; // Big blind
    this.pot = 30;
    this.playerChips -= 10;
    this.opponentChips -= 20;
    this.gamePhase = 'preflop';
    this.message = 'Your turn - Call, Raise, or Fold';
  }

  private createDeck(): Card[] {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, value: this.getCardValue(rank) });
      }
    }
    
    return deck;
  }

  private getCardValue(rank: Rank): number {
    const values: Record<Rank, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank];
  }

  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private fold(): void {
    this.message = 'You folded! Opponent wins';
    this.opponentChips += this.pot;
    setTimeout(() => this.startNewRound(), 2000);
  }

  private call(): void {
    const callAmount = this.opponentBet - this.playerBet;
    if (callAmount > this.playerChips) {
      this.allIn();
      return;
    }
    
    this.playerChips -= callAmount;
    this.playerBet += callAmount;
    this.pot += callAmount;
    this.advancePhase();
  }

  private raise(amount: number): void {
    const raiseAmount = Math.min(amount, this.playerChips);
    this.playerChips -= raiseAmount;
    this.playerBet += raiseAmount;
    this.pot += raiseAmount;
    this.currentBet = this.playerBet;
    
    // AI decision
    this.opponentAction();
  }

  private allIn(): void {
    this.pot += this.playerChips;
    this.playerBet += this.playerChips;
    this.playerChips = 0;
    this.opponentAction();
  }

  private opponentAction(): void {
    const handStrength = this.evaluateHand([...this.opponentHand, ...this.communityCards]).rank;
    const random = Math.random();
    
    if (handStrength >= 5 || random > 0.7) {
      // Call or raise
      if (random > 0.5 && this.opponentChips > this.currentBet * 2) {
        const raiseAmount = Math.min(this.currentBet * 2, this.opponentChips);
        this.opponentChips -= raiseAmount;
        this.opponentBet += raiseAmount;
        this.pot += raiseAmount;
        this.message = `Opponent raises ${raiseAmount}!`;
      } else {
        const callAmount = this.playerBet - this.opponentBet;
        const amount = Math.min(callAmount, this.opponentChips);
        this.opponentChips -= amount;
        this.opponentBet += amount;
        this.pot += amount;
        this.message = 'Opponent calls';
      }
      setTimeout(() => this.advancePhase(), 1500);
    } else if (random > 0.4) {
      // Call
      const callAmount = this.playerBet - this.opponentBet;
      const amount = Math.min(callAmount, this.opponentChips);
      this.opponentChips -= amount;
      this.opponentBet += amount;
      this.pot += amount;
      this.message = 'Opponent calls';
      setTimeout(() => this.advancePhase(), 1500);
    } else {
      // Fold
      this.message = 'Opponent folds! You win';
      this.playerChips += this.pot;
      setTimeout(() => this.startNewRound(), 2000);
    }
  }

  private advancePhase(): void {
    if (this.gamePhase === 'preflop') {
      this.communityCards = [this.deck.pop()!, this.deck.pop()!, this.deck.pop()!];
      this.gamePhase = 'flop';
      this.playerBet = 0;
      this.opponentBet = 0;
      this.message = 'Flop revealed!';
    } else if (this.gamePhase === 'flop') {
      this.communityCards.push(this.deck.pop()!);
      this.gamePhase = 'turn';
      this.playerBet = 0;
      this.opponentBet = 0;
      this.message = 'Turn revealed!';
    } else if (this.gamePhase === 'turn') {
      this.communityCards.push(this.deck.pop()!);
      this.gamePhase = 'river';
      this.playerBet = 0;
      this.opponentBet = 0;
      this.message = 'River revealed!';
    } else if (this.gamePhase === 'river') {
      this.showdown();
    }
  }

  private showdown(): void {
    this.gamePhase = 'showdown';
    
    const playerHandEval = this.evaluateHand([...this.playerHand, ...this.communityCards]);
    const opponentHandEval = this.evaluateHand([...this.opponentHand, ...this.communityCards]);
    
    if (playerHandEval.rank > opponentHandEval.rank) {
      this.message = `You win with ${playerHandEval.name}!`;
      this.playerChips += this.pot;
    } else if (playerHandEval.rank < opponentHandEval.rank) {
      this.message = `Opponent wins with ${opponentHandEval.name}`;
      this.opponentChips += this.pot;
    } else {
      // Compare high cards
      if (playerHandEval.highCard > opponentHandEval.highCard) {
        this.message = `You win with ${playerHandEval.name}!`;
        this.playerChips += this.pot;
      } else {
        this.message = `Opponent wins with ${opponentHandEval.name}`;
        this.opponentChips += this.pot;
      }
    }
    
    this.score = this.playerChips;
    this.onScoreUpdate?.(this.score);
    
    setTimeout(() => this.startNewRound(), 3000);
  }

  private evaluateHand(cards: Card[]): { rank: number; name: string; highCard: number } {
    // Simple hand evaluation (could be expanded)
    const values = cards.map(c => c.value).sort((a, b) => b - a);
    const suits = cards.map(c => c.suit);
    
    // Check for flush
    const isFlush = suits.filter(s => s === suits[0]).length >= 5;
    
    // Check for straight
    let isStraight = false;
    for (let i = 0; i < values.length - 4; i++) {
      if (values[i] - values[i + 4] === 4) {
        isStraight = true;
        break;
      }
    }
    
    // Count pairs, trips, quads
    const counts = new Map<number, number>();
    values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    const maxCount = Math.max(...counts.values());
    const pairs = Array.from(counts.values()).filter(c => c === 2).length;
    
    if (isFlush && isStraight) return { rank: 8, name: 'Straight Flush', highCard: values[0] };
    if (maxCount === 4) return { rank: 7, name: 'Four of a Kind', highCard: values[0] };
    if (maxCount === 3 && pairs >= 1) return { rank: 6, name: 'Full House', highCard: values[0] };
    if (isFlush) return { rank: 5, name: 'Flush', highCard: values[0] };
    if (isStraight) return { rank: 4, name: 'Straight', highCard: values[0] };
    if (maxCount === 3) return { rank: 3, name: 'Three of a Kind', highCard: values[0] };
    if (pairs >= 2) return { rank: 2, name: 'Two Pair', highCard: values[0] };
    if (pairs === 1) return { rank: 1, name: 'Pair', highCard: values[0] };
    return { rank: 0, name: 'High Card', highCard: values[0] };
  }

  update(_deltaTime: number): void {
    if (!this.isRunning || this.isPaused) return;
  }

  render(): void {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw poker table
    this.ctx.fillStyle = '#0B5F31';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw table outline
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 20;
    this.ctx.strokeRect(50, 150, 700, 300);
    
    // Draw pot
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Pot: $${this.pot}`, 400, 100);
    
    // Draw community cards
    let cardX = 250;
    for (const card of this.communityCards) {
      this.drawCard(cardX, 250, card, false);
      cardX += 70;
    }
    
    // Draw player hand
    this.drawCard(300, 450, this.playerHand[0], false);
    this.drawCard(400, 450, this.playerHand[1], false);
    
    // Draw opponent hand (hidden unless showdown)
    const showOpponent = this.gamePhase === 'showdown';
    this.drawCard(300, 50, this.opponentHand[0], !showOpponent);
    this.drawCard(400, 50, this.opponentHand[1], !showOpponent);
    
    // Draw chip counts
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Your Chips: $${this.playerChips}`, 50, 580);
    this.ctx.fillText(`Opponent Chips: $${this.opponentChips}`, 550, 30);
    
    // Draw message
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.message, 400, 200);
    
    // Draw action buttons
    this.drawButton(50, 520, 'Fold', '#FF4444');
    this.drawButton(225, 520, `Call $${Math.max(0, this.opponentBet - this.playerBet)}`, '#44AA44');
    this.drawButton(400, 520, 'Raise', '#4444FF');
    this.drawButton(575, 520, 'All-In', '#FF8800');
  }

  private drawCard(x: number, y: number, card: Card, hidden: boolean): void {
    const width = 50;
    const height = 70;
    
    // Card background
    this.ctx.fillStyle = hidden ? '#3333AA' : '#FFFFFF';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    if (!hidden) {
      // Draw rank and suit
      this.ctx.fillStyle = (card.suit === '♥' || card.suit === '♦') ? '#FF0000' : '#000000';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(card.rank, x + width / 2, y + 25);
      this.ctx.font = '20px Arial';
      this.ctx.fillText(card.suit, x + width / 2, y + 50);
    }
  }

  private drawButton(x: number, y: number, text: string, color: string): void {
    const width = 150;
    const height = 60;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, width, height);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x + width / 2, y + height / 2 + 7);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  restart(): void {
    this.playerChips = 1000;
    this.opponentChips = 1000;
    this.score = 1000;
    this.setup();
  }

  private gameOver(): void {
    this.isRunning = false;
    this.gamePhase = 'gameover';
    
    if (this.playerChips > this.opponentChips) {
      this.message = 'You won the game!';
      this.score = this.playerChips;
    } else {
      this.message = 'Opponent won the game!';
      this.score = 0;
    }
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.onGameOver?.(this.score);
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('poker_highscore');
    this.highScore = saved ? parseInt(saved, 10) : 0;
  }

  private saveHighScore(): void {
    localStorage.setItem('poker_highscore', this.highScore.toString());
  }

  destroy(): void {
    this.isRunning = false;
    this.canvas.remove();
  }

  setOnScoreUpdate(callback: (score: number) => void): void {
    this.onScoreUpdate = callback;
  }

  setOnGameOver(callback: (finalScore: number) => void): void {
    this.onGameOver = callback;
  }

  setOnLevelComplete(_callback: (level: number) => void): void {
    // Not used in poker
  }
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}
