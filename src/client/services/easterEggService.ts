// Easter Eggs System - Hidden secrets throughout the site!

class EasterEggService {
    private foundEggs: Set<string> = new Set();
    private konamiCode: string[] = [];
    private konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    init() {
        this.loadFoundEggs();
        this.setupKonamiCode();
        this.setupClickEasterEggs();
    }

    // Konami Code easter egg
    private setupKonamiCode() {
        document.addEventListener('keydown', (e) => {
            this.konamiCode.push(e.key);
            if (this.konamiCode.length > this.konamiSequence.length) {
                this.konamiCode.shift();
            }

            if (this.konamiCode.join(',') === this.konamiSequence.join(',')) {
                this.unlockEgg('konami_code', '🎮 Konami Code Master!', 1000);
            }
        });
    }

    // Click-based easter eggs
    private setupClickEasterEggs() {
        let logoClicks = 0;
        const logo = document.querySelector('.logo, h1');

        if (logo) {
            logo.addEventListener('click', () => {
                logoClicks++;
                if (logoClicks === 10) {
                    this.unlockEgg('logo_clicker', '🖱️ Click Master!', 500);
                    logoClicks = 0;
                }
            });
        }
    }

    // Unlock an easter egg
    private unlockEgg(id: string, name: string, diamonds: number) {
        if (this.foundEggs.has(id)) return;

        this.foundEggs.add(id);
        this.saveFoundEggs();

        // Show special popup
        this.showEasterEggPopup(name, diamonds);

        // Award diamonds
        import('./achievementService').then(({ default: achievementService }) => {
            const currentDiamonds = achievementService.getDiamonds();
            localStorage.setItem('diamonds', (currentDiamonds + diamonds).toString());
        });
    }

    private showEasterEggPopup(name: string, diamonds: number) {
        const popup = document.createElement('div');
        popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      background: linear-gradient(135deg, #FF6B35, #F7931E);
      border: 5px solid #2C3E50;
      border-radius: 32px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      z-index: 100000;
      text-align: center;
      animation: easterEggPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    `;

        popup.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem; animation: spin 1s ease-in-out;">🥚</div>
      <h2 style="font-family: 'Comic Sans MS', cursive; color: white; font-size: 2rem; margin: 0;">
        EASTER EGG FOUND!
      </h2>
      <p style="font-family: 'Comic Sans MS', cursive; color: white; font-size: 1.5rem; margin: 1rem 0;">
        ${name}
      </p>
      <div style="font-size: 2rem; color: #FFD700; font-weight: 900; text-shadow: 0 0 20px #FFD700;">
        +${diamonds} 💎
      </div>
    `;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.animation = 'easterEggPop 0.3s ease-out reverse';
            setTimeout(() => popup.remove(), 300);
        }, 4000);
    }

    private loadFoundEggs() {
        const stored = localStorage.getItem('foundEasterEggs');
        if (stored) {
            this.foundEggs = new Set(JSON.parse(stored));
        }
    }

    private saveFoundEggs() {
        localStorage.setItem('foundEasterEggs', JSON.stringify(Array.from(this.foundEggs)));
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes easterEggPop {
    0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes spin {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default new EasterEggService();
