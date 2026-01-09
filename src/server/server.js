import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import gameRoutes from './routes/games.js';
import leaderboardRoutes from './routes/leaderboard.js';
import achievementRoutes from './routes/achievements.js';
import saveRoutes from './routes/saves.js';
import sessionRoutes from './routes/sessions.js';
import statisticsRoutes from './routes/statistics.js';
import statsRoutes from './routes/stats.js';
import dailyChallengesRoutes from './routes/dailyChallenges.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { cacheMiddleware, getCacheStats } from './middleware/cache.js';
import { adaptiveRateLimit, rateLimiters } from './middleware/advancedRateLimit.js';

// Import services
import realtimeManager from './services/realtimeManager.js';
import redisService from './services/redisService.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting behind proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - Use adaptive rate limiter
app.use('/api/', adaptiveRateLimit(100));
app.use('/api/auth', rateLimiters.auth);
app.use('/api/leaderboard/submit', rateLimiters.scoreSubmit);

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  const cacheStats = getCacheStats();
  const redisStats = redisService.getStats();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cache: cacheStats,
    redis: redisStats,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Cache statistics endpoint (admin only)
app.get('/api/admin/cache/stats', (req, res) => {
  res.json(getCacheStats());
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/daily-challenges', dailyChallengesRoutes);
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize WebSocket server
realtimeManager.initialize(server);
console.log('🔌 WebSocket server initialized');

// Initialize Redis (with fallback)
(async () => {
  try {
    await redisService.initialize();
    console.log('🗄️  Redis initialized:', redisService.getStats().type);
  } catch (error) {
    console.warn('⚠️  Redis initialization failed, using in-memory cache:', error.message);
  }
})();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
  console.log(`⚡ WebSocket server ready on ws://localhost:${PORT}/ws`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default app;
