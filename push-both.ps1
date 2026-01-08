# Push to Both Repositories (PowerShell)
# This script pushes to both the main repo (with .gitignore) and backup repo (everything)

Write-Host "📦 Pushing to repositories..." -ForegroundColor Cyan

# Push to main repository (respects .gitignore)
Write-Host "🔹 Pushing to main repository (Mono-Games)..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to main repository" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pushed to main repository" -ForegroundColor Green

# For backup repository - push everything
Write-Host "🔹 Pushing to backup repository (Mono-Games-Backup)..." -ForegroundColor Yellow

# Create a commit for backup (may include files ignored by .gitignore)
git add -A
git commit -m "Backup: Full project snapshot $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" --allow-empty

# Push to backup
git push backup main --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to backup repository" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pushed to backup repository" -ForegroundColor Green
Write-Host ""
Write-Host "✨ Successfully pushed to both repositories!" -ForegroundColor Cyan
Write-Host "   📋 Main repo (Mono-Games): Public distribution only" -ForegroundColor White
Write-Host "   💾 Backup repo (Mono-Games-Backup): Complete project backup" -ForegroundColor White
