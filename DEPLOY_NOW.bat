@echo off
echo ========================================
echo   Quick Deployment Helper
echo ========================================
echo.
echo This script will help you deploy to Vercel
echo.
echo Options:
echo   1. Deploy with Vercel CLI (requires: npm i -g vercel)
echo   2. Open Vercel Dashboard (manual deployment)
echo   3. Open Netlify Dashboard
echo   4. View deployment guides
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Checking Vercel CLI...
    vercel --version >nul 2>&1
    if errorlevel 1 (
        echo Vercel CLI not found. Installing...
        npm i -g vercel
    )
    echo.
    echo Deploying to Vercel...
    cd task_manager
    vercel
    cd ..
) else if "%choice%"=="2" (
    echo.
    echo Opening Vercel Dashboard...
    start https://vercel.com/new
    echo.
    echo IMPORTANT: Set Root Directory to: task_manager
) else if "%choice%"=="3" (
    echo.
    echo Opening Netlify Dashboard...
    start https://app.netlify.com
    echo.
    echo IMPORTANT: Set Base directory to: task_manager
) else if "%choice%"=="4" (
    echo.
    echo Opening deployment guides...
    start DEPLOY_QUICK.md
    start DEPLOYMENT_GUIDE.md
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Done!
echo ========================================
pause

