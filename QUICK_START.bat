@echo off
echo ========================================
echo   Quick Start - Task Manager
echo ========================================
echo.

cd /d "%~dp0"

echo Starting development server...
echo.
echo ========================================
echo   Server will start on:
echo   http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop
echo.

call npm run dev

