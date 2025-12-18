@echo off
echo ========================================
echo EXPORT FROM DATABASE AND SWITCH TO LOCAL
echo ========================================
echo.

cd /d "%~dp0\.."

echo Step 1: Exporting from database...
echo.
node scripts/export-from-database.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Export failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Switching to LOCAL MODE...
echo.
powershell -Command "(Get-Content 'lib\constants\index.ts') -replace 'export const USE_API = true;', 'export const USE_API = false;' | Set-Content 'lib\constants\index.ts'"

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo Next steps:
echo 1. Start the app: npm run dev
echo 2. Go to Data Management
echo 3. Click "Upload Backup File"
echo 4. Select the JSON file that was just created
echo.
echo The JSON file is in the project root directory.
echo.
pause

