/**
 * Token Manager
 * Handles JWT token generation, validation, and blacklisting
 */

import jwt from 'jsonwebtoken';
import redisService from './redisService.js';

class TokenManager {
  constructor() {
    this.blacklist = new Set(); // In-memory fallback for blacklisted tokens
    this.userTokens = new Map(); // Track tokens per user
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    this.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  }

  /**
   * Generate access and refresh token pair
   */
  generateTokenPair(userId, email, username) {
    const accessToken = jwt.sign(
      { userId, email, username, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, email, username, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token for this user
    if (!this.userTokens.has(userId)) {
      this.userTokens.set(userId, new Set());
    }
    this.userTokens.get(userId).add(refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.ACCESS_TOKEN_EXPIRY)
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        return { success: false, error: 'Token has been revoked' };
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET);

      if (decoded.type !== 'refresh') {
        return { success: false, error: 'Invalid token type' };
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, username: decoded.username, type: 'access' },
        this.JWT_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );

      return {
        success: true,
        accessToken,
        expiresIn: this.parseExpiry(this.ACCESS_TOKEN_EXPIRY)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Blacklist a token (logout)
   */
  async blacklistToken(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return false;
      }

      const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
      
      // Store in Redis with expiry if available
      await redisService.set(`blacklist:${token}`, '1', expiryTime);
      
      // Also store in memory fallback
      this.blacklist.add(token);

      return true;
    } catch (error) {
      console.error('[TokenManager] Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token) {
    // Check memory first
    if (this.blacklist.has(token)) {
      return true;
    }

    // Check Redis
    const exists = await redisService.exists(`blacklist:${token}`);
    return exists;
  }

  /**
   * Revoke all tokens for a user
   */
  revokeAllUserTokens(userId) {
    const tokens = this.userTokens.get(userId);
    if (tokens) {
      tokens.forEach(token => {
        this.blacklistToken(token);
      });
      this.userTokens.delete(userId);
    }
  }

  /**
   * Parse expiry string to seconds
   */
  parseExpiry(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(token) {
    try {
      // Check blacklist first
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.JWT_SECRET);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

const tokenManager = new TokenManager();
export default tokenManager;
