// Achievement Service - Unlock achievements and earn diamonds
import api from './api';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    diamondReward: number;
    icon: string;
    category: 'account' | 'game';
    gameId?: string;
    unlocked: boolean;
    unlockedAt?: number;
    progress?: number;
    maxProgress?: number;
}

// Achievement definitions - SUPER GENEROUS REWARDS! (88% easier to earn)
const ACHIEVEMENTS: Achievement[] = [
    // Account-wide achievements - BIG REWARDS!
    {
        id: 'first_login',
        name: 'Welcome Aboard!',
        description: 'Log in for the first time',
        diamondReward: 250, // Was 50, now 5x!
        icon: '👋',
        category: 'account',
        unlocked: false
    },
    {
        id: 'first_game',
        name: 'Game On!',
        description: 'Play your first game',
        diamondReward: 125, // Was 25, now 5x!
        icon: '🎮',
        category: 'account',
        unlocked: false
    },
    {
        id: 'first_cloud_sync',
        name: 'Cloud Walker',
        description: 'Sync your data to the cloud',
        diamondReward: 500, // Was 100, now 5x!
        icon: '☁️',
        category: 'account',
        unlocked: false
    },
    {
        id: 'games_master',
        name: 'Games Master',
        description: 'Play all 17 core games',
        diamondReward: 2500, // Was 500, now 5x!
        icon: '👑',
        category: 'account',
        unlocked: false,
        maxProgress: 17
    },
    {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Reach 10,000 total points',
        diamondReward: 1000, // Was 200, now 5x!
        icon: '🏆',
        category: 'account',
        unlocked: false
    },
    {
        id: 'star_collector',
        name: 'Star Collector',
        description: 'Earn 1,000 total stars',
        diamondReward: 1500, // Was 300, now 5x!
        icon: '⭐',
        category: 'account',
        unlocked: false
    },
    {
        id: 'daily_player',
        name: 'Daily Dedication',
        description: 'Log in 7 days in a row',
        diamondReward: 750, // NEW!
        icon: '📅',
        category: 'account',
        unlocked: false,
        maxProgress: 7
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Unlock 5 premium games',
        diamondReward: 1000, // NEW!
        icon: '🦋',
        category: 'account',
        unlocked: false,
        maxProgress: 5
    },

    // Game-specific achievements - GENEROUS!
    {
        id: 'snake_100',
        name: 'Century Snake',
        description: 'Score 100+ in Snake',
        diamondReward: 250, // Was 50, now 5x!
        icon: '🐍',
        category: 'game',
        gameId: 'snake',
        unlocked: false
    },
    {
        id: 'tetris_10_lines',
        name: 'Line Crusher',
        description: 'Clear 10 lines in Tetris',
        diamondReward: 200, // Was 40, now 5x!
        icon: '🧱',
        category: 'game',
        gameId: 'tetris',
        unlocked: false
    },
    {
        id: 'pong_perfect',
        name: 'Pong Perfection',
        description: 'Win a Pong match without opponent scoring',
        diamondReward: 375, // Was 75, now 5x!
        icon: '🏓',
        category: 'game',
        gameId: 'pong',
        unlocked: false
    },
    {
        id: 'easter_egg_finder',
        name: 'Easter Egg Hunter',
        description: 'Find the hidden konami code!',
        diamondReward: 1000, // SECRET ACHIEVEMENT!
        icon: '🥚',
        category: 'account',
        unlocked: false
    }
];

class AchievementService {
    private achievements: Achievement[] = [];
    private diamonds: number = 0;

    async init() {
        await this.loadAchievements();
        await this.loadDiamonds();
    }

    // Get all achievements
    getAchievements(): Achievement[] {
        return [...this.achievements];
    }

    // Get unlocked achievements
    getUnlocked(): Achievement[] {
        return this.achievements.filter(a => a.unlocked);
    }

    // Get locked achievements
    getLocked(): Achievement[] {
        return this.achievements.filter(a => !a.unlocked);
    }

    // Get achievements by category
    getByCategory(category: 'account' | 'game'): Achievement[] {
        return this.achievements.filter(a => a.category === category);
    }

    // Get game-specific achievements
    getByGame(gameId: string): Achievement[] {
        return this.achievements.filter(a => a.gameId === gameId);
    }

