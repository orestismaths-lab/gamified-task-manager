@echo off
echo ========================================
echo EXPORT FROM DATABASE - COMPLETE PROCESS
echo ========================================
echo.
echo This script will:
echo 1. Switch to DATABASE MODE (USE_API = true)
echo 2. Start the app
echo 3. You need to: Login and export from Data Management
echo 4. Then switch back to LOCAL MODE
echo.
echo Press any key to continue...
pause >nul

cd /d "%~dp0\.."

echo.
echo Step 1: Switching to DATABASE MODE...
powershell -Command "(Get-Content 'lib\constants\index.ts') -replace 'export const USE_API = false;', 'export const USE_API = true;' | Set-Content 'lib\constants\index.ts'"

echo Done! USE_API is now TRUE
echo.

echo Step 2: Starting the app...
echo.
echo IMPORTANT: 
echo - The app will open in your browser
echo - Login with your account
echo - Go to Data Management
echo - Click "Export from Database" button
echo - Save the JSON file
echo.
echo After you export, run: scripts\switch-to-local-mode.bat
echo.
echo Starting app now...
echo.

start_with_browser.bat

