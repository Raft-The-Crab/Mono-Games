# 🎮 MONO GAMES - MAIN PLAN & ARCHITECTURE
## **ZERO-COST CONSTRAINT: ALL FREE SERVICES ONLY**

> **Last Updated:** January 2026  
> **For AI Agents:** This document provides the complete context for understanding and working on this project.

---

## 🎯 PROJECT OVERVIEW

**Mono Games** is a gaming platform designed to work on **Android APK** and **Windows EXE** without spending any money on hosting or services.

### Core Principles
1. **100% FREE** - No paid hosting, databases, or services
2. **LOCAL-FIRST** - All games bundled in the app, work offline
3. **OPTIONAL CLOUD** - Online features only if internet available
4. **NO MONEY SPENT** - Every service uses free tiers only

---

## 💰 ZERO-COST ARCHITECTURE

### Why Zero Cost?
- This is a personal/hobby project
- Cannot afford paid hosting or databases
- Must use free tiers of all services
- App must work perfectly offline

### Free Services We Use

#### 1. **Vercel (Free Tier)**
- **Cost:** $0/month
- **What it hosts:**
  - Web version (optional - for browser players)
  - API backend (authentication, leaderboards, cloud saves)
- **Limits:** 
  - 100GB bandwidth/month
  - 100,000 function invocations/month
  - Serverless functions (12 second timeout)
  - Concurrent executions: 10
- **Why it's enough:** Most players use offline mode, API calls are minimal (~10-20 per user session)

#### 2. **MongoDB Atlas (Free Tier)**
- **Cost:** $0/month
- **Storage:** 512MB
- **What we store:**
  - User accounts (~2KB each)
  - Leaderboard scores (~500 bytes each)
  - Cloud saves (compressed ~5KB each)
  - Achievements (~100 bytes each)
- **Why it's enough:** 512MB = ~50,000 users with full data
  - Calculation: 2KB (account) + 5KB (saves) + 1KB (scores/achievements) = ~10KB per user
  - 512MB / 10KB = ~51,200 users capacity

#### 3. **GitHub (Free)**
- **Cost:** $0/month
- **What we use:**
  - Source code hosting
  - Version control
  - Issue tracking
  - GitHub Pages (if needed)

#### 4. **Upstash Redis (Free Tier)**
- **Cost:** $0/month
- **Storage:** 256MB RAM
- **Limits:** 10,000 requests/day
- **What we cache:**
  - Leaderboard rankings (refreshed hourly)
  - Active sessions (short-lived)
  - Rate limiting data
- **Why it's enough:** RAM cache for hot data only, ~350 requests/day per active user
  - 10,000 requests/day = ~30 concurrent active users
  - Inactive users read from MongoDB (slower but acceptable)

---

## 🏗️ ARCHITECTURE: LOCAL-FIRST DESIGN

### The Problem We Solved

