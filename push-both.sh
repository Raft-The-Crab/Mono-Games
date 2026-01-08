#!/bin/bash
# Push to Both Repositories Script
# This script pushes to both the main repo (with .gitignore) and backup repo (everything)

echo "📦 Pushing to repositories..."

# Push to main repository (respects .gitignore)
echo "🔹 Pushing to main repository (Mono-Games)..."
git push origin main

# For backup, we want to push EVERYTHING including ignored files
# First, let's add all files that might be ignored
echo "🔹 Preparing backup push (includes all files)..."

# Temporarily force-add files that are normally ignored for backup
git add -f src/server/ 2>/dev/null || true
git add -f .env.example 2>/dev/null || true
git add -f user-data/ 2>/dev/null || true
git add -f node_modules/ 2>/dev/null || true

# Commit any additional files for backup
git commit -m "Backup: Full project snapshot" --allow-empty

# Push to backup repository
echo "🔹 Pushing to backup repository (Mono-Games-Backup)..."
git push backup main --force

echo "✅ Successfully pushed to both repositories!"
echo "   Main repo: Public distribution only"
echo "   Backup repo: Complete project backup"
