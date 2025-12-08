# PowerShell script to run Prisma Studio with .env.local loaded
# Run: .\scripts\prisma-studio.ps1

Write-Host "🔧 Starting Prisma Studio with .env.local..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .env.local with your DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Load .env.local and run prisma studio
$envFile = Get-Content ".env.local" | Where-Object { $_ -match '^[^#]' -and $_ -match '=' }
foreach ($line in $envFile) {
    $parts = $line -split '=', 2
    if ($parts.Length -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "✅ Loaded environment variables from .env.local" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Prisma Studio..." -ForegroundColor Cyan
Write-Host ""

npx prisma studio

