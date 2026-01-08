// Addictive Features - Streak System, Challenges, Combos!

interface Streak {
    currentStreak: number;
    longestStreak: number;
    lastPlayedDate: string;
}

interface Challenge {
    id: string;
    name: string;
    description: string;
    goal: number;
    progress: number;
    reward: number; // diamonds
    expires?: number; // timestamp
}

interface Combo {
    multiplier: number;
    gamesInRow: number;
    lastGameTime: number;
}

class EngagementSystem {
    private streak: Streak;
    private challenges: Challenge[];
    private combo: Combo;

    constructor() {
        this.streak = this.loadStreak();
        this.challenges = this.loadChallenges();
        this.combo = { multiplier: 1, gamesInRow: 0, lastGameTime: 0 };
    }

    // STREAK SYSTEM - Play daily to maintain streak!
    checkStreak(): { continued: boolean; bonus: number } {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (this.streak.lastPlayedDate === today) {
            return { continued: true, bonus: 0 };
        }

        if (this.streak.lastPlayedDate === yesterday) {
            // Streak continues!
            this.streak.currentStreak++;
            this.streak.longestStreak = Math.max(this.streak.currentStreak, this.streak.longestStreak);
            this.streak.lastPlayedDate = today;
            this.saveStreak();

            // Bonus diamonds for streak milestones
            const bonus = this.getStreakBonus(this.streak.currentStreak);
            return { continued: true, bonus };
        }

        // Streak broken 😢
        this.streak.currentStreak = 1;
        this.streak.lastPlayedDate = today;
        this.saveStreak();
        return { continued: false, bonus: 0 };
    }

    private getStreakBonus(streak: number): number {
        if (streak % 30 === 0) return 1000; // Monthly milestone!
        if (streak % 7 === 0) return 250;   // Weekly milestone
        if (streak >= 3) return 50;         // 3+ day bonus
        return 0;
    }

    getStreak(): Streak {
        return { ...this.streak };
    }

    // COMBO SYSTEM - Play multiple games quickly for multiplier!
    updateCombo(): number {
        const now = Date.now();
        const timeSinceLastGame = now - this.combo.lastGameTime;

        // If played within 2 minutes, combo continues
        if (timeSinceLastGame < 120000 && this.combo.lastGameTime > 0) {
            this.combo.gamesInRow++;
            this.combo.multiplier = 1 + (this.combo.gamesInRow * 0.1); // +10% per game
        } else {
            // Reset combo
            this.combo.gamesInRow = 1;
            this.combo.multiplier = 1;
        }

        this.combo.lastGameTime = now;
        return this.combo.multiplier;
    }

    getCombo(): Combo {
        return { ...this.combo };
    }

    // DAILY CHALLENGES - Fresh challenges every day!
    generateDailyChallenges() {
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem('challengesDate');

        // Generate new challenges if it's a new day
        if (storedDate !== today) {
            this.challenges = [
                {
                    id: 'play_5_games',
                    name: 'Game Marathon',
                    description: 'Play 5 different games',
                    goal: 5,
                    progress: 0,
                    reward: 200,
                    expires: Date.now() + 86400000 // 24 hours
                },
                {
                    id: 'score_10000',
                    name: 'High Scorer',
                    description: 'Score 10,000 points in any game',
                    goal: 10000,
                    progress: 0,
                    reward: 300
                },
                {
                    id: 'win_streak_3',
                    name: 'Winning Streak',
                    description: 'Win 3 games in a row',
                    goal: 3,
                    progress: 0,
                    reward: 250
                }
            ];

            localStorage.setItem('challengesDate', today);
            this.saveChallenges();
        }
    }

    updateChallengeProgress(challengeId: string, progress: number) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) return;

        challenge.progress = Math.min(progress, challenge.goal);
        this.saveChallenges();

        // Check if completed
        if (challenge.progress >= challenge.goal) {
            this.completeChallenge(challengeId);
        }
    }

    private completeChallenge(challengeId: string) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) return;

        // Award diamonds
        const currentDiamonds = parseInt(localStorage.getItem('diamonds') || '0');
        localStorage.setItem('diamonds', (currentDiamonds + challenge.reward).toString());

        // Show celebration popup
        this.showChallengeComplete(challenge);
    }

    private showChallengeComplete(challenge: Challenge) {
        // Create popup notification
        console.log(`🎉 Challenge Complete: ${challenge.name} - +${challenge.reward}💎`);
    }

    getChallenges(): Challenge[] {
        return [...this.challenges];
    }

    // Persistence
    private loadStreak(): Streak {
        const stored = localStorage.getItem('playStreak');
        if (stored) {
            return JSON.parse(stored);
        }
        return { currentStreak: 0, longestStreak: 0, lastPlayedDate: '' };
    }

    private saveStreak() {
        localStorage.setItem('playStreak', JSON.stringify(this.streak));
    }

    private loadChallenges(): Challenge[] {
        const stored = localStorage.getItem('dailyChallenges');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }

    private saveChallenges() {
        localStorage.setItem('dailyChallenges', JSON.stringify(this.challenges));
    }
}

export default new EngagementSystem();
