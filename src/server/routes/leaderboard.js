import express from 'express';
import { z } from 'zod';
import { db } from '../utils/db.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { validateScore } from '../services/antiCheat.js';
import realtimeManager from '../services/realtimeManager.js';
import sessionManager from '../services/sessionManager.js';
import redisService from '../services/redisService.js';

const router = express.Router();

// Validation schema
const submitScoreSchema = z.object({
  score: z.number().int().min(0),
  gameId: z.string(),
  timestamp: z.number(),
  signature: z.string(),
  duration: z.number().optional(),
  metadata: z.object({}).passthrough().optional()
});

// Get leaderboard for a game
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    // Try to get from cache first
    const cached = await redisService.getLeaderboard(gameId);
    if (cached) {
      return res.json({
        success: true,
        data: {
          gameId,
          leaderboard: cached,
          cached: true
        }
      });
    }

    // Fetch from database
    const leaderboard = await db.getLeaderboard(gameId, limit);
    
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      username: entry.users?.username || 'Anonymous',
      avatar: entry.users?.avatar,
      score: entry.score,
      submittedAt: entry.submitted_at
    }));

    // Cache the result (5 minute TTL)
    await redisService.cacheLeaderboard(gameId, formattedLeaderboard);

    res.json({
      success: true,
      data: {
        gameId,
        leaderboard: formattedLeaderboard,
        cached: false
      }
    });
  } catch (error) {
    next(error);
  }
});

// Submit score
router.post('/:gameId', auth, validateRequest(submitScoreSchema), async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { score, timestamp, signature, duration, metadata, sessionId } = req.body;
    const userId = req.user.id;

    // Validate score with enhanced anti-cheat
    const validation = await validateScore({
      userId,
      gameId,
      score,
      timestamp,
      signature,
      duration,
      sessionId,
      metadata
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Score validation failed',
        reason: validation.reason || 'Anti-cheat validation failed',
        flags: validation.flags,
        confidence: validation.confidence
      });
    }

    // Use adjusted score if confidence is low
    const finalScore = validation.adjustedScore || score;

    // Track score submission for anti-cheat
    await redisService.trackScoreSubmission(userId, gameId);

    // Check if it's a new personal best
    const currentBest = await db.getUserBestScore(userId, gameId);
    const isNewBest = !currentBest || finalScore > currentBest.score;

    if (isNewBest) {
      // Submit new score
      const scoreData = {
        user_id: userId,
        game_id: gameId,
        score: finalScore,
        metadata: JSON.stringify({
          ...metadata,
          validation: {
            confidence: validation.confidence,
            flags: validation.flags,
            originalScore: score
          }
        }),
        submitted_at: new Date().toISOString()
      };

      const newScore = await db.submitScore(scoreData);

      // Invalidate leaderboard cache
      await redisService.invalidateLeaderboard(gameId);

      // Get updated leaderboard
      const updatedLeaderboard = await db.getLeaderboard(gameId, 10);

      // Cache the updated leaderboard
      await redisService.cacheLeaderboard(gameId, updatedLeaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.user_id,
        username: entry.users?.username || 'Anonymous',
        avatar: entry.users?.avatar,
        score: entry.score,
        submittedAt: entry.submitted_at
      })));

      // Broadcast to WebSocket subscribers
      realtimeManager.broadcastLeaderboardUpdate(gameId, updatedLeaderboard);

      // Send notification to user
      realtimeManager.sendNotification(userId, {
        type: 'achievement',
        title: 'New High Score!',
        message: `You scored ${finalScore} in ${gameId}`,
        icon: '🏆'
      });

      res.json({
        success: true,
        message: 'Score submitted successfully',
        data: {
          score: newScore.score,
          isNewBest: true,
          previousBest: currentBest?.score || 0,
          validation: {
            confidence: validation.confidence,
            adjusted: finalScore !== score
          }
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Score recorded but not a new best',
        data: {
          score: finalScore,
          isNewBest: false,
          currentBest: currentBest.score
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get user's position in leaderboard
router.get('/:gameId/position/:userId', async (req, res, next) => {
  try {
    const { gameId, userId } = req.params;

    const bestScore = await db.getUserBestScore(userId, gameId);
    
    if (!bestScore) {
      return res.json({
        success: true,
        data: {
          hasScore: false
        }
      });
    }

    // Get rank (count how many scores are better)
    const leaderboard = await db.getLeaderboard(gameId, 10000);
    const rank = leaderboard.findIndex(entry => entry.user_id === userId) + 1;

    res.json({
      success: true,
      data: {
        hasScore: true,
        score: bestScore.score,
        rank,
        totalPlayers: leaderboard.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
