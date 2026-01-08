// Ultimate Game Catalog - All Available Games
// Free core games (pre-installed) + Premium games (unlock with diamonds)

export interface Game {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    isPremium: boolean;
    isInstalled: boolean;
    is3D: boolean;
    thumbnail: string;
    features: string[];
    controls: string[];
}

// FREE CORE GAMES (Pre-installed, Always Available)
export const CORE_GAMES: Game[] = [
    {
        id: 'snake',
        name: 'Snake Classic',
        description: 'Classic snake game with modern graphics',
        category: 'Arcade',
        difficulty: 'easy',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🐍',
        features: ['Score Tracking', 'Smooth Controls', 'Retro Graphics'],
        controls: ['Arrow Keys', 'WASD']
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'The legendary block-stacking puzzle game',
        category: 'Puzzle',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🧱',
        features: ['Line Clearing', 'Level Progression', 'Fast Drop'],
        controls: ['Arrow Keys', 'Space to Drop']
    },
    {
        id: 'pong',
        name: 'Pong',
        description: 'Classic paddle game with AI opponent',
        category: 'Sports',
        difficulty: 'easy',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🏓',
        features: ['AI Opponent', 'Score Tracking', 'Smooth Physics'],
        controls: ['W/S or Arrow Up/Down']
    },
    {
        id: 'tic-tac-toe',
        name: 'Tic-Tac-Toe',
        description: 'Strategic three-in-a-row game',
        category: 'Strategy',
        difficulty: 'easy',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '⭕',
        features: ['AI Opponent', 'Local Multiplayer', 'Win Detection'],
        controls: ['Mouse Click']
    },
    {
        id: 'connect-four',
        name: 'Connect Four',
        description: 'Strategic disc-dropping game',
        category: 'Strategy',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🔴',
        features: ['AI Opponent', 'Gravity Physics', 'Win Detection'],
        controls: ['Mouse Click']
    },
    {
        id: '2048',
        name: '2048',
        description: 'Addictive number-merging puzzle',
        category: 'Puzzle',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🔢',
        features: ['Tile Merging', 'Score Tracking', 'Undo Move'],
        controls: ['Arrow Keys']
    },
    {
        id: 'memory-match',
        name: 'Memory Match',
        description: 'Card matching memory game',
        category: 'Puzzle',
        difficulty: 'easy',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🎴',
        features: ['Multiple Difficulties', 'Timer', 'Move Counter'],
        controls: ['Mouse Click']
    },
    {
        id: 'breakout',
        name: 'Breakout',
        description: 'Classic brick-breaking arcade game',
        category: 'Arcade',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🧱',
        features: ['Power-ups', 'Multiple Levels', 'Physics'],
        controls: ['Mouse or Arrow Keys']
    },
    {
        id: 'flappy-bird',
        name: 'Flappy Bird',
        description: 'Tap to fly through obstacles',
        category: 'Arcade',
        difficulty: 'hard',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🐦',
        features: ['Infinite Gameplay', 'Score Tracking', 'Smooth Animation'],
        controls: ['Space or Click']
    },
    {
        id: 'brick-breaker',
        name: 'Brick Breaker',
        description: 'Enhanced breakout with power-ups',
        category: 'Arcade',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '⚡',
        features: ['Power-ups', '20+ Levels', 'Special Bricks'],
        controls: ['Mouse']
    },
    {
        id: 'doodle-jump',
        name: 'Doodle Jump',
        description: 'Jump your way to the top',
        category: 'Arcade',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🦘',
        features: ['Infinite Height', 'Platforms', 'Power-ups'],
        controls: ['Arrow Left/Right']
    },
    {
        id: 'minesweeper',
        name: 'Minesweeper',
        description: 'Classic mine-finding puzzle',
        category: 'Puzzle',
        difficulty: 'hard',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '💣',
        features: ['Multiple Difficulties', 'Timer', 'Flag System'],
        controls: ['Left Click / Right Click']
    },
    {
        id: 'racing',
        name: '2D Racing',
        description: 'Top-down racing game',
        category: 'Racing',
        difficulty: 'medium',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🏎️',
        features: ['Multiple Cars', 'Lap Timer', 'Checkpoints'],
        controls: ['Arrow Keys']
    },
    {
        id: 'infinite-roads',
        name: 'Infinite Roads',
        description: 'Endless procedural racing',
        category: 'Racing',
        difficulty: 'hard',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🛣️',
        features: ['Procedural Generation', 'Obstacles', 'Speed Boost'],
        controls: ['Arrow Keys']
    },
    {
        id: 'space-shooter',
        name: 'Space Shooter',
        description: 'Classic space battle game',
        category: 'Action',
        difficulty: 'hard',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🚀',
        features: ['Enemy Waves', 'Power-ups', 'Boss Fights'],
        controls: ['Arrow Keys + Space']
    },
    {
        id: 'platformer',
        name: 'Platformer',
        description: '2D platforming adventure',
        category: 'Adventure',
        difficulty: 'hard',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🏃',
        features: ['Multiple Levels', 'Collectibles', 'Checkpoints'],
        controls: ['Arrow Keys + Space']
    },
    {
        id: 'cube-runner',
        name: 'Cube Runner',
        description: 'Avoid obstacles in 3D tunnel',
        category: 'Arcade',
        difficulty: 'hard',
        isPremium: false,
        isInstalled: true,
        is3D: false,
        thumbnail: '🎲',
        features: ['3D Graphics', 'Speed Increase', 'Score Multiplier'],
        controls: ['Arrow Left/Right']
    },
    {
        id: 'slow-roads',
        name: 'Slow Roads',
        description: 'Peaceful infinite driving simulator - Just drive and relax!',
        category: 'Relaxation',
        difficulty: 'easy',
        isPremium: false,
        isInstalled: false,
        is3D: true,
        thumbnail: '🛣️',
        features: ['Procedural Roads', 'Day/Night Cycle', 'Infinite Drive', '3D Graphics'],
        controls: ['Arrow Keys to Drive', 'W/S for Speed']
    }
];

