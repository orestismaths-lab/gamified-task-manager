@echo off
echo ========================================
echo Switching to DATABASE MODE
echo ========================================
echo.

cd /d "%~dp0\.."

echo Changing USE_API to true...
powershell -Command "(Get-Content 'lib\constants\index.ts') -replace 'export const USE_API = false;', 'export const USE_API = true;' | Set-Content 'lib\constants\index.ts'"

echo.
echo Done! USE_API is now set to true
echo.
echo Next steps:
echo 1. Start the app: npm run dev
echo 2. Login to your account
echo 3. Go to Data Management
echo 4. Click "Export from Database"
echo.
pause

