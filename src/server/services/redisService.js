/**
 * Redis Service
 * Handles caching and session storage with Redis
 * Falls back to in-memory cache if Redis is unavailable
 */

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.cache = new Map(); // In-memory fallback
  }

  async initialize() {
    try {
      // Try to connect to Redis if configured
      const redisUrl = process.env.REDIS_URL;
      
      if (!redisUrl) {
        console.log('[Redis] No REDIS_URL configured, using in-memory cache');
        return;
      }

      // Dynamic import of redis
      const redis = await import('redis');
      this.client = redis.createClient({ url: redisUrl });

      this.client.on('error', (err) => {
        console.error('[Redis] Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('[Redis] Connected successfully');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.warn('[Redis] Failed to initialize, using in-memory cache:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (error) {
        console.warn('[Redis] Get error, falling back to memory:', error.message);
      }
    }
    return this.cache.get(key);
  }

  async set(key, value, expirySeconds = null) {
    if (this.isConnected && this.client) {
      try {
        if (expirySeconds) {
          await this.client.setEx(key, expirySeconds, value);
        } else {
          await this.client.set(key, value);
        }
        return true;
      } catch (error) {
        console.warn('[Redis] Set error, falling back to memory:', error.message);
      }
    }
    this.cache.set(key, value);
    if (expirySeconds) {
      setTimeout(() => this.cache.delete(key), expirySeconds * 1000);
    }
    return true;
  }

  async del(key) {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return true;
      } catch (error) {
        console.warn('[Redis] Delete error, falling back to memory:', error.message);
      }
    }
    return this.cache.delete(key);
  }

  async exists(key) {
    if (this.isConnected && this.client) {
      try {
        return await this.client.exists(key);
      } catch (error) {
        console.warn('[Redis] Exists error, falling back to memory:', error.message);
      }
    }
    return this.cache.has(key);
  }

  getStats() {
    return {
      type: this.isConnected ? 'redis' : 'memory',
      connected: this.isConnected,
      cacheSize: this.cache.size
    };
  }

  // Leaderboard-specific methods
  async getLeaderboard(gameId) {
    const key = `leaderboard:${gameId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cacheLeaderboard(gameId, leaderboard, expirySeconds = 300) {
    const key = `leaderboard:${gameId}`;
    await this.set(key, JSON.stringify(leaderboard), expirySeconds);
  }

  async invalidateLeaderboard(gameId) {
    const key = `leaderboard:${gameId}`;
    await this.del(key);
  }

  async trackScoreSubmission(userId, gameId) {
    const key = `score:${userId}:${gameId}:${Date.now()}`;
    await this.set(key, '1', 3600); // Track for 1 hour
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

const redisService = new RedisService();
export default redisService;
