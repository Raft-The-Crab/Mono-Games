/**
 * Stats Routes
 * Handles simple stats queries and updates
 */

import express from 'express';
import { auth } from '../middleware/auth.js';
import { db, supabase } from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/stats/me
 * Get current user's stats
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!supabase) {
      // Return default stats if database not available
      return res.json({
        success: true,
        data: {
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          highScore: 0,
          achievements: 0,
          diamonds: 0
        }
      });
    }

    const stats = await db.getUserStats(userId);

    res.json({
      success: true,
      data: stats || {
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        highScore: 0,
        achievements: 0,
        diamonds: 0
      }
    });
  } catch (error) {
    console.error('[Stats] Error fetching user stats:', error);
    next(error);
  }
});

/**
 * POST /api/stats/update
 * Update user stats after game completion
 */
router.post('/update', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gameId, score, duration } = req.body;

    if (!gameId || typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'gameId and score are required'
      });
    }

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    // Update user stats
    const { data, error } = await supabase
      .rpc('update_user_stats', {
        user_id_param: userId,
        game_id_param: gameId,
        score_param: score,
        duration_param: duration || 0
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Stats updated successfully',
      data
    });
  } catch (error) {
    console.error('[Stats] Error updating stats:', error);
    next(error);
  }
});

export default router;
