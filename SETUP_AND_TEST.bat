@echo off
echo ========================================
echo   Automated Setup and Test
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found
node --version
echo.

echo [2/4] Installing dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)
echo.

echo [3/4] Checking Firebase config...
findstr /C:"apiKey" lib\firebase.ts >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Firebase config might be missing
) else (
    echo ✅ Firebase config file exists
)
echo.

echo [4/4] Starting development server...
echo.
echo ========================================
echo   Server starting...
echo ========================================
echo.
echo Open your browser: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

