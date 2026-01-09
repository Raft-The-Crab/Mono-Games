/**
 * Daily Challenges Routes
 * Handles daily challenges, weekly goals, and special events
 */

import express from 'express';
import { auth } from '../middleware/auth.js';
import { db, supabase } from '../utils/db.js';

const router = express.Router();

// In-memory store for daily challenges when database is unavailable
let dailyChallenges = [
  {
    id: 'daily_1',
    type: 'score',
    gameId: 'snake',
    title: 'Snake Master',
    description: 'Score 500 points in Snake',
    target: 500,
    reward: 50,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'daily_2',
    type: 'games',
    gameId: null,
    title: 'Variety Player',
    description: 'Play 3 different games',
    target: 3,
    reward: 30,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'daily_3',
    type: 'streak',
    gameId: null,
    title: 'Winning Streak',
    description: 'Win 3 games in a row',
    target: 3,
    reward: 75,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * GET /api/daily-challenges
 * Get active daily challenges
 */
router.get('/', async (req, res, next) => {
  try {
    // Get user ID if authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );
        userId = decoded.userId;
      } catch (error) {
        // Continue as guest
      }
    }

    if (supabase) {
      try {
        // Get challenges from database
        const { data: challenges, error } = await supabase
          .from('daily_challenges')
          .select('*')
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // If user is authenticated, get their progress
        let userProgress = [];
        if (userId) {
          const { data: progress } = await supabase
            .from('user_challenge_progress')
            .select('*')
            .eq('user_id', userId);
          userProgress = progress || [];
        }

        const challengesWithProgress = challenges.map(challenge => ({
          ...challenge,
          progress: userProgress.find(p => p.challenge_id === challenge.id)?.progress || 0,
          completed: userProgress.find(p => p.challenge_id === challenge.id)?.completed || false
        }));

        return res.json({
          success: true,
          data: challengesWithProgress
        });
      } catch (dbError) {
        console.warn('[DailyChallenges] Database error, using in-memory challenges:', dbError.message);
      }
    }

    // Use in-memory challenges as fallback
    res.json({
      success: true,
      data: dailyChallenges.map(c => ({
        ...c,
        progress: 0,
        completed: false
      }))
    });
  } catch (error) {
    console.error('[DailyChallenges] Error fetching challenges:', error);
    next(error);
  }
});

/**
 * POST /api/daily-challenges/:challengeId/progress
 * Update challenge progress (authenticated users only)
 */
router.post('/:challengeId/progress', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;
    const { progress } = req.body;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) throw challengeError;

    // Check if challenge is expired
    if (new Date(challenge.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Challenge has expired'
      });
    }

    // Update user progress
    const completed = progress >= challenge.target;
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        progress,
        completed,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Award diamonds if completed
    if (completed && !data.reward_claimed) {
      await supabase
        .from('users')
        .update({
          diamonds: supabase.raw(`diamonds + ${challenge.reward}`)
        })
        .eq('id', userId);

      await supabase
        .from('user_challenge_progress')
        .update({ reward_claimed: true })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
    }

    res.json({
      success: true,
      data: {
        progress,
        completed,
        rewardClaimed: completed
      }
    });
  } catch (error) {
    console.error('[DailyChallenges] Error updating progress:', error);
    next(error);
  }
});

/**
 * GET /api/daily-challenges/history
 * Get user's challenge history (authenticated users only)
 */
router.get('/history', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select(`
        *,
        daily_challenges (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('[DailyChallenges] Error fetching history:', error);
    next(error);
  }
});

export default router;
