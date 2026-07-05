# ==========================================================
# Production startup script for Acquisition App - Neon Cloud
# Windows PowerShell version  (prod-win.ps1)
# Usage: npm run prod:docker-win
# ==========================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "[START] Starting Acquisition App in Production Mode" -ForegroundColor Magenta
Write-Host "===================================================="
Write-Host ""

# ---- Pre-flight checks --------------------------------------------------

if (!(Test-Path ".env.production")) {
    Write-Host "[ERROR] .env.production not found!" -ForegroundColor Red
    Write-Host "        Create .env.production with your production Neon Cloud DATABASE_URL and secrets."
    exit 1
}

# Check if Docker is running
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "        Please start Docker Desktop and try again."
    exit 1
}

# ---- Run Drizzle migrations against Neon Cloud first --------------------

Write-Host "[INFO] Applying latest schema to Neon Cloud database..." -ForegroundColor Cyan

# Load DATABASE_URL from .env.production for the migration
$envProd = Get-Content ".env.production" | Where-Object { $_ -match "^DATABASE_URL=" }
if ($envProd) {
    $env:DATABASE_URL = ($envProd -split "=", 2)[1].Trim()
}

npm run db:migrate
$migrationResult = $LASTEXITCODE
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

if ($migrationResult -ne 0) {
    Write-Host "[ERROR] Database migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Migrations applied successfully!" -ForegroundColor Green

# ---- Build and start production container (detached) --------------------

Write-Host ""
Write-Host "[INFO] Building and starting production container (detached)..." -ForegroundColor Magenta

docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start production container!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Production environment started!" -ForegroundColor Green
Write-Host "Application : http://localhost:3000"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  View logs   : docker logs -f acquisitions-app-prod"
Write-Host "  Stop app    : docker compose -f docker-compose.prod.yml down"
