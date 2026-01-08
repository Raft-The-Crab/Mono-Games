import { openDB } from 'idb';
import { GAME_REGISTRY, CORE_GAMES } from '../config/gameRegistry';

const DB_NAME = 'mono-games-store';
const DB_VERSION = 1;
const GAMES_STORE = 'games';
const MANIFESTS_STORE = 'manifests';

/**
 * Initialize IndexedDB
 */
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(GAMES_STORE)) {
        db.createObjectStore(GAMES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MANIFESTS_STORE)) {
        db.createObjectStore(MANIFESTS_STORE, { keyPath: 'id' });
      }
    }
  });
};

/**
 * Get all available games from registry
 */
export const getAllGames = async () => {
  return GAME_REGISTRY.map(game => ({
    ...game,
    installed: true,
    core: true
  }));
};

/**
 * Get installed games from IndexedDB
 */
export const getInstalledGames = async () => {
  try {
    const db = await initDB();
    const manifests = await db.getAll(MANIFESTS_STORE);

    // Include all games from registry
    const allGames = GAME_REGISTRY.map(game => ({
      ...game,
      installed: true,
      core: true
    }));

    return [...allGames, ...manifests.filter((m) => !m.core)];
  } catch (error) {
    console.error('Failed to get installed games:', error);
    return GAME_REGISTRY;
  }
};

/**
 * Load a game - use explicit static imports for existing games
 */
export const loadGame = async (gameId) => {
  console.log('[gameStore] Loading game:', gameId);
  try {
    // Static imports for core games
    switch (gameId) {
      case 'snake': {
        console.log('[gameStore] Importing snake...');
        const module = await import('../games/core/snake/index.js');
        console.log('[gameStore] Snake module:', module);
        return module.default;
      }
      case 'pong': {
        const module = await import('../games/core/pong/index.js');
        return module.default;
      }
      case 'tic-tac-toe': {
        const module = await import('../games/core/tic-tac-toe/index.js');
        return module.default;
      }
      case 'connect-four': {
        const module = await import('../games/core/connect-four/index.js');
        return module.default;
      }
      case '2048': {
        const module = await import('../games/core/2048/index.js');
        return module.default;
      }
      case 'tetris': {
        const module = await import('../games/core/tetris/index.js');
        return module.default;
      }
      case 'memory-match': {
        const module = await import('../games/core/memory-match/index.js');
        return module.default;
      }
      case 'breakout': {
        const module = await import('../games/core/breakout/index.js');
        return module.default;
      }
      case 'flappy-bird': {
        const module = await import('../games/core/flappy-bird/index.js');
        return module.default;
      }
      case 'brick-breaker': {
        const module = await import('../games/core/brick-breaker/index.js');
        return module.default;
      }
      case 'doodle-jump': {
        const module = await import('../games/core/doodle-jump/index.js');
        return module.default;
      }
      case 'minesweeper': {
        const module = await import('../games/core/minesweeper/index.js');
        return module.default;
      }
      case 'racing': {
        const module = await import('../games/core/racing/index.js');
        return module.default;
      }
      case 'infinite-roads': {
        const module = await import('../games/core/infinite-roads/index.js');
        return module.default;
      }
      case 'space-shooter': {
        const module = await import('../games/core/space-shooter/index.js');
        return module.default;
      }
      case 'platformer': {
        const module = await import('../games/core/platformer/index.js');
        return module.default;
      }
      case 'cube-runner': {
        const module = await import('../games/core/cube-runner/index.js');
        return module.default;
      }
      default:
        // For games not yet implemented, return a placeholder
        console.warn(`Game "${gameId}" not yet implemented, showing placeholder`);
        return class PlaceholderGame {
          constructor(containerId) {
            this.containerId = containerId;
            this.score = 0;
          }
          init() {
            const container = document.getElementById(this.containerId);
            if (container) {
              container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; font-family: 'Comic Sans MS', cursive;">
                  <h1 style="color: var(--primary); font-size: 3rem;">🎮</h1>
                  <h2 style="color: var(--text-primary);">${formatGameName(gameId)}</h2>
                  <p style="color: var(--text-secondary); text-align: center; max-width: 400px; margin-top: 1rem;">
                    This game is coming soon! We're working hard to bring you an amazing experience.
                  </p>
                  <p style="color: var(--accent); margin-top: 2rem; font-size: 0.9rem;">
                    Check back later for updates! 🚀
                  </p>
                </div>
              `;
            }
          }
          start() {}
          pause() {}
          resume() {}
          reset() {}
          destroy() {
            const container = document.getElementById(this.containerId);
            if (container) container.innerHTML = '';
          }
        };
    }
  } catch (error) {
    console.error('Failed to load game:', error);
    throw error;
  }
};

/**
 * Download and install a game (stub for now)
 */
export const downloadGame = async (gameId, onProgress) => {
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    onProgress?.(i);
  }

  return {
    id: gameId,
    name: formatGameName(gameId),
    installed: true
  };
};

/**
 * Uninstall a game
 */
export const uninstallGame = async (gameId) => {
  const coreGameIds = CORE_GAMES;
  if (coreGameIds.includes(gameId)) {
    throw new Error('Cannot uninstall core game');
  }

  const db = await initDB();
  await db.delete(GAMES_STORE, gameId);
  await db.delete(MANIFESTS_STORE, gameId);

  return true;
};

/**
 * Check for game updates
 */
export const checkForUpdates = async (gameId) => {
  return { hasUpdate: false, currentVersion: '1.0.0' };
};

/**
 * Format game name from ID
 */
export const formatGameName = (id) => {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get game manifest
 */
export const getGameManifest = async (gameId) => {
  const db = await initDB();
  return db.get(MANIFESTS_STORE, gameId);
};

/**
 * Get total storage used
 */
export const getStorageUsed = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { used: 0, quota: 0 };
  }

  const estimate = await navigator.storage.estimate();
  return {
    used: estimate.usage || 0,
    quota: estimate.quota || 0,
    percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
  };
};

export default {
  getAllGames,
  getInstalledGames,
  downloadGame,
  uninstallGame,
  loadGame,
  checkForUpdates,
  getGameManifest,
  getStorageUsed
};
