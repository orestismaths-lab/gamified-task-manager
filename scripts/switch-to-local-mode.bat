@echo off
echo ========================================
echo Switching to LOCAL MODE
echo ========================================
echo.

cd /d "%~dp0\.."

echo Changing USE_API to false...
powershell -Command "(Get-Content 'lib\constants\index.ts') -replace 'export const USE_API = true;', 'export const USE_API = false;' | Set-Content 'lib\constants\index.ts'"

echo.
echo Done! USE_API is now set to false
echo.
echo Next steps:
echo 1. Refresh the app in your browser (F5)
echo 2. Go to Data Management
echo 3. Click "Upload Backup File"
echo 4. Select the JSON file you exported
echo.
pause

