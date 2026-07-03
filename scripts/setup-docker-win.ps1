# ==========================================================
# Development startup script for Acquisition App with Neon Local
# Windows PowerShell Version
# ==========================================================

Write-Host ""
Write-Host "[START] Starting Acquisition App in Development Mode" -ForegroundColor Green
Write-Host "====================================================="
Write-Host ""

# Check if .env.development exists
if (!(Test-Path ".env.development")) {
    Write-Host "[ERROR] .env.development file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.development from the template and update it with your Neon credentials."
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
}
catch {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again."
    exit 1
}

# Create .neon_local directory if it doesn't exist
if (!(Test-Path ".neon_local")) {
    New-Item -ItemType Directory -Path ".neon_local" | Out-Null
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

Write-Host "[INFO] Starting Neon Local database services..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml --env-file .env.development up -d neon-local neon-http-proxy

# Wait for the database to be ready
Write-Host "[INFO] Waiting for the database to be fully active..." -ForegroundColor Yellow
do {
    docker compose -f docker-compose.dev.yml exec -T -e PGPASSWORD=npg neon-local psql -h localhost -U neon -d neondb -c "SELECT 1;" | Out-Null
    $ready = $LASTEXITCODE
    if ($ready -ne 0) {
        Write-Host "   Database is still initializing, waiting..."
        Start-Sleep -Seconds 2
    }
} while ($ready -ne 0)

Write-Host "[OK] Database is fully ready!" -ForegroundColor Green

# Run Drizzle migrations with localhost connection string
Write-Host "[INFO] Applying latest schema with Drizzle..." -ForegroundColor Cyan
$env:DATABASE_URL="postgres://neon:npg@localhost:5432/neondb?sslmode=disable"
npm run db:migrate
$migrationResult = $LASTEXITCODE
Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue

if ($migrationResult -ne 0) {
    Write-Host "[ERROR] Database migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[INFO] Starting development application..." -ForegroundColor Green

docker compose -f docker-compose.dev.yml --env-file .env.development up --build

Write-Host ""
Write-Host "[SUCCESS] Development environment started!" -ForegroundColor Green
Write-Host "Application : http://localhost:3000"
Write-Host "Database    : postgres://neon:npg@localhost:5432/neondb"
Write-Host ""
Write-Host "To stop the environment press Ctrl+C"
Write-Host "or run:"
Write-Host "docker compose -f docker-compose.dev.yml down"