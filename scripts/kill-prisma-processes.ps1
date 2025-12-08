# PowerShell script to kill Node.js processes that might be using Prisma
# Run: .\scripts\kill-prisma-processes.ps1

Write-Host "🔍 Finding Node.js processes that might be using Prisma..." -ForegroundColor Cyan
Write-Host ""

# Find all Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses.Count -eq 0) {
    Write-Host "✅ No Node.js processes found" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: npx prisma generate" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($nodeProcesses.Count) Node.js process(es):" -ForegroundColor Yellow
Write-Host ""

foreach ($proc in $nodeProcesses) {
    $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
    Write-Host "  PID: $($proc.Id) | $commandLine" -ForegroundColor Gray
}

Write-Host ""
$response = Read-Host "Do you want to kill all Node.js processes? (Y/N)"

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🛑 Killing Node.js processes..." -ForegroundColor Red
    
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "  ✅ Killed process $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Could not kill process $($proc.Id): $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "✅ Done! You can now run: npx prisma generate" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Cancelled. Please manually close Prisma Studio and try again." -ForegroundColor Yellow
}

