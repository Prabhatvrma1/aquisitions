#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "[START] Starting Acquisition App in Development Mode"
echo "====================================================="

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "[ERROR] .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your Neon credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "[OK] Added .neon_local/ to .gitignore"
fi

echo "[INFO] Starting Neon Local database services..."
docker compose -f docker-compose.dev.yml --env-file .env.development up -d neon-local neon-http-proxy

# Wait for the database to be ready
echo "[INFO] Waiting for the database to be fully active..."
until docker compose -f docker-compose.dev.yml exec -T -e PGPASSWORD=npg neon-local psql -h localhost -U neon -d neondb -c "SELECT 1;" >/dev/null 2>&1; do
    echo "   Database is still initializing, waiting..."
    sleep 2
done
echo "[OK] Database is fully ready!"

# Run migrations with Drizzle from host pointing to localhost
echo "[INFO] Applying latest schema with Drizzle..."
DATABASE_URL=postgres://neon:npg@localhost:5432/neondb?sslmode=disable npm run db:migrate

if [ $? -ne 0 ]; then
    echo "[ERROR] Database migration failed!"
    exit 1
fi

echo "[INFO] Starting application container..."
# Start development environment
docker compose -f docker-compose.dev.yml --env-file .env.development up --build

echo ""
echo "[SUCCESS] Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose -f docker-compose.dev.yml down"