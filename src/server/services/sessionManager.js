/**
 * Session Manager
 * Manages game sessions and player state
 */

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(userId, gameId, metadata = {}) {
    const sessionId = crypto.randomUUID();
    const session = {
      sessionId,
      userId,
      gameId,
      startTime: Date.now(),
      metadata,
      active: true
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  endSession(sessionId, score = null) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.active = false;
      session.endTime = Date.now();
      session.score = score;
      session.duration = session.endTime - session.startTime;
      return session;
    }
    return null;
  }

  getUserSessions(userId) {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime > expiryTime) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

const sessionManager = new SessionManager();

// Cleanup expired sessions every hour
setInterval(() => sessionManager.cleanupExpiredSessions(), 60 * 60 * 1000);

export default sessionManager;
