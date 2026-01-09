# 🎮 MONO GAMES - COMPLETE WEBSITE ARCHITECTURE & PLAN

> **For Future AI Context:** This document contains the complete architecture, technology stack, and development plan for the Mono Games platform. Everything here uses FREE services - no paid hosting, no paid APIs, zero costs.

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Zero-Cost Architecture](#zero-cost-architecture)
3. [Technology Stack (All Free)](#technology-stack-all-free)
4. [Local-First Architecture](#local-first-architecture)
5. [Three-Tier Storage System](#three-tier-storage-system)
6. [Game Collection](#game-collection)
7. [AI Implementation](#ai-implementation)
8. [Build & Deployment](#build--deployment)
9. [Development Workflow](#development-workflow)
10. [File Structure](#file-structure)
11. [Key Features](#key-features)
12. [Security & Encryption](#security--encryption)
13. [Performance Optimizations](#performance-optimizations)

---

## 🎯 PROJECT OVERVIEW

**Mono Games** is an offline-first gaming platform focused on **Android APK** and **Windows EXE** deployment (NOT web-based). It features 19+ games with local AI opponents, cloud backup, and zero dependency on paid services.

### Core Principles
- **100% Free Infrastructure** - Uses only free hosting and services
- **Offline-First** - Games work completely offline, sync when online
- **Local AI** - All AI opponents run in the browser (no API calls)
- **Cross-Platform** - Android APK + Windows EXE (Capacitor + Electron)
- **Privacy-Focused** - Data encrypted, stored locally first

### Target Platforms
- ✅ **Android APK** (Capacitor) - PRIMARY TARGET
- ✅ **Windows EXE** (Electron) - PRIMARY TARGET  
- ✅ **Web Browser** (Vercel hosting) - Optional play online
- ❌ macOS/Linux - Not supported

---

## 💰 ZERO-COST ARCHITECTURE

**Everything uses FREE services. We spend $0 on infrastructure.**

### Free Hosting & Services

| Service | Provider | Free Tier | Purpose |
|---------|----------|-----------|---------|
| **Frontend Hosting** | Vercel | Unlimited sites, 100GB bandwidth/month | Host web version |
| **Backend API** | Vercel Serverless | 100GB-hrs/month, 100GB bandwidth | API endpoints |
| **Database** | MongoDB Atlas | 512MB storage, free forever | User data, scores |
| **File Storage** | GitHub (Mono-Data repo) | Unlimited public, 100MB/file | Cloud backup storage |
| **Caching** | Vercel Edge | Included with Vercel | Fast global CDN |
| **Redis Alternative** | In-memory | N/A | Fallback cache (no cost) |
| **Authentication** | JWT (self-managed) | N/A | No auth service fees |
| **CI/CD** | GitHub Actions | 2000 minutes/month | Automated builds |
| **Domain** | Vercel subdomain | Free .vercel.app | No domain costs |
| **SSL/HTTPS** | Vercel | Automatic SSL | Free certificates |
| **WebSocket** | Vercel Serverless | Included | Real-time features |
| **Email** | Optional (not required) | N/A | No email service needed |

### Cost Breakdown: $0.00/month

**We don't pay for:**
- ❌ Hosting (Vercel free tier)
- ❌ Database (MongoDB Atlas free 512MB)
- ❌ Storage (GitHub repos are free)
- ❌ CDN (Vercel Edge included)
- ❌ SSL certificates (Vercel automatic)
- ❌ Redis (use in-memory fallback)
- ❌ Domain (use .vercel.app subdomain)
- ❌ Email service (not needed)
- ❌ AI APIs (all AI is local)

### Why This Works
1. **Small database needs** - User profiles, scores, achievements fit in 512MB
2. **GitHub as file storage** - Backups stored as files in private repo
3. **Vercel's generous limits** - More than enough for gaming platform
4. **In-memory cache fallback** - Redis optional, not required
5. **No AI API costs** - Minimax runs in browser

---

## 🛠️ TECHNOLOGY STACK (ALL FREE)

### Frontend (Browser-Based)
```
React 18.3           - UI library (free, open source)
TypeScript 5.6       - Type safety (free)
Vite 5.4            - Build tool (free, open source)
Babylon.js 7.x      - 3D engine (free, open source)
Canvas 2D API       - 2D games (browser native)
Zustand             - State management (free)
React Router        - Routing (free)
IndexedDB           - Local storage (browser native)
```

### Backend (Serverless)
```
Node.js 20.x        - Runtime (free)
Express 4.21        - API framework (free)
MongoDB Atlas       - Database (512MB free)
JWT                 - Authentication (free library)
bcrypt              - Password hashing (free)
WebSocket (ws)      - Real-time (free)
GitHub API          - File storage (free)
```

### Build & Deploy (Free Tools)
```
Capacitor 6.x       - Android APK builder (free)
Electron            - Windows EXE builder (free)
Gradle              - Android build (free)
Electron Builder    - EXE installer (free)
Vercel CLI          - Deployment (free)
GitHub Actions      - CI/CD (2000 min/month free)
```

### Why No Paid Tools?
- **Babylon.js** instead of Unity/Unreal (free, web-based)
- **MongoDB Atlas** instead of AWS RDS (512MB free tier)
- **Vercel** instead of AWS/Azure (more generous free tier)
- **GitHub storage** instead of S3 (repos are free)
- **In-memory cache** instead of Redis Cloud (optional upgrade)
- **Local AI** instead of OpenAI/Claude (no API costs)

---

## 🏗️ LOCAL-FIRST ARCHITECTURE

### The Problem with Remote-First (Why We Rejected It)

**OLD BROKEN APPROACH:**
```
USER DOWNLOADS EXE/APK (50MB)
        ↓
ELECTRON/WEBVIEW OPENS
        ↓
LOADS https://mono-games.vercel.app  ← REMOTE WEBSITE
        ↓
PWA SERVICE WORKER INSTALLS
        ↓
CACHES *SOME* ASSETS (NOT ALL!)
        ↓
USER GOES OFFLINE
        ↓
❌ SERVICE WORKER CACHE MISS → FAILS
❌ SERVICE WORKER KILLED BY OS → FAILS  
❌ HARD RELOAD BYPASSES CACHE → FAILS
❌ file:// + https:// CONFLICT → FAILS
```

**Why This Fails:**
1. Service workers DON'T guarantee 100% caching
2. Mobile OS kills service workers under memory pressure
3. Service workers can't bridge file:// and https:// protocols
4. Every launch depends on network verification
5. **This is why Steam, Epic, console launchers DON'T use PWAs**

### Our Solution: Local-First (Like Steam)

**NEW WORKING APPROACH:**
```
USER DOWNLOADS EXE/APK (150MB - ALL ASSETS INCLUDED)
        ↓
ELECTRON/MOBILE LAUNCHES
        ↓
LOADS FROM LOCAL DISK (file:// or http://localhost:3000)
        ↓
ALL GAME ASSETS ALREADY BUNDLED IN APP
        ↓  
GAMES RUN 100% OFFLINE
        ↓
FOR ONLINE FEATURES (LEADERBOARD/CLOUD SAVES):
        ↓
APP MAKES API CALLS TO → https://mono-games.vercel.app/api/*
        ↓
✅ OFFLINE: GAMES WORK, NO LEADERBOARD
✅ ONLINE: GAMES WORK + LEADERBOARD + CLOUD SYNC
```

### How Vercel Fits In

Vercel hosts **2 separate things**:

1. **Web Version** (mono-games.vercel.app)
   - For users WITHOUT EXE/APK - play in browser
   - Uses PWA for browser caching
   - Full React app served from Vercel edge
   - This IS remote-first (but browser-only, not wrapped)

2. **API Backend** (mono-games.vercel.app/api/*)
   - For ALL platforms (web + electron + mobile)
   - Handles: auth, leaderboards, cloud sync, achievements, stats
   - Returns JSON only (NO HTML/JS/CSS)
   - FREE serverless functions

### Build Output Structure

```
dist/
├── web/                    ← Deploy to Vercel
│   ├── index.html
│   ├── assets/
│   └── sw.js              ← Service worker (web only)
│
├── electron/
│   ├── main.js            ← Electron entry (serves local files)
│   └── renderer/          ← ALL game assets bundled
│       ├── index.html
│       ├── assets/
│       └── games/         ← All 19+ games included
│
└── mobile/
    └── www/               ← Capacitor android_asset://
        ├── index.html
        ├── assets/
        └── games/         ← All 19+ games included
```

### Network Usage Comparison

**OLD (Broken) Model:**
```
First Launch:  500MB download from Vercel (all assets)
Every Launch:  100KB-10MB (cache validation + missing assets)
Offline:       ❌ 50% failure rate
Total Network: ~600MB first week
```

**NEW (Local-First) Model:**
```
First Launch:  150MB download (one-time EXE/APK)
Every Launch:  0KB (loads from disk)
Offline:       ✅ 100% success rate

Online Mode:   Only API calls (~5-50KB per session)
  - Login: 2KB
  - Submit score: 1KB
  - Fetch leaderboard: 10KB
  - Sync save: 5KB

Total Network: ~150MB first install, then <1MB/month
```

---

## 💾 THREE-TIER STORAGE SYSTEM

**Our storage uses 3 layers for redundancy, all FREE:**

```
┌──────────────┐
│   CLIENT     │
│  (IndexedDB) │  ← All game data saved here first (browser storage)
└──────┬───────┘
       │ When >= 150MB OR manual backup
       ↓
┌──────────────┐
│   BACKEND    │
│  (MongoDB)   │  ← Buffer layer, fallback source (Atlas 512MB free)
└──────┬───────┘
       │ After MongoDB save
       ↓
┌──────────────┐
│   GITHUB     │
│  (Mono-Data) │  ← Primary long-term storage (free private repo)
└──────────────┘
```

### How It Works

1. **Local First**: User plays games → data saves to IndexedDB (browser storage)
2. **Size Monitoring**: Service checks IndexedDB size every 5 minutes
3. **Threshold Trigger**: When size >= 150MB → Auto-backup initiated
4. **Backend Processing**:
   - Client sends data to `/api/cloud-sync/upload`
   - Backend compresses with gzip (60-80% reduction)
   - Backend encrypts with AES-256-GCM
   - Backend saves to MongoDB (buffer)
   - Backend pushes to GitHub (primary storage)
5. **Data Fetching**:
   - Try GitHub first (fast, CDN-backed, free)
   - Fallback to MongoDB if GitHub fails
   - Return decrypted & decompressed data

### Why This Architecture?

- **MongoDB Buffer**: Prevents data loss if GitHub API fails (512MB free tier)
- **GitHub Primary**: Fast fetch, unlimited storage, free, CDN-backed
- **Compression**: 150MB → ~30-45MB (fits GitHub 100MB file limit)
- **Encryption**: Protects passwords, emails, user data
- **Rate Limiting**: Prevents GitHub ban (1/hour, 20/day max)
- **IndexedDB Local**: Instant access, works offline

### Storage Costs: $0/month

- IndexedDB: Free (browser storage, 50-100MB typical)
- MongoDB Atlas: Free (512MB tier, enough for thousands of users)
- GitHub: Free (unlimited public repos, private repos up to 1GB)

### IndexedDB Schema

**Database**: `mono-games-db` (Browser Storage)

**Object Stores:**

1. **gameData** (key: `gameId`)
```typescript
{
  gameId: string,
  scores: number[],
  highScore: number,
  timePlayed: number,
  lastPlayed: Date,
  stats: { wins, losses, draws }
}
```

2. **achievements** (key: `achievementId`)
```typescript
{
  achievementId: string,
  unlockedAt: Date,
  progress: number,
  diamondsEarned: number
}
```

3. **userProfile** (key: `userId`)
```typescript
{
  userId: string,
  username: string,
  email: string,
  diamonds: number,
  level: number,
  xp: number,
  settings: { theme, soundEnabled, musicVolume }
}
```

---

## 🎮 GAME COLLECTION

### 19+ Games (All Free, No Licenses Needed)

**Arcade Classics (2D Canvas):**
- 🐍 Snake - Grow and survive
- 🧱 Tetris - Stack and clear
- 🏓 Pong - Paddle battle with AI
- 🧱 Breakout - Brick destroyer
- 🐦 Flappy Bird - Tap to flap
- 🚀 Space Shooter - Wave combat

**Puzzle & Strategy (2D Canvas + AI):**
- 🔢 2048 - Merge to win
- 🧠 Memory Match - Card matching
- 🎯 Maze Runner - Find the exit
- 💣 Minesweeper - Classic mine finder (4 difficulties)
- ❌ Tic-Tac-Toe - Classic grid (AI opponent, 5 difficulties)
- 🔴 Connect Four - Drop strategy (AI opponent, 5 difficulties)

**Racing & Action (3D Babylon.js):**
- 🌌 Infinite Roads - 3D endless driving (10+ cars, day/night cycle)
- 🏎️ Turbo Racer - Endless lane racing
- 🧊 Cube Runner - Dodge obstacles
- 🧗 Platformer - Side scroller

**Chill Games (No Scoring):**
- 🌙 Zen Garden - Peaceful gardening
- 🪐 Space Explorer - Calm space travel
- 🔥 Campfire Simulator - Cozy campfire
- 🛣️ Infinite Roads - Meditative driving

### Game Features
- All games work 100% offline
- Local AI opponents (no API calls)
- Touch + keyboard + mouse controls
- High score tracking
- Achievement system
- Leaderboards (online only)
- Responsive design (mobile + desktop)

---

## 🤖 AI IMPLEMENTATION

**All AI runs locally in browser - Zero API costs**

### Local AI System

**File**: `src/client/services/localAI.ts`

**Algorithm**: Minimax with Alpha-Beta Pruning

**Supported Games**:
- Tic-Tac-Toe
- Connect Four
- Pong

### Difficulty Levels

| Level | Max Depth | Alpha-Beta | Random | Use Case |
|-------|-----------|------------|--------|----------|
| Easy | 1 | No | 40% | New players |
| Medium | 2 | No | 20% | Casual |
| Hard | 3 | Yes | 0% | Regular |
| Expert | 4 | Yes | 0% | Skilled |
| Impossible | 5 | Yes | 0% | Challenge |

### Tic-Tac-Toe AI Example

```typescript
minimax(board, depth, isMaximizing, alpha, beta) {
  // Base cases
  if (winner === AI) return 10 - depth;
  if (winner === Player) return depth - 10;
  if (tie) return 0;
  
  // Maximizing player (AI)
  if (isMaximizing) {
    let maxScore = -Infinity;
    for each empty cell:
      place AI mark
      score = minimax(board, depth+1, false, alpha, beta)
      undo move
      maxScore = max(maxScore, score)
      alpha = max(alpha, score)
      if (beta <= alpha) break; // Pruning
    return maxScore;
  }
  
  // Minimizing player
  else {
    let minScore = Infinity;
    for each empty cell:
      place player mark
      score = minimax(board, depth+1, true, alpha, beta)
      undo move
      minScore = min(minScore, score)
      beta = min(beta, score)
      if (beta <= alpha) break; // Pruning
    return minScore;
  }
}
```

### Why Local AI?
- **Zero cost** - No OpenAI, Claude, or other AI API fees
- **Instant response** - No network latency
- **Works offline** - No internet required
- **Deterministic** - Same board = same move (predictable)
- **Proven algorithm** - Minimax is tried and tested for board games

---

## 📦 BUILD & DEPLOYMENT

### Build Commands (All Free Tools)

```bash
# Build for Web (Vercel - with PWA)
npm run build:web
# Output: dist/web/ → Deploy to Vercel

# Build for Electron (Local-First - NO PWA)
npm run build:electron
# Output: dist/electron/ → Package as EXE

# Build for Mobile/APK (Local-First - NO PWA)
npm run build:mobile
# Output: dist/mobile/ → Package as APK
```

### Android APK Deployment (FREE)

**Prerequisites (All Free):**
- Node.js 18+ (free)
- Java JDK 11+ (free)
- Android Studio (free)
- Android SDK 30+ (free)
- Gradle 7+ (free)

**Build Steps:**
```bash
# Install Capacitor (free)
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init MonoGames com.monogames.app

# Add Android platform
npx cap add android

# Build frontend
cd src/client
npm run build

# Copy to Capacitor
npx cap copy android
npx cap sync android

# Generate APK (free with Android Studio)
npx cap open android
# In Android Studio: Build > Generate Signed Bundle/APK

# Or via command line:
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Cost: $0** - All tools are free, no Play Store required (direct APK distribution)

### Windows EXE Deployment (FREE)

**Prerequisites (All Free):**
- Node.js 18+ (free)
- Electron (free, open source)
- Electron Builder (free)

**Build Steps:**
```bash
# Install Electron (free)
npm install electron electron-builder --save-dev

# Build frontend
cd src/client
npm run build

# Build Windows EXE (free)
npm run electron:build

# Output: dist-electron/MonoGames-Setup-2.0.0.exe (Installer)
# Output: dist-electron/MonoGames-Portable-2.0.0.exe (Portable)
```

**Cost: $0** - Electron is open source, no Microsoft Store required

### Web Deployment (Vercel - FREE)

**Prerequisites:**
- Vercel account (free)
- GitHub repo (free)

**Deploy Steps:**
```bash
# Install Vercel CLI (free)
npm install -g vercel

# Login (free account)
vercel login

# Deploy (free tier)
vercel --prod

# Or connect GitHub repo in Vercel dashboard (auto-deploy on push)
```

**Cost: $0/month** - Vercel free tier includes:
- 100 GB bandwidth
- Unlimited sites
- Automatic SSL
- Edge caching
- Serverless functions

### Backend Deployment (Vercel Serverless - FREE)

**Deploy Backend:**
```bash
# Backend automatically deploys with frontend on Vercel
# Place API routes in /api folder
# Vercel automatically creates serverless functions

# Example API structure:
/api/auth/login.js        → Serverless function (free)
/api/leaderboard/get.js   → Serverless function (free)
/api/cloud-sync/upload.js → Serverless function (free)
```

**Cost: $0/month** - Vercel serverless includes:
- 100 GB-hrs compute per month
- 100 GB bandwidth
- Automatic scaling
- WebSocket support

---

## 🔧 DEVELOPMENT WORKFLOW

### Setup (All Free Tools)

```bash
# Clone repository (free)
git clone https://github.com/Raft-The-Crab/Mono-Games.git
cd mono-games

# Install dependencies (all free)
npm install

# Start development servers
# Terminal 1 - Backend (Vercel dev)
vercel dev

# Terminal 2 - Frontend (Vite)
cd src/client
npm run dev

# Visit: http://localhost:5173
```

### Environment Variables (Free Services)

**src/server/.env:**
```env
# MongoDB Atlas (512MB free)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mono-games

# JWT (free library)
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# GitHub API (free)
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_REPO=Raft-The-Crab/Mono-Data

# Encryption (free)
ENCRYPTION_KEY=your_32_byte_hex_key

# Redis (optional, fallback to in-memory - free)
REDIS_ENABLED=false
```

**src/client/.env:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

### Git Workflow (Free)

```bash
# Create feature branch
git checkout -b feature/new-game

# Make changes and commit
git add .
git commit -m "✨ feat: Add new game"

# Push to GitHub (free)
git push origin feature/new-game

# Vercel auto-deploys on push (free)
```

---

## 📁 FILE STRUCTURE

```
mono-games/
├── src/
│   ├── client/                 # Frontend (React + Vite)
│   │   ├── components/         # UI components
│   │   ├── pages/             # Page components
│   │   ├── games/             # Game implementations
│   │   │   ├── core/          # Built-in games
│   │   │   ├── downloadable/  # Premium games
│   │   │   └── shared/        # Shared utilities
│   │   ├── services/          # Business logic
│   │   │   ├── localAI.ts     # Local AI (minimax)
│   │   │   ├── offlineStorage.ts # IndexedDB wrapper
│   │   │   └── githubSync.ts  # GitHub backup
│   │   └── store/             # State management
│   │
│   └── server/                # Backend (Node.js + Express)
│       ├── routes/            # API endpoints
│       ├── services/          # Business logic
│       └── middleware/        # Auth, CORS
│
├── api/                       # Vercel serverless functions
│   ├── auth.js
│   ├── leaderboard.js
│   └── cloud-sync.js
│
├── public/                    # Static assets
├── docs/                      # Documentation
│   └── Main-Concept.md       # THIS FILE
├── desktop/                   # Electron wrapper
├── android/                   # Capacitor Android
└── package.json              # Dependencies
```

---

## ⭐ KEY FEATURES

### 1. Offline-First Architecture
- All 19+ games work 100% offline
- IndexedDB stores all user data locally
- Cloud sync only when online (optional)

### 2. Local AI Opponents
- Minimax algorithm for Tic-Tac-Toe, Connect Four
- 5 difficulty levels (Easy → Impossible)
- Zero API costs, instant response

### 3. Cloud Backup System
- Auto-backup when IndexedDB reaches 150MB
- 3-tier storage: IndexedDB → MongoDB → GitHub
- Compression (60-80% reduction) + AES-256-GCM encryption

### 4. Achievement System
- 50+ achievements to unlock
- Diamond rewards (in-game currency)
- Tracked locally and synced to cloud

### 5. Leaderboards
- Global leaderboards for 8 games
- Cached in MongoDB for fast access
- Backed up to GitHub for persistence

### 6. Daily Challenges
- Auto-generated using seeded random (deterministic)
- No server required (client-side generation)
- Diamond rewards for completion

### 7. 3D Graphics
- Babylon.js powered immersive games
- Day/night cycle, weather effects
- 10+ car models, dynamic scenery

### 8. Cross-Platform
- Android APK (Capacitor)
- Windows EXE (Electron)
- Web browser (Vercel)
- Same codebase for all platforms

---

## 🔒 SECURITY & ENCRYPTION

### Encryption (Free)

**Algorithm**: AES-256-GCM (Authenticated Encryption)

**What Gets Encrypted:**
- User emails
- User passwords (also bcrypt hashed)
- User profile data
- Achievement progress
- Game statistics

**Encryption Function:**
```typescript
function encryptData(data) {
  const iv = crypto.randomBytes(12); // Random IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}
```

**Decryption Function:**
```typescript
function decryptData(encryptedData) {
  const iv = Buffer.from(encryptedData.slice(0, 24), 'hex');
  const authTag = Buffer.from(encryptedData.slice(24, 56), 'hex');
  const encrypted = encryptedData.slice(56);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**Cost: $0** - Uses Node.js crypto module (free, built-in)

### Compression (Free)

**Algorithm**: gzip (zlib library)

**Compression Ratios:**
- Game scores: 150 MB → 35 MB (77% reduction)
- Achievements: 50 MB → 8 MB (84% reduction)
- User profiles: 100 MB → 25 MB (75% reduction)
- **Average: 70-80% reduction**

**Why Compression Matters:**
- GitHub file limit: 100 MB per file
- 150 MB → 30-45 MB (fits easily)
- Faster uploads/downloads
- Less bandwidth usage

**Cost: $0** - Uses Node.js zlib module (free, built-in)

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### Babylon.js Optimizations (Free Techniques)

1. **Level of Detail (LOD)**
   - High detail < 50m
   - Medium detail 50-100m
   - Low detail 100-200m
   - Hide > 200m

2. **Object Pooling**
   - Reuse meshes instead of creating/destroying
   - Reduces garbage collection

3. **Frustum Culling**
   - Don't render objects outside camera view
   - Babylon.js does this automatically

4. **Merge Meshes**
   - Combine static meshes into one
   - Reduces draw calls (100 → 1)

5. **Texture Atlases**
   - Combine multiple textures into one
   - Reduces texture switches

6. **Instancing**
   - Use instances for repeated objects
   - 1 draw call for 50+ objects

### Mobile Optimizations

```typescript
function applyMobileOptimizations() {
  if (isLowEndDevice()) {
    // Reduce graphics quality
    bloomEnabled = false;
    depthOfFieldEnabled = false;
    shadowsEnabled = false;
    
    // Reduce render distance
    camera.maxZ = 500; // Instead of 1000
    
    // Reduce particle count
    particleEmitRate = 100; // Instead of 500
    
    // Lower resolution
    engine.setHardwareScalingLevel(2); // Render at 0.5x
  }
}
```

### Bundle Size Optimization

- Code splitting (lazy load games)
- Tree shaking (remove unused code)
- Minification (terser)
- Compression (gzip)
- Remove console.log in production

**Result:** 
- Initial bundle: ~15 MB
- Per-game chunk: ~2-5 MB
- Total games: ~50 MB (lazy loaded)

---

## 🎯 SUMMARY FOR AI

**When you see this project, remember:**

1. **Zero Cost**: Everything uses FREE services (Vercel, MongoDB Atlas, GitHub storage)
2. **Local-First**: Games work 100% offline, bundled in EXE/APK
3. **Free AI**: All AI runs in browser (minimax), no API costs
4. **Free Hosting**: Vercel free tier for web + serverless API
5. **Free Database**: MongoDB Atlas 512MB free tier
6. **Free Storage**: GitHub repos for cloud backup
7. **Free Tools**: Electron, Capacitor, Vite, Babylon.js all open source

**Architecture:**
- Frontend: React + Vite + Babylon.js
- Backend: Vercel serverless + MongoDB Atlas + GitHub storage
- Platforms: Android APK, Windows EXE, Web browser
- Storage: IndexedDB → MongoDB → GitHub (3-tier backup)
- AI: Local minimax (no API calls)

**No Paid Services:**
- ❌ No AWS/Azure
- ❌ No OpenAI/Claude
- ❌ No Redis Cloud
- ❌ No paid databases
- ❌ No paid hosting
- ❌ No domain costs

**Everything is FREE. Total cost: $0/month.**

---

**END OF MAIN CONCEPT DOCUMENT**

*This is the single source of truth for the Mono Games architecture.*
*Last updated: January 9, 2026*
