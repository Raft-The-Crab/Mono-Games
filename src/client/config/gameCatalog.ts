// Game Catalog - ALL 18 EXISTING GAMES ARE CORE (Pre-installed)
// Plus free downloadable and premium games

export interface Game {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    type: 'core' | 'free' | 'premium';
    diamondCost: number;
    fileSize: number;
    isInstalled: boolean;
    is3D: boolean;
    thumbnail: string;
    features: string[];
    controls: string[];
}

// ALL 18 CORE GAMES (Pre-installed in /games/core/)
export const CORE_GAMES: Game[] = [
    { id: 'snake', name: 'Snake Classic', description: 'Eat apples, grow longer!', category: 'Arcade', difficulty: 'easy', type: 'core', diamondCost: 0, fileSize: 0.15, isInstalled: true, is3D: false, thumbnail: '🐍', features: ['Particles', 'Glow'], controls: ['Arrows', 'WASD'] },
    { id: 'tetris', name: 'Tetris', description: 'Block stacking puzzle', category: 'Puzzle', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.18, isInstalled: true, is3D: false, thumbnail: '🧱', features: ['Line Clear'], controls: ['Arrows'] },
    { id: 'pong', name: 'Pong', description: 'Classic paddle game', category: 'Sports', difficulty: 'easy', type: 'core', diamondCost: 0, fileSize: 0.12, isInstalled: true, is3D: false, thumbnail: '🏓', features: ['AI'], controls: ['W/S'] },
    { id: '2048', name: '2048', description: 'Number merging puzzle', category: 'Puzzle', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.16, isInstalled: true, is3D: false, thumbnail: '🔢', features: ['Undo'], controls: ['Arrows'] },
    { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', description: 'Three in a row', category: 'Strategy', difficulty: 'easy', type: 'core', diamondCost: 0, fileSize: 0.10, isInstalled: true, is3D: false, thumbnail: '⭕', features: ['AI'], controls: ['Mouse'] },
    { id: 'connect-four', name: 'Connect Four', description: 'Disc dropping strategy', category: 'Strategy', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.14, isInstalled: true, is3D: false, thumbnail: '🔴', features: ['AI'], controls: ['Mouse'] },
    { id: 'memory-match', name: 'Memory Match', description: 'Card matching game', category: 'Puzzle', difficulty: 'easy', type: 'core', diamondCost: 0, fileSize: 0.22, isInstalled: true, is3D: false, thumbnail: '🎴', features: ['Timer'], controls: ['Mouse'] },
    { id: 'breakout', name: 'Breakout', description: 'Brick breaking arcade', category: 'Arcade', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.19, isInstalled: true, is3D: false, thumbnail: '🧱', features: ['Power-ups'], controls: ['Mouse'] },
    { id: 'brick-breaker', name: 'Brick Breaker', description: 'Enhanced breakout', category: 'Arcade', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.21, isInstalled: true, is3D: false, thumbnail: '⚡', features: ['20 Levels'], controls: ['Mouse'] },
    { id: 'flappy-bird', name: 'Flappy Bird', description: 'Tap to fly', category: 'Arcade', difficulty: 'hard', type: 'core', diamondCost: 0, fileSize: 0.17, isInstalled: true, is3D: false, thumbnail: '🐦', features: ['Infinite'], controls: ['Space'] },
    { id: 'doodle-jump', name: 'Doodle Jump', description: 'Jump to the top', category: 'Arcade', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.24, isInstalled: true, is3D: false, thumbnail: '🦘', features: ['Power-ups'], controls: ['Arrows'] },
    { id: 'minesweeper', name: 'Minesweeper', description: 'Mine finding puzzle', category: 'Puzzle', difficulty: 'hard', type: 'core', diamondCost: 0, fileSize: 0.13, isInstalled: true, is3D: false, thumbnail: '💣', features: ['Flags'], controls: ['Click'] },
    { id: 'racing', name: '2D Racing', description: 'Top-down racing', category: 'Racing', difficulty: 'medium', type: 'core', diamondCost: 0, fileSize: 0.31, isInstalled: true, is3D: false, thumbnail: '🏎️', features: ['Laps'], controls: ['Arrows'] },
    { id: 'infinite-roads', name: 'Infinite Roads', description: 'Endless racing', category: 'Racing', difficulty: 'hard', type: 'core', diamondCost: 0, fileSize: 0.28, isInstalled: true, is3D: false, thumbnail: '🛣️', features: ['Procedural'], controls: ['Arrows'] },
    { id: 'space-shooter', name: 'Space Shooter', description: 'Space battle game', category: 'Action', difficulty: 'hard', type: 'core', diamondCost: 0, fileSize: 0.35, isInstalled: true, is3D: false, thumbnail: '🚀', features: ['Waves'], controls: ['Arrows+Space'] },
    { id: 'platformer', name: 'Platformer', description: '2D platform adventure', category: 'Adventure', difficulty: 'hard', type: 'core', diamondCost: 0, fileSize: 0.42, isInstalled: true, is3D: false, thumbnail: '🏃', features: ['Levels'], controls: ['Arrows+Space'] },
    { id: 'cube-runner', name: 'Cube Runner', description: '3D tunnel obstacles', category: 'Arcade', difficulty: 'hard', type: 'core', diamondCost: 0, fileSize: 0.26, isInstalled: true, is3D: false, thumbnail: '🎲', features: ['3D Graphics'], controls: ['Arrows'] },
    { id: 'match-3', name: 'Match-3', description: 'Match colored gems', category: 'Puzzle', difficulty: 'easy', type: 'core', diamondCost: 0, fileSize: 0.27, isInstalled: true, is3D: false, thumbnail: '💎', features: ['Combos'], controls: ['Mouse'] }
];

// FREE DOWNLOADABLE (3 games)
export const FREE_GAMES: Game[] = [
    { id: 'solitaire', name: 'Solitaire', description: 'Classic card game', category: 'Card', difficulty: 'easy', type: 'free', diamondCost: 0, fileSize: 0.35, isInstalled: false, is3D: false, thumbnail: '🃏', features: ['Undo'], controls: ['Mouse'] },
    { id: 'pacman', name: 'Maze Runner', description: 'Maze chase game', category: 'Arcade', difficulty: 'medium', type: 'free', diamondCost: 0, fileSize: 0.29, isInstalled: false, is3D: false, thumbnail: '👻', features: ['Ghost AI'], controls: ['Arrows'] },
    { id: 'bubble-shooter', name: 'Bubble Shooter', description: 'Match bubbles', category: 'Puzzle', difficulty: 'easy', type: 'free', diamondCost: 0, fileSize: 0.23, isInstalled: false, is3D: false, thumbnail: '🫧', features: ['Aim Helper'], controls: ['Mouse'] }
];

// PREMIUM (6 games)
export const PREMIUM_GAMES: Game[] = [
    { id: 'chess', name: 'Chess Master', description: 'Professional chess', category: 'Strategy', difficulty: 'expert', type: 'premium', diamondCost: 50, fileSize: 1.2, isInstalled: false, is3D: false, thumbnail: '♟️', features: ['5 AI Levels'], controls: ['Mouse'] },
    { id: 'sudoku', name: 'Sudoku Pro', description: 'Unlimited puzzles', category: 'Puzzle', difficulty: 'medium', type: 'premium', diamondCost: 50, fileSize: 0.65, isInstalled: false, is3D: false, thumbnail: '🔢', features: ['Hints'], controls: ['Mouse'] },
    { id: 'mahjong', name: 'Mahjong Deluxe', description: 'Tile matching', category: 'Puzzle', difficulty: 'medium', type: 'premium', diamondCost: 50, fileSize: 2.1, isInstalled: false, is3D: false, thumbnail: '🀄', features: ['Layouts'], controls: ['Mouse'] },
    { id: 'tower-defense', name: 'Tower Defense', description: '20+ tower levels', category: 'Strategy', difficulty: 'hard', type: 'premium', diamondCost: 150, fileSize: 3.2, isInstalled: false, is3D: false, thumbnail: '🗼', features: ['8 Towers'], controls: ['Mouse'] },
    { id: 'rpg', name: 'Dungeon RPG', description: 'Dungeon crawler', category: 'RPG', difficulty: 'hard', type: 'premium', diamondCost: 150, fileSize: 4.8, isInstalled: false, is3D: false, thumbnail: '⚔️', features: ['15 Dungeons'], controls: ['Arrows'] },
    { id: 'racing-pro', name: 'Racing Pro', description: '30+ tracks', category: 'Racing', difficulty: 'hard', type: 'premium', diamondCost: 300, fileSize: 8.5, isInstalled: false, is3D: false, thumbnail: '�', features: ['15 Cars'], controls: ['Arrows'] }
];

export function getAllGames(): Game[] { return [...CORE_GAMES, ...FREE_GAMES, ...PREMIUM_GAMES]; }
export function getCoreGames(): Game[] { return CORE_GAMES; }
export function getFreeGames(): Game[] { return FREE_GAMES; }
export function getPremiumGames(): Game[] { return PREMIUM_GAMES; }
export function getGameById(id: string): Game | undefined { return getAllGames().find(g => g.id === id); }
export function getGamesByType(type: 'core' | 'free' | 'premium'): Game[] { return getAllGames().filter(g => g.type === type); }
export function getGamesByCategory(category: string): Game[] { return getAllGames().filter(g => g.category === category); }
export function getCategories(): string[] { const cats = new Set(getAllGames().map(g => g.category)); return Array.from(cats).sort(); }
export function getGameCounts() { return { core: CORE_GAMES.length, free: FREE_GAMES.length, premium: PREMIUM_GAMES.length, total: getAllGames().length }; }

export default { CORE_GAMES, FREE_GAMES, PREMIUM_GAMES, getAllGames, getCoreGames, getFreeGames, getPremiumGames, getGameById, getGamesByType, getGamesByCategory, getCategories, getGameCounts };
