@echo off
echo ========================================
echo   Setup Check
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Node.js:
where node >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo ✅ Node.js installed
) else (
    echo ❌ Node.js not found
)
echo.

echo [2] npm:
where npm >nul 2>&1
if %errorlevel% equ 0 (
    npm --version
    echo ✅ npm installed
) else (
    echo ❌ npm not found
)
echo.

echo [3] Dependencies:
if exist "node_modules" (
    echo ✅ node_modules exists
) else (
    echo ❌ node_modules missing - run: npm install
)
echo.

echo [4] Firebase Config:
if exist "lib\firebase.ts" (
    findstr /C:"apiKey" lib\firebase.ts >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Firebase config file exists
        findstr /C:"AIzaSy" lib\firebase.ts >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ API key found in config
        ) else (
            echo ⚠️  API key might need update from Firebase Console
        )
    ) else (
        echo ⚠️  Firebase config might be incomplete
    )
) else (
    echo ❌ Firebase config file missing
)
echo.

echo [5] Git:
where git >nul 2>&1
if %errorlevel% equ 0 (
    git --version
    echo ✅ Git installed
    git remote -v 2>nul
    if %errorlevel% equ 0 (
        echo ✅ Git repository configured
    ) else (
        echo ⚠️  Git remote not configured
    )
) else (
    echo ⚠️  Git not found (optional)
)
echo.

echo ========================================
echo   Check Complete
echo ========================================
echo.
pause

