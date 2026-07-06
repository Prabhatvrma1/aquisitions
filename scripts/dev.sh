#!/bin/bash
# ==========================================================
# Development startup script for Acquisition App - Neon Local
# Linux / macOS / WSL bash version  (dev.sh)
# Usage: npm run dev:docker
# ==========================================================

set -e

echo ""
echo "[START] Starting Acquisition App in Development Mode"
echo "====================================================="
echo ""

# ---- Pre-flight checks --------------------------------------------------

if [ ! -f .env.development ]; then
    echo "[ERROR] .env.development not found!"
    echo "        Copy the template and fill in your Neon credentials."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "        Please start Docker Desktop and try again."
    exit 1
fi

# ---- Setup local directories --------------------------------------------

mkdir -p .neon_local

if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "[OK] Added .neon_local/ to .gitignore"
fi

# ---- Start database services --------------------------------------------

echo ""
echo "[INFO] Starting Neon Local database services..."
docker compose -f docker-compose.dev.yml --env-file .env.development up -d neon-local neon-http-proxy

# ---- Wait for database to be ready --------------------------------------

echo "[INFO] Waiting for the database to be fully active..."
MAX_ATTEMPTS=30
ATTEMPT=0

until docker compose -f docker-compose.dev.yml exec -T -e PGPASSWORD=npg neon-local \
      psql -h localhost -U neon -d neondb -c "SELECT 1;" >/dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS - database still initializing, waiting 3s..."
    sleep 3
    if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
        echo "[ERROR] Database did not become ready in time!"
        echo "        Check logs: docker compose -f docker-compose.dev.yml logs neon-local"
        exit 1
    fi
done

echo "[OK] Database is fully ready!"

# ---- Run Drizzle migrations (against localhost:5432) --------------------

echo ""
echo "[INFO] Applying latest schema with Drizzle..."

DATABASE_URL=postgres://neon:npg@localhost:5432/neondb?sslmode=disable npm run db:migrate

if [ $? -ne 0 ]; then
    echo "[ERROR] Database migration failed!"
    exit 1
fi

echo "[OK] Migrations applied successfully!"

# ---- Build and start the full stack -------------------------------------

echo ""
echo "[INFO] Building and starting the application container..."
echo "       (Press Ctrl+C to stop all containers)"
echo ""

docker compose -f docker-compose.dev.yml --env-file .env.development up --build app

echo ""
echo "[SUCCESS] Development session ended."
echo "Application : http://localhost:3000"
echo "Database    : postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "To fully stop all containers run:"
echo "  docker compose -f docker-compose.dev.yml down"
