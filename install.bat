@echo off
echo ========================================
echo Installing Dependencies...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Make sure to select "Add to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

echo Installing npm packages...
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo You can now run the app with: start.bat
echo.
pause

