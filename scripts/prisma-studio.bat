@echo off
REM Script to run Prisma Studio with .env.local loaded
REM Run: scripts\prisma-studio.bat

echo 🔧 Starting Prisma Studio with .env.local...
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found!
    echo.
    echo Please create .env.local with your DATABASE_URL
    pause
    exit /b 1
)

REM Use dotenv-cli to load .env.local and run prisma studio
npx dotenv -e .env.local -- npx prisma studio

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to start Prisma Studio
    echo.
    echo 💡 Try installing dotenv-cli:
    echo    npm install -g dotenv-cli
    echo.
    pause
)

