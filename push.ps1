Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to task_manager directory
Set-Location $PSScriptRoot

# Initialize git if needed
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Git init failed!" -ForegroundColor Red
        exit 1
    }
}

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git add failed!" -ForegroundColor Red
    exit 1
}

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: Gamified Task Manager - Full featured task management app with gamification, dark mode, Kanban board, and 12+ advanced features"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Git commit failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "No changes to commit." -ForegroundColor Green
}

# Set remote
Write-Host "Setting up remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/orestismaths-lab/gamified-task-manager.git
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add remote!" -ForegroundColor Red
    exit 1
}

# Set branch to main
Write-Host "Setting branch to main..." -ForegroundColor Yellow
git branch -M main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to set branch!" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "NOTE: You may need to authenticate with GitHub." -ForegroundColor Cyan
Write-Host "If prompted, enter your GitHub username and Personal Access Token (not password)." -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Repository: https://github.com/orestismaths-lab/gamified-task-manager" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Repository does not exist on GitHub - Create it first at: https://github.com/new" -ForegroundColor White
    Write-Host "2. Authentication required - You may need to use a Personal Access Token" -ForegroundColor White
    Write-Host "3. Network issues" -ForegroundColor White
    Write-Host ""
    Write-Host "To create the repository:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name: gamified-task-manager" -ForegroundColor White
    Write-Host "3. Make it Public or Private" -ForegroundColor White
    Write-Host "4. DO NOT initialize with README" -ForegroundColor White
    Write-Host "5. Click 'Create repository'" -ForegroundColor White
    Write-Host "6. Run this script again" -ForegroundColor White
}

