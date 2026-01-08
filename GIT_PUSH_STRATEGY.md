# Git Push Strategy

This project uses a **dual-repository push strategy** for safety and organization.

## Repositories

### 1. Main Repository (Mono-Games)
**URL:** `https://github.com/Raft-The-Crab/Mono-Games.git`  
**Remote name:** `origin`

**Purpose:** Public distribution and documentation

**What gets pushed:**
- ✅ Client-side code (`src/client/`)
- ✅ Public assets
- ✅ Documentation (`README.md`, `docs/`)
- ✅ Build configurations
- ✅ License and contributing guides

**What does NOT get pushed** (blocked by `.gitignore`):
- ❌ Server code (`src/server/`)
- ❌ Environment files (`.env`)
- ❌ User data
- ❌ Database files
- ❌ `node_modules/`
- ❌ Build artifacts

### 2. Backup Repository (Mono-Games-Backup)
**URL:** `https://github.com/Raft-The-Crab/Mono-Games-Backup.git`  
**Remote name:** `backup`

**Purpose:** Complete project backup (EVERYTHING)

**What gets pushed:**
- ✅ **EVERYTHING** - full project snapshot
- ✅ All source code
- ✅ Configuration files
- ✅ Dependencies (if needed)
- ✅ All files regardless of `.gitignore`

⚠️ **IMPORTANT:** This repository MUST be kept PRIVATE!

## How to Push

### Option 1: Push to Both (Recommended)

**Windows (PowerShell):**
```powershell
.\push-both.ps1
```

**Linux/Mac:**
```bash
chmod +x push-both.sh
./push-both.sh
```

### Option 2: Push Manually

**Push to main repository only:**
```bash
git push origin main
```

**Push to backup repository only:**
```bash
git add -A
git commit -m "Backup snapshot"
git push backup main --force
```

## Setup

If you haven't added the backup remote yet:

```bash
git remote add backup https://github.com/Raft-The-Crab/Mono-Games-Backup.git
```

Verify remotes:
```bash
git remote -v
```

Should show:
```
origin  https://github.com/Raft-The-Crab/Mono-Games.git (fetch)
origin  https://github.com/Raft-The-Crab/Mono-Games.git (push)
backup  https://github.com/Raft-The-Crab/Mono-Games-Backup.git (fetch)
backup  https://github.com/Raft-The-Crab/Mono-Games-Backup.git (push)
```

## Workflow

1. **Make changes** to your code
2. **Commit locally:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to both:**
   ```bash
   .\push-both.ps1    # Windows
   # or
   ./push-both.sh     # Linux/Mac
   ```

## Benefits

- 🔒 **Security:** Sensitive files never reach public repo
- 💾 **Safety:** Complete backup always available
- 📋 **Organization:** Clean public repo for distribution
- 🚀 **Flexibility:** Easy disaster recovery from backup

## Notes

- The main repository should be public or private based on your preference
- The backup repository MUST always be private
- Never commit real `.env` files with credentials to either repo
- The backup repo can help recover from accidental deletions
