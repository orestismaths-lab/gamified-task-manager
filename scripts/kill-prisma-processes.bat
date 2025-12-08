@echo off
REM Batch script to kill Node.js processes (alternative to PowerShell)
REM Run: scripts\kill-prisma-processes.bat

echo 🔍 Finding Node.js processes...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo Found Node.js processes:
    tasklist /FI "IMAGENAME eq node.exe"
    echo.
    echo 🛑 Killing all Node.js processes...
    taskkill /F /IM node.exe /T
    echo.
    echo ✅ Done! You can now run: npx prisma generate
) else (
    echo ✅ No Node.js processes found
    echo.
    echo You can now run: npx prisma generate
)

pause