// Get all games (core + premium)
export function getAllGames(): Game[] {
    return [...CORE_GAMES];
}

// Get games by category
export function getGamesByCategory(category: string): Game[] {
    return getAllGames().filter(g => g.category === category);
}

// Get game by ID
export function getGameById(id: string): Game | undefined {
    return getAllGames().find(g => g.id === id);
}

// Get all categories
export function getCategories(): string[] {
    const categories = new Set(getAllGames().map(g => g.category));
    return Array.from(categories).sort();
}

// REAL FILE SIZES for games (in MB) - Accurate estimates
export const GAME_FILE_SIZES: Record<string, number> = {
    // Core games (2D, lightweight)
    'snake': 0.15,
    'tetris': 0.18,
    'pong': 0.12,
    'tic-tac-toe': 0.10,
    'connect-four': 0.14,
    '2048': 0.16,
    'memory-match': 0.22,
    'breakout': 0.19,
    'flappy-bird': 0.17,
    'brick-breaker': 0.21,
    'doodle-jump': 0.24,
    'minesweeper': 0.13,
    'racing': 0.31,
    'infinite-roads': 0.28,
    'space-shooter': 0.35,
    'platformer': 0.42,
    'cube-runner': 0.26,
    'slow-roads': 2.1,

    // Premium games
    'chess': 1.8,
    'sudoku': 0.9,
    'mahjong': 2.4,
    'tower-defense': 4.2,
    'rpg-dungeon': 5.1,
    'rhythm-game': 7.3,
    'fps-shooter': 12.5,
    'open-world': 18.2,
    'racing-3d': 14.8,
    'survival-craft': 21.5
};

// Get file size for a game
export function getGameFileSize(gameId: string): number {
    return GAME_FILE_SIZES[gameId] || 0.5;
}

// Format file size for display
export function formatFileSize(mb: number): string {
    if (mb < 1) {
        return `${Math.round(mb * 1000)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
}
