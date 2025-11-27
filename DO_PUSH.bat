@echo off
chcp 65001 >nul
echo ========================================
echo Pushing to GitHub...
echo Repository: orestismaths-lab/gamified-task-manager
echo ========================================
echo.

cd /d "%~dp0"

REM Initialize git
if not exist .git (
    echo [1/6] Initializing git...
    git init
)

REM Add files
echo [2/6] Adding files...
git add .

REM Commit
echo [3/6] Committing...
git commit -m "Initial commit: Gamified Task Manager - Full featured task management app" 2>nul
if errorlevel 1 (
    echo No changes to commit or commit already exists.
)

REM Set remote
echo [4/6] Setting remote...
git remote remove origin 2>nul
git remote add origin https://github.com/orestismaths-lab/gamified-task-manager.git

REM Set branch
echo [5/6] Setting branch to main...
git branch -M main 2>nul

REM Push
echo [6/6] Pushing to GitHub...
echo.
echo NOTE: If authentication is required, use your GitHub username
echo and Personal Access Token (not password).
echo.
git push -u origin main

echo.
if errorlevel 1 (
    echo ========================================
    echo Push may have failed. Check the error above.
    echo ========================================
    echo.
    echo If you see "repository not found", make sure:
    echo 1. The repository exists at: https://github.com/orestismaths-lab/gamified-task-manager
    echo 2. You have write access to it
    echo.
    echo If you see authentication errors:
    echo 1. Use Personal Access Token instead of password
    echo 2. Create token at: https://github.com/settings/tokens
    echo.
) else (
    echo ========================================
    echo SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo Repository: https://github.com/orestismaths-lab/gamified-task-manager
    echo.
)

pause

