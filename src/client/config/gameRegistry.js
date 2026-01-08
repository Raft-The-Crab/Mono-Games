/**
 * Enhanced Game Configuration
 * Defines all games available in Mono Games
 */

export const GAME_CATEGORIES = {
  ACTION: 'action',
  PUZZLE: 'puzzle',
  RACING: 'racing',
  SPORTS: 'sports',
  ADVENTURE: 'adventure',
  STRATEGY: 'strategy',
  CASUAL: 'casual',
  SIMULATION: 'simulation',
  ARCADE: 'arcade'
};

export const RENDERER_TYPES = {
  CANVAS_2D: 'canvas2d',
  PIXI: 'pixi',
  PHASER: 'phaser',
  THREE: 'three'
};

export const GAME_REGISTRY = [
  // === CLASSIC GAMES (2D Canvas) ===
  {
    id: 'snake',
    name: 'Snake Classic',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Eat food, grow longer, avoid walls and yourself!',
    difficulty: 'easy',
    installed: true,
    size: '0.5MB',
    rating: 4.5
  },
  {
    id: 'tetris',
    name: 'Tetris',
    category: GAME_CATEGORIES.PUZZLE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Classic block stacking puzzle game',
    difficulty: 'medium',
    installed: true,
    size: '0.8MB',
    rating: 4.8
  },
  {
    id: 'pong',
    name: 'Pong',
    category: GAME_CATEGORIES.SPORTS,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: true,
    aiSupport: true,
    description: 'Classic paddle tennis game',
    difficulty: 'easy',
    installed: true,
    size: '0.4MB',
    rating: 4.3
  },
  {
    id: '2048',
    name: '2048',
    category: GAME_CATEGORIES.PUZZLE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Combine tiles to reach 2048!',
    difficulty: 'medium',
    installed: true,
    size: '0.6MB',
    rating: 4.7
  },
  {
    id: 'breakout',
    name: 'Breakout',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Break all the bricks with your paddle',
    difficulty: 'medium',
    installed: true,
    size: '0.7MB',
    rating: 4.4
  },
  {
    id: 'flappy-bird',
    name: 'Flappy Bird',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Tap to flap through pipes!',
    difficulty: 'medium',
    installed: true,
    size: '0.4MB',
    rating: 4.6,
    new: true
  },
  {
    id: 'brick-breaker',
    name: 'Brick Breaker',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Break bricks, advance levels!',
    difficulty: 'medium',
    installed: true,
    size: '0.5MB',
    rating: 4.5,
    new: true
  },
  {
    id: 'doodle-jump',
    name: 'Doodle Jump',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Jump on platforms, reach new heights!',
    difficulty: 'easy',
    installed: true,
    size: '0.6MB',
    rating: 4.7,
    new: true
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    category: GAME_CATEGORIES.PUZZLE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: true,
    description: 'Find matching pairs of cards',
    difficulty: 'easy',
    installed: true,
    size: '0.5MB',
    rating: 4.2
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    category: GAME_CATEGORIES.PUZZLE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Classic mine detection puzzle',
    difficulty: 'medium',
    installed: true,
    size: '0.5MB',
    rating: 4.6,
    new: true
  },
  {
    id: 'flappy',
    name: 'Flappy Bird',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Tap to flap and avoid pipes!',
    difficulty: 'hard',
    installed: true,
    size: '0.7MB',
    rating: 4.3,
    new: true
  },
  {
    id: 'infinite-roads',
    name: 'Infinite Roads',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: 'babylon',
    multiplayer: false,
    description: 'Relaxing 3D infinite driving with dynamic weather and day/night cycle',
    difficulty: 'easy',
    installed: true,
    size: '1.2MB',
    rating: 4.9,
    new: true,
    is3D: true
  },
  {
    id: 'match-3',
    name: 'Match-3 Gems',
    category: GAME_CATEGORIES.PUZZLE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Classic gem-matching puzzle with cascades and combos',
    difficulty: 'easy',
    installed: true,
    size: '0.7MB',
    rating: 4.7,
    new: true
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    category: GAME_CATEGORIES.STRATEGY,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: true,
    aiSupport: true,
    description: 'Classic X and O strategy game',
    difficulty: 'easy',
    installed: true,
    size: '0.3MB',
    rating: 4.0
  },
  {
    id: 'connect-four',
    name: 'Connect Four',
    category: GAME_CATEGORIES.STRATEGY,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: true,
    aiSupport: true,
    description: 'Connect 4 discs in a row to win',
    difficulty: 'medium',
    installed: true,
    size: '0.6MB',
    rating: 4.5
  },
  {
    id: 'racing',
    name: 'Retro Racing',
    category: GAME_CATEGORIES.RACING,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Top-down retro racing action',
    difficulty: 'medium',
    installed: true,
    size: '1.2MB',
    rating: 4.6
  },

  // === ENHANCED 2D GAMES (Canvas) ===
  {
    id: 'space-shooter',
    name: 'Space Shooter',
    category: GAME_CATEGORIES.ACTION,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Classic arcade space shooter with waves of enemies',
    difficulty: 'medium',
    installed: true,
    size: '1.8MB',
    rating: 4.7,
    new: true
  },
  {
    id: 'platformer',
    name: 'Platform Hero',
    category: GAME_CATEGORIES.ADVENTURE,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Jump and run through challenging levels',
    difficulty: 'medium',
    installed: true,
    size: '2.2MB',
    rating: 4.8,
    new: true
  },
  {
    id: 'tower-defense',
    name: 'Tower Defense',
    category: GAME_CATEGORIES.STRATEGY,
    renderer: RENDERER_TYPES.PIXI,
    multiplayer: false,
    description: 'Build towers to defend your base',
    difficulty: 'hard',
    installed: true,
    size: '3.8MB',
    rating: 4.6
  },
  {
    id: 'dungeon-crawler',
    name: 'Dungeon Crawler',
    category: GAME_CATEGORIES.ADVENTURE,
    renderer: RENDERER_TYPES.PIXI,
    multiplayer: false,
    description: 'Explore dungeons and fight monsters',
    difficulty: 'hard',
    installed: true,
    size: '4.5MB',
    rating: 4.9,
    new: true
  },
  {
    id: 'match-3',
    name: 'Gem Matcher',
    category: GAME_CATEGORIES.PUZZLE,
    renderer: RENDERER_TYPES.PIXI,
    multiplayer: false,
    description: 'Match 3 or more gems to clear them',
    difficulty: 'easy',
    installed: true,
    size: '2.8MB',
    rating: 4.4
  },
  
  // === NEW PREMIUM GAMES (Ultimate Update v2.0) ===
  {
    id: 'poker',
    name: 'Texas Hold\'em Poker',
    category: GAME_CATEGORIES.STRATEGY,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Professional poker with AI opponents',
    difficulty: 'medium',
    installed: true,
    size: '3MB',
    rating: 4.7,
    new: true,
    hot: true
  },
  {
    id: 'kart-racing',
    name: 'Kart Racing',
    category: GAME_CATEGORIES.RACING,
    renderer: RENDERER_TYPES.CANVAS_2D,
    multiplayer: false,
    description: 'Mario Kart style racing with power-ups and drifting',
    difficulty: 'hard',
    installed: true,
    size: '8MB',
    rating: 4.9,
    new: true,
    hot: true
  },
  
  // === CHILL/RELAXATION GAMES (3D Babylon.js) ===
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Peaceful Japanese garden - rake sand, place rocks, grow bonsai. NO SCORING!',
    difficulty: 'easy',
    installed: true,
    size: '6MB',
    rating: 5.0,
    new: true,
    hot: true
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer',
    category: GAME_CATEGORIES.ADVENTURE,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Peaceful cosmic journey - discover planets, fly through nebulae. NO COMBAT!',
    difficulty: 'easy',
    installed: true,
    size: '5MB',
    rating: 5.0,
    new: true
  },
  {
    id: 'campfire-simulator',
    name: 'Campfire Simulator',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Cozy campfire - watch flames, roast marshmallows, relax. NO GOALS!',
    difficulty: 'easy',
    installed: true,
    size: '4MB',
    rating: 5.0,
    new: true
  },

  // === ADVANCED 2D GAMES (Phaser) ===
  {
    id: 'battle-tanks',
    name: 'Battle Tanks',
    category: GAME_CATEGORIES.ACTION,
    renderer: RENDERER_TYPES.PHASER,
    multiplayer: true,
    description: 'Tank warfare in a destructible environment',
    difficulty: 'hard',
    installed: true,
    size: '5.2MB',
    rating: 4.8,
    hot: true
  },
  {
    id: 'flappy-adventure',
    name: 'Flappy Adventure',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.PHASER,
    multiplayer: false,
    description: 'Enhanced flappy bird with power-ups',
    difficulty: 'hard',
    installed: true,
    size: '2.9MB',
    rating: 4.5
  },
  {
    id: 'endless-runner',
    name: 'Endless Runner',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.PHASER,
    multiplayer: false,
    description: 'Run, jump, and collect coins!',
    difficulty: 'medium',
    installed: true,
    size: '3.4MB',
    rating: 4.6
  },
  {
    id: 'side-scroller',
    name: 'Side Scroller',
    category: GAME_CATEGORIES.ADVENTURE,
    renderer: RENDERER_TYPES.PHASER,
    multiplayer: false,
    description: 'Classic side-scrolling action',
    difficulty: 'medium',
    installed: true,
    size: '4.1MB',
    rating: 4.7
  },
  {
    id: 'zombie-survival',
    name: 'Zombie Survival',
    category: GAME_CATEGORIES.ACTION,
    renderer: RENDERER_TYPES.PHASER,
    multiplayer: false,
    description: 'Survive waves of zombies!',
    difficulty: 'hard',
    installed: true,
    size: '5.8MB',
    rating: 4.9,
    hot: true
  },

  // === 3D GAMES (Three.js) ===
  {
    id: 'infinite-roads',
    name: 'Infinite Roads',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Relaxing endless driving through beautiful landscapes',
    difficulty: 'easy',
    installed: true,
    size: '8.5MB',
    rating: 5.0,
    featured: true,
    new: true
  },
  {
    id: 'cube-runner',
    name: 'Cube Runner 3D',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Dodge obstacles in a 3D tunnel',
    difficulty: 'hard',
    installed: true,
    size: '6.2MB',
    rating: 4.7,
    new: true
  },
  {
    id: 'mini-golf',
    name: 'Mini Golf 3D',
    category: GAME_CATEGORIES.SPORTS,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: true,
    description: '3D mini golf with realistic physics',
    difficulty: 'medium',
    installed: true,
    size: '7.8MB',
    rating: 4.8,
    hot: true
  },
  {
    id: 'space-combat',
    name: 'Space Combat 3D',
    category: GAME_CATEGORIES.ACTION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: '3D space dogfighting action',
    difficulty: 'hard',
    installed: true,
    size: '9.2MB',
    rating: 4.9,
    featured: true
  },
  {
    id: 'racing-3d',
    name: 'Racing Fury 3D',
    category: GAME_CATEGORIES.RACING,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'High-speed 3D racing with stunning graphics',
    difficulty: 'hard',
    installed: true,
    size: '10.5MB',
    rating: 4.9,
    featured: true,
    hot: true
  },
  {
    id: 'fps-arena',
    name: 'FPS Arena',
    category: GAME_CATEGORIES.ACTION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: true,
    description: 'First-person shooter arena battles',
    difficulty: 'hard',
    installed: true,
    size: '12.3MB',
    rating: 4.8,
    featured: true
  },
  {
    id: 'block-builder',
    name: 'Block Builder 3D',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Build and explore voxel worlds',
    difficulty: 'easy',
    installed: true,
    size: '11.2MB',
    rating: 4.7
  },
  {
    id: 'flight-sim',
    name: 'Flight Simulator',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Realistic flight simulation',
    difficulty: 'hard',
    installed: true,
    size: '13.5MB',
    rating: 4.8,
    featured: true
  },
  {
    id: 'ball-rolling',
    name: 'Ball Rolling 3D',
    category: GAME_CATEGORIES.ARCADE,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Guide a ball through challenging 3D mazes',
    difficulty: 'medium',
    installed: true,
    size: '7.1MB',
    rating: 4.6
  },
  {
    id: 'city-builder',
    name: 'City Builder 3D',
    category: GAME_CATEGORIES.SIMULATION,
    renderer: RENDERER_TYPES.THREE,
    multiplayer: false,
    description: 'Build and manage your own 3D city',
    difficulty: 'hard',
    installed: true,
    size: '14.8MB',
    rating: 4.9,
    new: true
  }
];

// Export core game IDs for backward compatibility
export const CORE_GAMES = GAME_REGISTRY.map(game => game.id);

// Helper functions
export function getGameById(id) {
  return GAME_REGISTRY.find(game => game.id === id);
}

export function getGamesByCategory(category) {
  return GAME_REGISTRY.filter(game => game.category === category);
}

export function getGamesByRenderer(renderer) {
  return GAME_REGISTRY.filter(game => game.renderer === renderer);
}

export function getMultiplayerGames() {
  return GAME_REGISTRY.filter(game => game.multiplayer);
}

export function getFeaturedGames() {
  return GAME_REGISTRY.filter(game => game.featured);
}

export function getNewGames() {
  return GAME_REGISTRY.filter(game => game.new);
}

export function getHotGames() {
  return GAME_REGISTRY.filter(game => game.hot);
}