**OLD BAD WAY (Doesn't Work):**
```
Download EXE/APK → Load from remote website → Hope it caches → ❌ Fails offline
```

**NEW CORRECT WAY (Like Steam):**
```
Download EXE/APK (includes all games) → Load from local disk → ✅ Works 100% offline
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│          USER DOWNLOADS APP (150MB)             │
│    (Includes ALL games, assets, code)           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │   ELECTRON (Windows EXE)    │
    │   or CAPACITOR (Android)    │
    │   Loads from LOCAL DISK     │
    └─────────────┬───────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  ALL 19+ GAMES │
         │  Work OFFLINE  │
         └────────┬───────┘
                  │
                  │ (Optional, if online)
                  ▼
    ┌──────────────────────────────────┐
    │    VERCEL API (FREE TIER)        │
    │  - Login/Register                │
    │  - Leaderboard Submit/Fetch      │
    │  - Cloud Save Sync               │
    │  - Achievement Tracking          │
    └──────────────────────────────────┘
                  │
                  ▼
    ┌──────────────────────────────────┐
    │   MONGODB ATLAS (FREE TIER)      │
    │   - Users (512MB storage)        │
    │   - Scores, Saves, Achievements  │
    └──────────────────────────────────┘
```

### How It Works

#### Offline Mode (Default)
1. User launches app
2. App loads games from local disk (file:// or localhost:3000)
3. All 19+ games work perfectly
4. Scores saved locally (IndexedDB)
5. No internet required

#### Online Mode (Optional)
1. User has internet connection
2. App detects connection
3. Shows "Sync" button
4. User can:
   - Upload scores to leaderboard
   - Sync saves to cloud
   - Download other players' scores
5. Data syncs in background
6. Goes back to offline if connection lost

---

## 📦 BUILD TARGETS

We build 3 different versions:

### 1. Web Version (Vercel)
- **For:** Browser players (optional)
- **URL:** https://mono-games.vercel.app
- **Size:** ~15MB initial load, lazy load rest
- **Works:** With service worker for offline
- **Command:** `npm run build:web`

### 2. Electron (Windows EXE)
- **For:** Windows desktop players (PRIMARY)
- **Size:** ~150MB (includes everything)
- **Loads from:** Local disk (file:// or localhost:3000)
- **Works:** 100% offline
- **Command:** `npm run build:electron && npm run package:electron`

### 3. Capacitor (Android APK)
- **For:** Android mobile players (PRIMARY)
- **Size:** ~120MB (includes everything)
- **Loads from:** android_asset://www/
- **Works:** 100% offline
- **Command:** `npm run build:mobile && npm run package:android`

---

## 🎮 GAME ARCHITECTURE

### Dual Renderer System

We support both 2D and 3D games:

#### 2D Games (Canvas API)
- **Engine:** HTML5 Canvas 2D
- **Examples:** Snake, Tetris, 2048, Pong
- **Size:** ~10KB per game
- **Performance:** Runs on any device

#### 3D Games (Babylon.js)
- **Engine:** Babylon.js + WebGL
- **Examples:** Infinite Roads, Cube Runner, Space Explorer
- **Size:** ~50KB per game + 5MB Babylon.js (shared)
- **Performance:** Needs modern GPU

### Game Catalog Structure

```typescript
interface GameConfig {
  id: string;              // "snake", "tetris", etc.
  name: string;            // "Snake Game"
  renderer: '2d' | '3d';   // Which engine to use
  category: string;        // "arcade", "puzzle", "chill"
  premium: boolean;        // Requires diamonds to unlock
  chillMode: boolean;      // No scoring, just relax
  offline: boolean;        // Always true for us!
}
```

---

## 🛠️ TECHNOLOGY STACK

### Frontend (Client)
- **React 18.3** - UI framework (free, open source)
- **TypeScript 5.6** - Type safety (free, open source)
- **Vite 5.4** - Build tool (free, open source)
- **Babylon.js 7.x** - 3D engine (free, open source)
- **Zustand** - State management (free, open source)
- **IndexedDB** - Local storage (free, browser built-in)

### Backend (Server)
- **Node.js 20.x** - Runtime (free, open source)
- **Express 4.21** - API framework (free, open source)
- **MongoDB Atlas** - Database (free tier: 512MB)
- **Redis (Upstash)** - Cache (free tier: 256MB)
- **JWT** - Authentication (free, open source)
- **WebSocket** - Real-time (free, open source)

### Build & Deployment (All Free)
- **Electron** - Windows EXE (free, open source)
- **Capacitor** - Android APK (free, open source)
- **Vercel** - Hosting (free tier: 100GB/month)
- **GitHub** - Version control (free)
- **Gradle** - Android build (free, open source)

**TOTAL COST: $0.00/month** ✅

---

## 📊 DATA STORAGE STRATEGY

### Local Storage (IndexedDB)
- **Where:** User's device
- **Size:** Unlimited (usually 50MB-10GB available)
- **What we store:**
  - Game saves
  - High scores
  - Settings
  - Achievements
  - Statistics
- **Syncs to cloud:** When user chooses

### Cloud Storage (MongoDB Free Tier)
- **Where:** MongoDB Atlas (512MB limit)
- **What we store:**
  - User accounts (~2KB each)
  - Leaderboard scores (~500 bytes each)
  - Cloud saves (compressed ~5KB each)
  - Achievements (~100 bytes each)
- **Optimization:** Compression, deduplication
- **Capacity:** ~50,000 users with full data

### Cache Layer (Redis Free Tier)
- **Where:** Upstash Redis (256MB RAM)
- **What we cache:**
  - Top 100 leaderboard (refreshes hourly)
  - Active sessions
  - Rate limiting counters
- **Expiry:** Auto-expire after 24 hours

---

## 🔌 HOW OFFLINE/ONLINE WORKS

### Offline-First Flow

```javascript
// On game end
async function saveGameResult(result) {
  // 1. Always save locally first
  await IndexedDB.save(result);
  
  // 2. Try to sync if online (don't wait)
  if (navigator.onLine) {
    syncToCloud(result).catch(err => {
      console.log('Sync failed, will retry later');
    });
  }
  
  // 3. User sees their score immediately (from local DB)
  showScore(result);
}

// Periodic background sync
setInterval(() => {
  if (navigator.onLine) {
    syncPendingSaves();
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

### Sync Strategy

**When to sync:**
- Manual: User clicks "Sync Now" button
- Auto: After 100 games played locally
- Auto: After 7 days offline
- Auto: When app launches (if online)

**What syncs:**
- New high scores only (not all games)
- Changed achievements
- Cloud save (latest version wins)

**Bandwidth usage:**
- ~1KB per score
- ~5KB per cloud save
- ~50KB total per sync session

---

## 🚀 DEVELOPMENT WORKFLOW

### Setup (First Time)

```bash
# 1. Clone repository
git clone https://github.com/Raft-The-Crab/Mono-Games.git
cd Mono-Games

# 2. Install dependencies
npm install

# 3. Start development (frontend only)
npm run dev
# Opens http://localhost:5173
```

### Running Backend Locally (Optional)

```bash
# 4. Setup backend (in separate terminal)
cd src/server
cp .env.example .env
# Edit .env with your MongoDB Atlas free tier connection string
npm install
node server.js
# Backend runs on http://localhost:5000
```

### Build Commands

```bash
# Build web version (deploy to Vercel)
npm run build:web

# Build Windows EXE
npm run build:electron
npm run package:electron
# Output: dist/Mono-Games-Setup.exe

# Build Android APK
npm run build:mobile
npm run package:android
# Output: dist/mobile/app-release.apk
```

---

## 📱 PLATFORM-SPECIFIC DETAILS

### Windows (Electron)

**File Structure:**
```
Mono-Games-Setup.exe (installer)
  └─ Installs to C:\Program Files\Mono Games\
      ├─ Mono Games.exe (150MB)
      ├─ resources/
      │   └─ app.asar (contains all games)
      └─ (Electron runtime files)
```

**How it loads:**
```javascript
// main.js (Electron entry)
const win = new BrowserWindow({...});

// Option A: Load from file://
win.loadFile(path.join(__dirname, 'renderer/index.html'));

// Option B: Local server (better for CORS)
const express = require('express');
const app = express();
app.use(express.static('renderer'));
app.listen(3000);
win.loadURL('http://localhost:3000');
```

### Android (Capacitor)

**File Structure:**
```
mono-games.apk (120MB)
  └─ Extracts to /data/data/com.monogames.app/
      ├─ www/ (all games bundled)
      │   ├─ index.html
      │   ├─ assets/
      │   └─ games/
      └─ (Capacitor runtime)
```

**How it loads:**
```javascript
// capacitor.config.json
{
  "webDir": "dist/mobile/www",
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "api.mono-games.vercel.app"  // Only allow API calls
    ]
  }
}

// Loads from: android_asset://www/index.html
```

---

## 🎯 GAME DEVELOPMENT GUIDE

### Adding a New 2D Game

1. Create game file: `src/client/games/MyGame.ts`

```typescript
import { BaseGame2D } from './BaseGame2D';

export class MyGame extends BaseGame2D {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  init() {
    // Setup game
  }

  update(deltaTime: number) {
    // Game logic
  }

  render() {
    // Draw game
  }
}
```

2. Add to game catalog: `src/client/data/games.ts`

```typescript
{
  id: 'my-game',
  name: 'My Game',
  renderer: '2d',
  category: 'arcade',
  premium: false,
  offline: true
}
```

### Adding a New 3D Game

1. Create game file: `src/client/games/downloadable/MyGame3D.ts`

```typescript
import { BaseGame3D } from './BaseGame3D';

export class MyGame3D extends BaseGame3D {
  async init() {
    // Setup Babylon.js scene
    this.scene = new Scene(this.engine);
    // Add meshes, lights, camera
  }

  update() {
    // Game logic (runs every frame)
  }
}
```

2. Add to game catalog with `renderer: '3d'`

---

## 🔐 SECURITY & ANTI-CHEAT

### JWT Authentication (Free)
- Server generates JWT tokens
- Client stores in localStorage
- Expires after 7 days
- Refresh token flow

### Score Validation
- Server validates score ranges
- Detects impossible scores
- Rate limiting (max 10 submits/minute)
- Suspicious scores flagged for review

### Data Encryption
- HTTPS for API calls (free with Vercel)
- bcrypt for password hashing
- JWT tokens signed with secret key
- Local IndexedDB not encrypted (acceptable for game data)

---

## 📈 SCALABILITY PLAN (Still Free!)

### If We Reach Free Tier Limits

**MongoDB 512MB Full:**
- Solution: Delete old inactive accounts (>1 year)
- Compress save files more aggressively
- Archive leaderboards older than 6 months

**Vercel 100GB Bandwidth:**
- Solution: Use CDN for assets (Cloudflare free tier)
- Aggressive caching headers
- Lazy load game assets

**Redis 256MB Cache:**
- Solution: Reduce TTL (expire after 1 hour instead of 24)
- Cache only top 50 instead of top 100
- Use memory-efficient data structures

**All solutions remain FREE** ✅

---

## 🎮 GAME LIBRARY (19+ Games)

### Core Games (FREE - All Offline)

**Arcade:**
- 🐍 Snake - Classic grow-and-survive
- 🧱 Tetris - Line-clearing puzzle
- 🏓 Pong - Paddle battle
- 🧱 Breakout - Brick destroyer
- 🐦 Flappy Bird - Tap to flap
- 🚀 Space Shooter - Wave combat

**Puzzle:**
- 🔢 2048 - Merge to win
- 🧠 Memory Match - Card matching
- 🎯 Maze Runner - Find the exit
- 💣 Minesweeper - Mine detection
- ❌ Tic-Tac-Toe - Classic grid
- 🔴 Connect Four - Drop strategy

**Racing:**
- 🌌 Infinite Roads - 3D driving
- 🏎️ Turbo Racer - Endless lanes
- 🧊 Cube Runner - Dodge obstacles

**Chill Games (No Scoring):**
- 🌙 Zen Garden - Peaceful gardening
- 🪐 Space Explorer - Calm space travel
- 🔥 Campfire Simulator - Cozy fire
- 🛣️ Infinite Roads - Meditative driving

---

## 🗺️ ROADMAP

### ✅ Phase 1: Foundation (DONE)
- [x] Local-first architecture
- [x] Electron + Capacitor setup
- [x] 19+ games working offline
- [x] Dual renderer (2D + 3D)
- [x] Free tier backend (Vercel + MongoDB)

### 🚧 Phase 2: Polish (IN PROGRESS)
- [ ] Achievement animations
- [ ] Better game launcher UI
- [ ] In-app help system
- [ ] Auto-update mechanism
- [ ] Performance optimizations

### 🔮 Phase 3: Social Features (FUTURE)
- [ ] Friend system (uses MongoDB free tier)
- [ ] Share scores on social media
- [ ] Daily challenges (generated client-side)
- [ ] Tournaments (manual, not automated)

**All features remain FREE** ✅

---

## 🆘 COMMON ISSUES & SOLUTIONS

### "Games don't work offline"
- **Cause:** App is loading from remote URL instead of local disk
- **Fix:** Ensure Electron loads from `file://` or `localhost`, not `https://`

### "MongoDB connection failed"
- **Cause:** Not using MongoDB Atlas free tier connection string
- **Fix:** Sign up at mongodb.com, create free cluster, copy connection string to .env

### "Vercel deployment failed"
- **Cause:** Exceeding free tier limits or wrong build command
- **Fix:** Check Vercel dashboard, ensure `npm run build:web` works locally

### "APK won't install"
- **Cause:** Android security blocks unknown sources
- **Fix:** Enable "Install from Unknown Sources" in Android settings

### "EXE flagged as virus"
- **Cause:** Electron apps sometimes trigger false positives
- **Fix:** Normal behavior, submit to antivirus companies for whitelisting

---

## 📚 DOCUMENTATION FILES

After cleanup, we only keep these docs:

1. **README.md** - User-facing project description
2. **MAIN_PLAN.md** (this file) - Complete architecture for AI agents
3. **docs/ARCHITECTURE.md** - Technical deep dive (backup reference)

**All other docs removed** to reduce confusion.

---

## 🤝 CONTRIBUTING

### For Developers

1. Read this entire document first
2. Understand the zero-cost constraint
3. Never add paid services or dependencies
4. Test offline functionality before committing
5. Keep bundle size small

### Commit Convention

```
✨ feat: Add new game
🐛 fix: Fix offline bug
📚 docs: Update documentation
🎨 style: UI improvements
⚡ perf: Performance optimization
🔒 security: Security fix
```

---

## 💡 KEY PRINCIPLES TO REMEMBER

1. **NO MONEY SPENT** - Only use free tiers
2. **OFFLINE FIRST** - Everything works without internet
3. **ONLINE OPTIONAL** - Cloud features are enhancements only
4. **LOCAL BUNDLE** - All games included in download
5. **LIKE STEAM** - Not like a website
6. **FREE FOREVER** - This is sustainable architecture

---

## 📞 FOR AI AGENTS

When working on this project:

- ✅ DO: Prioritize offline functionality
- ✅ DO: Use free services only
- ✅ DO: Test in offline mode
- ✅ DO: Keep bundle size reasonable
- ✅ DO: Make incremental changes

- ❌ DON'T: Add paid services
- ❌ DON'T: Assume internet is available
- ❌ DON'T: Load games from remote URLs
- ❌ DON'T: Break offline functionality
- ❌ DON'T: Add large dependencies unnecessarily

---

## 🎯 SUCCESS CRITERIA

This project is successful when:

1. ✅ All 19+ games work 100% offline
2. ✅ Windows EXE and Android APK built successfully
3. ✅ Total monthly cost = $0.00
4. ✅ Leaderboards work when online
5. ✅ Cloud saves sync when available
6. ✅ App never requires internet to function
7. ✅ User experience is smooth and polished

---

**Last Updated:** January 9, 2026  
**Project Status:** Active Development  
**Monthly Cost:** $0.00 (FREE FOREVER!)

---

_This document is the single source of truth for AI agents working on Mono Games._
