# ==========================================================
# Development startup script for Acquisition App - Neon Local
# Windows PowerShell version  (setup-docker-win.ps1)
# Usage: npm run dev:docker-win
# ==========================================================


Write-Host ""
Write-Host "[START] Starting Acquisition App in Development Mode" -ForegroundColor Green
Write-Host "====================================================="
Write-Host ""

# ---- Pre-flight checks --------------------------------------------------

# 1. .env.development must exist
if (!(Test-Path ".env.development")) {
    Write-Host "[ERROR] .env.development not found!" -ForegroundColor Red
    Write-Host "        Copy the template and fill in your Neon credentials."
    exit 1
}

# Check if Docker is running
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "        Please start Docker Desktop and try again."
    exit 1
}

# ---- Setup local directories --------------------------------------------

if (!(Test-Path ".neon_local")) {
    New-Item -ItemType Directory -Path ".neon_local" | Out-Null
    Write-Host "[OK] Created .neon_local directory" -ForegroundColor Green
}

# Add .neon_local to .gitignore if missing
if (!(Test-Path ".gitignore")) {
    New-Item -ItemType File -Path ".gitignore" | Out-Null
}
$gitignore = Get-Content ".gitignore" -ErrorAction SilentlyContinue
if ($gitignore -notcontains ".neon_local/") {
    Add-Content ".gitignore" ".neon_local/"
    Write-Host "[OK] Added .neon_local/ to .gitignore" -ForegroundColor Green
}

# ---- Start database services --------------------------------------------

Write-Host ""
Write-Host "[INFO] Starting Neon Local database services..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml --env-file .env.development up -d neon-local neon-http-proxy

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start database services!" -ForegroundColor Red
    exit 1
}

# ---- Wait for database to be ready --------------------------------------

Write-Host "[INFO] Waiting for the database to be fully active..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    # Redirect stderr to null so expected "connection refused" messages don't surface as errors
    docker compose -f docker-compose.dev.yml exec -T -e PGPASSWORD=npg neon-local `
        psql -h localhost -U neon -d neondb -c "SELECT 1;" 2>$null | Out-Null
    $ready = $LASTEXITCODE

    if ($ready -ne 0) {
        Write-Host "   Attempt $attempt/$maxAttempts - database still initializing, waiting 3s..."
        Start-Sleep -Seconds 3
    }

    if ($attempt -ge $maxAttempts) {
        Write-Host "[ERROR] Database did not become ready in time!" -ForegroundColor Red
        Write-Host "        Check logs: docker compose -f docker-compose.dev.yml logs neon-local"
        exit 1
    }
} while ($ready -ne 0)

Write-Host "[OK] Database is fully ready!" -ForegroundColor Green

# ---- Run Drizzle migrations (against localhost:5432) --------------------

Write-Host ""
Write-Host "[INFO] Applying latest schema with Drizzle..." -ForegroundColor Cyan

# Override DATABASE_URL temporarily to point at localhost for host-side migration
$env:DATABASE_URL = "postgres://neon:npg@localhost:5432/neondb?sslmode=disable"
npm run db:migrate
$migrationResult = $LASTEXITCODE
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

if ($migrationResult -ne 0) {
    Write-Host "[ERROR] Database migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Migrations applied successfully!" -ForegroundColor Green

# ---- Build and start the full stack -------------------------------------

Write-Host ""
Write-Host "[INFO] Building and starting the application container..." -ForegroundColor Green
Write-Host "       (Press Ctrl+C to stop all containers)"
Write-Host ""

docker compose -f docker-compose.dev.yml --env-file .env.development up --build app

# ---- Teardown message (shown after Ctrl+C) ------------------------------

Write-Host ""
Write-Host "[SUCCESS] Development session ended." -ForegroundColor Green
Write-Host "Application : http://localhost:3000"
Write-Host "Database    : postgres://neon:npg@localhost:5432/neondb"
Write-Host ""
Write-Host "To fully stop all containers run:"
Write-Host "  docker compose -f docker-compose.dev.yml down"