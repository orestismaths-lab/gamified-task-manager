@echo off
echo ========================================
echo   Start Task Manager - Production Mode
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found
echo.

echo [2/3] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful
echo.

echo [3/3] Starting production server on all network interfaces (port 3000)...
echo.
echo ========================================
echo   Server running on:
echo   - Local:   http://localhost:3000
echo   - Network: http://YOUR_PC_NAME:3000  (ή http://YOUR_IP:3000)
echo ========================================
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

call npm run start:lan


