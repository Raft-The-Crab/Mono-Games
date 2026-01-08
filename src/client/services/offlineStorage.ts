/**
 * Offline-First Storage System
 * Works completely without backend - stores everything locally
 * Optional cloud sync when backend is available
 */

export interface GameData {
  gameId: string;
  highScore: number;
  playCount: number;
  totalTime: number;
  lastPlayed: Date;
  achievements: string[];
  statistics: Record<string, any>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface UserProfile {
  username: string;
  level: number;
  totalDiamonds: number;
  totalScore: number;
  gamesPlayed: number;
  totalPlayTime: number;
  favoriteGame?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  gameId: string;
  timestamp: Date;
}

/**
 * Local Storage Manager (localStorage + IndexedDB)
 */
export class OfflineStorage {
  private dbName = 'MonoGamesDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('games')) {
          db.createObjectStore('games', { keyPath: 'gameId' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('leaderboards')) {
          const leaderboardStore = db.createObjectStore('leaderboards', { keyPath: 'id', autoIncrement: true });
          leaderboardStore.createIndex('gameId', 'gameId', { unique: false });
          leaderboardStore.createIndex('score', 'score', { unique: false });
        }
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'username' });
        }
        if (!db.objectStoreNames.contains('dailyChallenges')) {
          db.createObjectStore('dailyChallenges', { keyPath: 'date' });
        }
      };
    });
  }

  // ==================== GAME DATA ====================

  async saveGameData(data: GameData): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['games'], 'readwrite');
      const store = transaction.objectStore('games');
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getGameData(gameId: string): Promise<GameData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['games'], 'readonly');
      const store = transaction.objectStore('games');
      const request = store.get(gameId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllGameData(): Promise<GameData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['games'], 'readonly');
      const store = transaction.objectStore('games');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateHighScore(gameId: string, score: number): Promise<boolean> {
    const gameData = await this.getGameData(gameId);
    
    if (!gameData) {
      await this.saveGameData({
        gameId,
        highScore: score,
        playCount: 1,
        totalTime: 0,
        lastPlayed: new Date(),
        achievements: [],
        statistics: {}
      });
      return true;
    }

    if (score > gameData.highScore) {
      gameData.highScore = score;
      gameData.lastPlayed = new Date();
      await this.saveGameData(gameData);
      return true;
    }

    return false;
  }

  // ==================== ACHIEVEMENTS ====================

  async saveAchievement(achievement: Achievement): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readwrite');
      const store = transaction.objectStore('achievements');
      const request = store.put(achievement);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async unlockAchievement(achievementId: string): Promise<Achievement | null> {
    const achievement = await this.getAchievement(achievementId);
    if (!achievement || achievement.unlockedAt) return null;

    achievement.unlockedAt = new Date();
    await this.saveAchievement(achievement);
    return achievement;
  }

  async getAchievement(achievementId: string): Promise<Achievement | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readonly');
      const store = transaction.objectStore('achievements');
      const request = store.get(achievementId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAchievements(): Promise<Achievement[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readonly');
      const store = transaction.objectStore('achievements');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnlockedAchievements(): Promise<Achievement[]> {
    const all = await this.getAllAchievements();
    return all.filter(a => a.unlockedAt);
  }

  async updateAchievementProgress(achievementId: string, progress: number): Promise<Achievement | null> {
    const achievement = await this.getAchievement(achievementId);
    if (!achievement || achievement.unlockedAt) return null;

    achievement.progress = progress;
    
    // Auto-unlock if progress reached
    if (achievement.maxProgress && progress >= achievement.maxProgress) {
      achievement.unlockedAt = new Date();
    }

    await this.saveAchievement(achievement);
    return achievement;
  }

  // ==================== PROFILE ====================

  async saveProfile(profile: UserProfile): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profile'], 'readwrite');
      const store = transaction.objectStore('profile');
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProfile(username: string): Promise<UserProfile | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profile'], 'readonly');
      const store = transaction.objectStore('profile');
      const request = store.get(username);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProfile(username: string, updates: Partial<UserProfile>): Promise<void> {
    const profile = await this.getProfile(username);
    if (!profile) return;

    const updated = { ...profile, ...updates, lastActive: new Date() };
    await this.saveProfile(updated);
  }

  async addDiamonds(username: string, amount: number): Promise<number> {
    const profile = await this.getProfile(username);
    if (!profile) return 0;

    profile.totalDiamonds += amount;
    profile.lastActive = new Date();
    await this.saveProfile(profile);
    return profile.totalDiamonds;
  }

  // ==================== LEADERBOARDS ====================

  async addLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['leaderboards'], 'readwrite');
      const store = transaction.objectStore('leaderboards');
      const request = store.add(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLeaderboard(gameId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['leaderboards'], 'readonly');
      const store = transaction.objectStore('leaderboards');
      const index = store.index('gameId');
      const request = index.getAll(gameId);

      request.onsuccess = () => {
        const entries = request.result || [];
        // Sort by score descending
        entries.sort((a, b) => b.score - a.score);
        resolve(entries.slice(0, limit));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['leaderboards'], 'readonly');
      const store = transaction.objectStore('leaderboards');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result || [];
        entries.sort((a, b) => b.score - a.score);
        resolve(entries.slice(0, limit));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== DAILY CHALLENGES ====================

  async saveDailyChallenge(date: string, challenge: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dailyChallenges'], 'readwrite');
      const store = transaction.objectStore('dailyChallenges');
      const request = store.put({ date, ...challenge });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDailyChallenge(date: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dailyChallenges'], 'readonly');
      const store = transaction.objectStore('dailyChallenges');
      const request = store.get(date);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== UTILITY ====================

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['games', 'achievements', 'leaderboards', 'profile', 'dailyChallenges'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async exportData(): Promise<string> {
    const data = {
      games: await this.getAllGameData(),
      achievements: await this.getAllAchievements(),
      leaderboards: await this.getGlobalLeaderboard(1000),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    if (data.games) {
      for (const game of data.games) {
        await this.saveGameData(game);
      }
    }

    if (data.achievements) {
      for (const achievement of data.achievements) {
        await this.saveAchievement(achievement);
      }
    }

    if (data.leaderboards) {
      for (const entry of data.leaderboards) {
        await this.addLeaderboardEntry(entry);
      }
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Auto-initialize
offlineStorage.init().catch(console.error);

export default offlineStorage;
