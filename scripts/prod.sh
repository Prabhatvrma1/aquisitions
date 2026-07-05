#!/bin/bash
# ==========================================================
# Production startup script for Acquisition App - Neon Cloud
# Linux / macOS / WSL bash version  (prod.sh)
# Usage: npm run prod:docker
# ==========================================================

set -e

echo ""
echo "[START] Starting Acquisition App in Production Mode"
echo "===================================================="
echo ""

# ---- Pre-flight checks --------------------------------------------------

if [ ! -f .env.production ]; then
    echo "[ERROR] .env.production not found!"
    echo "        Create .env.production with your production Neon Cloud DATABASE_URL and secrets."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "        Please start Docker and try again."
    exit 1
fi

# ---- Run Drizzle migrations against Neon Cloud first --------------------

echo ""
echo "[INFO] Applying latest schema to Neon Cloud database..."

# Load DATABASE_URL from .env.production and export it for npm
export DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d'=' -f2-)

npm run db:migrate

if [ $? -ne 0 ]; then
    echo "[ERROR] Database migration failed!"
    exit 1
fi

echo "[OK] Migrations applied successfully!"

# ---- Build and start production container (detached) --------------------

echo ""
echo "[INFO] Building and starting production container (detached)..."

docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

echo ""
echo "[SUCCESS] Production environment started!"
echo "Application : http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  View logs : docker logs -f acquisitions-app-prod"
echo "  Stop app  : docker compose -f docker-compose.prod.yml down"
