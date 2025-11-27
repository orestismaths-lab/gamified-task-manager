@echo off
echo ========================================
echo Gamified Task Manager - Starting...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Please make sure Node.js is installed.
        pause
        exit /b 1
    )
    echo.
)

echo Starting development server...
echo.
echo The app will open automatically in your browser at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the server and wait a bit, then open browser
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

call npm run dev

pause