    // Unlock achievement
    async unlockAchievement(achievementId: string): Promise<{
        success: boolean;
        diamonds?: number;
        achievement?: Achievement;
        error?: string;
    }> {
        try {
            const achievement = this.achievements.find(a => a.id === achievementId);

            if (!achievement) {
                return { success: false, error: 'Achievement not found' };
            }

            if (achievement.unlocked) {
                return { success: false, error: 'Already unlocked' };
            }

            // Unlock locally
            achievement.unlocked = true;
            achievement.unlockedAt = Date.now();

            // Award diamonds
            this.diamonds += achievement.diamondReward;

            // Save locally
            await this.saveAchievements();
            await this.saveDiamonds();

            // Sync to server
            try {
                await api.post('/achievements/unlock', {
                    achievementId,
                    timestamp: achievement.unlockedAt
                });
            } catch (error) {
                console.error('Failed to sync achievement unlock:', error);
                // Continue anyway - will sync later
            }

            // Show celebration popup
            this.showAchievementPopup(achievement);

            return {
                success: true,
                diamonds: achievement.diamondReward,
                achievement
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Update achievement progress
    async updateProgress(achievementId: string, progress: number) {
        const achievement = this.achievements.find(a => a.id === achievementId);

        if (!achievement || achievement.unlocked) return;

        achievement.progress = progress;

        if (achievement.maxProgress && progress >= achievement.maxProgress) {
            await this.unlockAchievement(achievementId);
        }

        await this.saveAchievements();
    }

    // Get diamond balance
    getDiamonds(): number {
        return this.diamonds;
    }

    // Spend diamonds
    async spendDiamonds(amount: number, reason: string): Promise<boolean> {
        if (this.diamonds < amount) {
            return false;
        }

        this.diamonds -= amount;
        await this.saveDiamonds();

        // Log transaction
        await api.post('/achievements/spend-diamonds', {
            amount,
            reason,
            timestamp: Date.now()
        }).catch(err => console.error('Failed to log diamond transaction:', err));

        return true;
    }

    // Check and unlock achievements based on game event
    async checkAchievements(event: {
        type: 'game_played' | 'score_achieved' | 'cloud_synced' | 'login';
        gameId?: string;
        score?: number;
    }) {
        switch (event.type) {
            case 'login':
                await this.unlockAchievement('first_login');
                break;

            case 'game_played':
                await this.unlockAchievement('first_game');

                // Track unique games played
                const gamesPlayed = new Set(
                    this.achievements
                        .filter(a => a.category === 'game' && a.unlocked)
                        .map(a => a.gameId)
                ).size;
                await this.updateProgress('games_master', gamesPlayed);
                break;

            case 'score_achieved':
                if (event.gameId && event.score) {
                    // Check game-specific achievements
                    if (event.gameId === 'snake' && event.score >= 100) {
                        await this.unlockAchievement('snake_100');
                    }
                }
                break;

            case 'cloud_synced':
                await this.unlockAchievement('first_cloud_sync');
                break;
        }
    }

    // Private methods
    private async loadAchievements() {
        const stored = localStorage.getItem('achievements');
        if (stored) {
            this.achievements = JSON.parse(stored);
        } else {
            this.achievements = ACHIEVEMENTS.map(a => ({ ...a }));
            await this.saveAchievements();
        }
    }

    private async saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    private async loadDiamonds() {
        const stored = localStorage.getItem('diamonds');
        this.diamonds = stored ? parseInt(stored, 10) : 0;
    }

    private async saveDiamonds() {
        localStorage.setItem('diamonds', this.diamonds.toString());
    }

    private showAchievementPopup(achievement: Achievement) {
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <h3>Achievement Unlocked!</h3>
          <p>${achievement.name}</p>
          <div class="diamond-reward">+${achievement.diamondReward} 💎</div>
        </div>
      </div>
    `;

        document.body.appendChild(popup);

        // Animate in
        requestAnimationFrame(() => {
            popup.style.animation = 'achievementSlideIn 0.5s ease-out forwards';
        });

        // Remove after 4 seconds
        setTimeout(() => {
            popup.style.animation = 'achievementSlideOut 0.5s ease-out forwards';
            setTimeout(() => popup.remove(), 500);
        }, 4000);
    }
}

export default new AchievementService();
