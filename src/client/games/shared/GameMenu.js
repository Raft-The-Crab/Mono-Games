// Enhanced 2D Game Menu System - SUPER CARTOONY!
// Add to all 2D games for pause, settings, and more

export class GameMenu {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.menuType = null; // 'pause', 'settings', 'gameover', 'victory'
        this.selectedOption = 0;
        this.options = [];
        this.setupStyles();
    }

    setupStyles() {
        // Add cartoony menu styles
        const style = document.createElement('style');
        style.id = 'game-menu-styles';
        if (!document.getElementById('game-menu-styles')) {
            style.textContent = `
        .game-menu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .game-menu-container {
          background: linear-gradient(135deg, #FFD93D, #FFA07A);
          border: 8px solid #2C3E50;
          border-radius: 40px;
          padding: 3rem;
          min-width: 400px;
          box-shadow: 
            0 15px 0 #2C3E50,
            0 25px 50px rgba(0,0,0,0.5);
          animation: menuBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          font-family: 'Comic Sans MS', cursive;
        }

        .game-menu-title {
          font-size: 3rem;
          color: #2C3E50;
          text-align: center;
          margin: 0 0 2rem 0;
          text-shadow: 4px 4px 0 rgba(255,255,255,0.5);
          font-weight: 900;
          animation: wiggle 2s ease-in-out infinite;
        }

        .game-menu-option {
          background: white;
          border: 5px solid #2C3E50;
          border-radius: 24px;
          padding: 1.5rem 2rem;
          margin: 1rem 0;
          font-size: 1.5rem;
          font-weight: 900;
          color: #2C3E50;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 6px 0 #2C3E50;
          text-align: center;
        }

        .game-menu-option:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 0 #2C3E50;
          background: linear-gradient(135deg, #4ECDC4, #44A08D);
          color: white;
        }

        .game-menu-option.selected {
          transform: translateY(-6px) scale(1.08) rotate(-2deg);
          background: linear-gradient(135deg, #4ECDC4, #44A08D);
          color: white;
          box-shadow: 0 12px 0 #2C3E50;
        }

        .game-menu-stats {
          background: rgba(0,0,0,0.2);
          border-radius: 20px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: center;
        }

        .game-menu-stat {
          display: inline-block;
          margin: 0 1.5rem;
          font-size: 1.3rem;
          font-weight: 900;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes menuBounceIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `;
            document.head.appendChild(style);
        }
    }

    show(type = 'pause') {
        this.isOpen = true;
        this.menuType = type;
        this.setupMenuOptions(type);
        this.render();
    }

    hide() {
        this.isOpen = false;
        const overlay = document.getElementById('game-menu-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    setupMenuOptions(type) {
        switch (type) {
            case 'pause':
                this.options = [
                    { text: '▶️ Resume', action: () => this.resume() },
                    { text: '🔄 Restart', action: () => this.restart() },
                    { text: '⚙️ Settings', action: () => this.showSettings() },
                    { text: '🏠 Main Menu', action: () => this.mainMenu() }
                ];
                break;
            case 'gameover':
                this.options = [
                    { text: '🔄 Try Again', action: () => this.restart() },
                    { text: '📊 View Stats', action: () => this.showStats() },
                    { text: '🏠 Main Menu', action: () => this.mainMenu() }
                ];
                break;
            case 'victory':
                this.options = [
                    { text: '🎉 Next Level', action: () => this.nextLevel() },
                    { text: '🔄 Play Again', action: () => this.restart() },
                    { text: '🏠 Main Menu', action: () => this.mainMenu() }
                ];
                break;
            case 'settings':
                this.options = [
                    { text: '🔊 Sound: ON', action: () => this.toggleSound() },
                    { text: '🎵 Music: ON', action: () => this.toggleMusic() },
                    { text: '📈 Difficulty: Normal', action: () => this.cycleDifficulty() },
                    { text: '◀️ Back', action: () => this.show('pause') }
                ];
                break;
        }
    }

    render() {
        // Remove existing overlay if any
        this.hide();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'game-menu-overlay';
        overlay.className = 'game-menu-overlay';

        // Create menu container
        const container = document.createElement('div');
        container.className = 'game-menu-container';

        // Add title
        const title = document.createElement('h1');
        title.className = 'game-menu-title';
        title.textContent = this.getTitle();
        container.appendChild(title);

        // Add stats if game over or victory
        if (this.menuType === 'gameover' || this.menuType === 'victory') {
            const stats = document.createElement('div');
            stats.className = 'game-menu-stats';

            const score = document.createElement('div');
            score.className = 'game-menu-stat';
            score.textContent = `🏆 Score: ${this.game.score || 0}`;
            stats.appendChild(score);

            const highScore = document.createElement('div');
            highScore.className = 'game-menu-stat';
            highScore.textContent = `⭐ Best: ${this.game.highScore || 0}`;
            stats.appendChild(highScore);

            container.appendChild(stats);
        }

        // Add options
        this.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'game-menu-option';
            if (index === this.selectedOption) {
                btn.classList.add('selected');
            }
            btn.textContent = option.text;
            btn.onclick = () => {
                this.playSound('click');
                option.action();
            };
            btn.onmouseenter = () => {
                this.selectedOption = index;
                this.playSound('hover');
                this.updateSelection();
            };
            container.appendChild(btn);
        });

        overlay.appendChild(container);
        this.game.canvas.parentElement.appendChild(overlay);
    }

    getTitle() {
        switch (this.menuType) {
            case 'pause': return '⏸️ Paused';
            case 'gameover': return '💀 Game Over!';
            case 'victory': return '🎉 Victory!';
            case 'settings': return '⚙️ Settings';
            default: return 'Menu';
        }
    }

    updateSelection() {
        const options = document.querySelectorAll('.game-menu-option');
        options.forEach((opt, i) => {
            if (i === this.selectedOption) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    // Menu actions
    resume() {
        this.hide();
        this.game.paused = false;
    }

    restart() {
        this.hide();
        this.game.setup();
        this.game.paused = false;
    }

    nextLevel() {
        this.hide();
        if (this.game.nextLevel) {
            this.game.nextLevel();
        }
    }

    showSettings() {
        this.show('settings');
    }

    showStats() {
        // Could open a stats panel
        console.log('Stats panel');
    }

    mainMenu() {
        window.location.href = '/launcher';
    }

    toggleSound() {
        // Toggle sound
        console.log('Toggle sound');
    }

    toggleMusic() {
        // Toggle music
        console.log('Toggle music');
    }

    cycleDifficulty() {
        // Cycle difficulty
        console.log('Cycle difficulty');
    }

    playSound(type) {
        // Play UI sounds
        console.log(`Play ${type} sound`);
    }

    // Keyboard navigation
    handleKeyPress(key) {
        if (!this.isOpen) return;

        switch (key) {
            case 'ArrowUp':
                this.selectedOption = Math.max(0, this.selectedOption - 1);
                this.updateSelection();
                this.playSound('hover');
                break;
            case 'ArrowDown':
                this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
                this.updateSelection();
                this.playSound('hover');
                break;
            case 'Enter':
            case ' ':
                this.options[this.selectedOption].action();
                this.playSound('click');
                break;
            case 'Escape':
                if (this.menuType === 'pause') {
                    this.resume();
                }
                break;
        }
    }
}
