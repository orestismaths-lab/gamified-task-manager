@echo off
echo ========================================
echo Pushing to GitHub...
echo ========================================

REM Initialize git if needed
if not exist .git (
    echo Initializing git repository...
    git init
)

REM Add all files
echo Adding files...
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% neq 0 (
    echo Committing changes...
    git commit -m "Initial commit: Gamified Task Manager - Full featured task management app with gamification, dark mode, Kanban board, and 12+ advanced features"
) else (
    echo No changes to commit.
)

REM Set remote
echo Setting up remote...
git remote remove origin 2>nul
git remote add origin https://github.com/orestismaths-lab/gamified-task-manager.git

REM Set branch to main
git branch -M main

REM Push to GitHub
echo Pushing to GitHub...
echo.
echo NOTE: You may need to authenticate with GitHub.
echo If prompted, enter your GitHub username and Personal Access Token (not password).
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo Repository: https://github.com/orestismaths-lab/gamified-task-manager
) else (
    echo.
    echo ========================================
    echo ERROR: Push failed!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Repository does not exist on GitHub - Create it first at: https://github.com/new
    echo 2. Authentication required - You may need to use a Personal Access Token
    echo 3. Network issues
    echo.
    echo To create the repository:
    echo 1. Go to: https://github.com/new
    echo 2. Repository name: gamified-task-manager
    echo 3. Make it Public or Private
    echo 4. DO NOT initialize with README
    echo 5. Click "Create repository"
    echo 6. Run this script again
)

pause

