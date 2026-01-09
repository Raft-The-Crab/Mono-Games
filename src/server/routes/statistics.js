/**
 * Statistics Routes
 * Handles game statistics and analytics
 */

import express from 'express';
import { auth } from '../middleware/auth.js';
import { db, supabase } from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/statistics/user/:userId
 * Get user statistics (authenticated users only)
 */
router.get('/user/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own statistics
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const stats = await db.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[Statistics] Error fetching user statistics:', error);
    next(error);
  }
});

/**
 * GET /api/statistics/game/:gameId
 * Get game statistics (public)
 */
router.get('/game/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    // Get aggregated game statistics
    const { data, error } = await supabase
      .rpc('get_game_statistics', { game_id_param: gameId });

    if (error) throw error;

    res.json({
      success: true,
      data: data || {
        totalPlays: 0,
        uniquePlayers: 0,
        averageScore: 0,
        highestScore: 0
      }
    });
  } catch (error) {
    console.error('[Statistics] Error fetching game statistics:', error);
    next(error);
  }
});

/**
 * GET /api/statistics/global
 * Get global platform statistics (public)
 */
router.get('/global', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    // Get global statistics
    const { data, error } = await supabase
      .rpc('get_global_statistics');

    if (error) throw error;

    res.json({
      success: true,
      data: data || {
        totalUsers: 0,
        totalGames: 0,
        totalScores: 0,
        activeToday: 0
      }
    });
  } catch (error) {
    console.error('[Statistics] Error fetching global statistics:', error);
    next(error);
  }
});

export default router;
