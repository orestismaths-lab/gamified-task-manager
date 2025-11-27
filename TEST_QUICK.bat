@echo off
echo ========================================
echo   Quick Testing Guide
echo ========================================
echo.
echo 1. Starting development server...
echo.
cd /d "%~dp0"
call npm run dev
echo.
echo ========================================
echo   Server started!
echo ========================================
echo.
echo Open your browser: http://localhost:3000
echo.
echo Quick Tests:
echo - Register/Login
echo - Create a task
echo - Edit task
echo - Complete task
echo - Delete task
echo.
echo Press Ctrl+C to stop the server
echo.
pause

