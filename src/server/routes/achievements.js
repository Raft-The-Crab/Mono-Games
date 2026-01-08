/**
 * Achievement Routes
 * Handles achievement unlocks, progress tracking, and synchronization
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Achievement definitions (can be loaded from JSON)
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    rarity: 'common',
    diamonds: 10,
    requirement: { type: 'wins', count: 1 }
  },
  {
    id: 'score_1000',
    name: 'Score Master',
    description: 'Score 1000 points in any game',
    icon: '⭐',
    rarity: 'common',
    diamonds: 15,
    requirement: { type: 'score', count: 1000 }
  },
  {
    id: 'games_10',
    name: 'Dedicated Player',
    description: 'Play 10 games',
    icon: '🎮',
    rarity: 'rare',
    diamonds: 25,
    requirement: { type: 'games_played', count: 10 }
  },
  {
    id: 'games_50',
    name: 'Gaming Enthusiast',
    description: 'Play 50 games',
    icon: '🎯',
    rarity: 'epic',
    diamonds: 50,
    requirement: { type: 'games_played', count: 50 }
  },
  {
    id: 'perfect_game',
    name: 'Perfection',
    description: 'Complete a game with perfect score',
    icon: '💎',
    rarity: 'legendary',
    diamonds: 100,
    requirement: { type: 'perfect_score', count: 1 }
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a game in under 30 seconds',
    icon: '⚡',
    rarity: 'rare',
    diamonds: 30,
    requirement: { type: 'time_under', seconds: 30 }
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Win 5 games in a row',
    icon: '🔥',
    rarity: 'epic',
    diamonds: 75,
    requirement: { type: 'win_streak', count: 5 }
  },
  {
    id: 'all_games',
    name: 'Jack of All Trades',
    description: 'Play every game at least once',
    icon: '🌟',
    rarity: 'epic',
    diamonds: 60,
    requirement: { type: 'unique_games', count: 17 }
  },
  {
    id: 'diamond_collector',
    name: 'Diamond Collector',
    description: 'Collect 500 diamonds',
    icon: '💰',
    rarity: 'legendary',
    diamonds: 0, // No reward
    requirement: { type: 'diamonds_collected', count: 500 }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play between midnight and 4 AM',
    icon: '🦉',
    rarity: 'rare',
    diamonds: 20,
    requirement: { type: 'time_range', start: 0, end: 4 }
  }
];

/**
 * GET /api/achievements
 * Get all achievement definitions with user progress
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's unlocked achievements
    const unlockedAchievements = await db.query(
      'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?',
      [userId]
    );

    const unlockedMap = {};
    unlockedAchievements.forEach(a => {
      unlockedMap[a.achievement_id] = a.unlocked_at;
    });

    // Get user stats for progress calculation
    const userStats = await db.query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );
    const stats = userStats[0] || {};

    // Combine definitions with user progress
    const achievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: !!unlockedMap[def.id],
      unlockedAt: unlockedMap[def.id] || null,
      progress: calculateProgress(def, stats),
      maxProgress: def.requirement.count || 1
    }));

    res.json({
      achievements,
      totalUnlocked: Object.keys(unlockedMap).length,
      totalPossible: ACHIEVEMENT_DEFINITIONS.length
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * POST /api/achievements/check
 * Check and unlock achievements based on current stats
 */
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gameId, score, time, perfect } = req.body;

    // Get current user stats
    const userStats = await db.query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );
    const stats = userStats[0] || {};

    // Get already unlocked achievements
    const unlockedIds = await db.query(
      'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
      [userId]
    );
    const unlocked = new Set(unlockedIds.map(a => a.achievement_id));

    // Check each achievement
    const newlyUnlocked = [];
    const currentHour = new Date().getHours();

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (unlocked.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case 'wins':
          shouldUnlock = (stats.total_wins || 0) >= achievement.requirement.count;
          break;
        case 'score':
          shouldUnlock = score >= achievement.requirement.count;
          break;
        case 'games_played':
          shouldUnlock = (stats.total_games || 0) >= achievement.requirement.count;
          break;
        case 'perfect_score':
          shouldUnlock = perfect === true;
          break;
        case 'time_under':
          shouldUnlock = time <= achievement.requirement.seconds;
          break;
        case 'win_streak':
          shouldUnlock = (stats.current_streak || 0) >= achievement.requirement.count;
          break;
        case 'unique_games':
          shouldUnlock = (stats.unique_games_played || 0) >= achievement.requirement.count;
          break;
        case 'diamonds_collected':
          shouldUnlock = (stats.total_diamonds || 0) >= achievement.requirement.count;
          break;
        case 'time_range':
          shouldUnlock = currentHour >= achievement.requirement.start && currentHour < achievement.requirement.end;
          break;
      }

      if (shouldUnlock) {
        // Unlock achievement
        await db.query(
          'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, NOW())',
          [userId, achievement.id]
        );

        // Award diamonds
        if (achievement.diamonds > 0) {
          await db.query(
            'UPDATE users SET diamonds = diamonds + ? WHERE id = ?',
            [achievement.diamonds, userId]
          );
        }

        newlyUnlocked.push({
          ...achievement,
          diamondsAwarded: achievement.diamonds
        });
      }
    }

    res.json({
      unlockedCount: newlyUnlocked.length,
      achievements: newlyUnlocked,
      totalDiamonds: newlyUnlocked.reduce((sum, a) => sum + a.diamonds, 0)
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// Helper function to calculate progress
function calculateProgress(achievement, stats) {
  switch (achievement.requirement.type) {
    case 'wins':
      return stats.total_wins || 0;
    case 'games_played':
      return stats.total_games || 0;
    case 'win_streak':
      return stats.current_streak || 0;
    case 'unique_games':
      return stats.unique_games_played || 0;
    case 'diamonds_collected':
      return stats.total_diamonds || 0;
    default:
      return 0;
  }
}

export default router;
