/**
 * Session Routes
 * Handles game session tracking for both authenticated and guest users
 */

import express from 'express';
import { auth } from '../middleware/auth.js';
import { db, supabase } from '../utils/db.js';
import crypto from 'crypto';

const router = express.Router();

// In-memory session store (for when database is unavailable)
const sessionStore = new Map();

/**
 * POST /api/sessions/start
 * Start a new game session (supports both authenticated and guest users)
 */
router.post('/start', async (req, res, next) => {
  try {
    const { gameId, metadata = {} } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'gameId is required'
      });
    }

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();
    const startTime = new Date().toISOString();
    
    // Get user ID from token if authenticated, otherwise use guest session
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
        // Token invalid or expired, continue as guest
        console.log('[Sessions] Invalid token, continuing as guest');
      }
    }

    const sessionData = {
      sessionId,
      userId,
      gameId,
      startTime,
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      },
      isGuest: !userId
    };

    // Try to save to database if available
    if (supabase) {
      try {
        await supabase
          .from('game_sessions')
          .insert([{
            id: sessionId,
            user_id: userId,
            game_id: gameId,
            start_time: startTime,
            metadata: sessionData.metadata
          }]);
      } catch (dbError) {
        console.warn('[Sessions] Failed to save to database, using in-memory store:', dbError.message);
        sessionStore.set(sessionId, sessionData);
      }
    } else {
      // Use in-memory store
      sessionStore.set(sessionId, sessionData);
    }

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: {
        sessionId,
        startTime,
        isGuest: !userId
      }
    });
  } catch (error) {
    console.error('[Sessions] Error starting session:', error);
    next(error);
  }
});

/**
 * POST /api/sessions/:sessionId/end
 * End a game session
 */
router.post('/:sessionId/end', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { score, duration, metadata = {} } = req.body;

    const endTime = new Date().toISOString();

    // Try to update database if available
    if (supabase) {
      try {
        // Sanitize metadata to prevent SQL injection
        const sanitizedMetadata = JSON.parse(JSON.stringify(metadata));
        
        await supabase
          .from('game_sessions')
          .update({
            end_time: endTime,
            score,
            duration
          })
          .eq('id', sessionId);
      } catch (dbError) {
        console.warn('[Sessions] Failed to update database:', dbError.message);
      }
    }

    // Remove from in-memory store if present
    sessionStore.delete(sessionId);

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: {
        sessionId,
        endTime,
        score,
        duration
      }
    });
  } catch (error) {
    console.error('[Sessions] Error ending session:', error);
    next(error);
  }
});

/**
 * GET /api/sessions/stats
 * Get session statistics for authenticated users
 */
router.get('/stats', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        sessions: data,
        total: data.length
      }
    });
  } catch (error) {
    console.error('[Sessions] Error fetching stats:', error);
    next(error);
  }
});

export default router;
