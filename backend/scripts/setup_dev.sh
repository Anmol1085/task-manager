#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running dev setup in $ROOT_DIR"

if [ "${NO_DOCKER:-0}" = "1" ]; then
  echo "Skipping Docker start because NO_DOCKER=1 was provided. Ensure DATABASE_URL is set in .env and Postgres is running."
elif command -v docker >/dev/null 2>&1; then
  echo "Docker found — starting postgres via docker-compose..."
  docker compose up -d
else
  echo "Warning: Docker not found. Ensure you have a running Postgres and DATABASE_URL is set in .env"
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Applying migrations (this may retry until the DB is ready)..."
MAX=20
COUNT=0
until npx prisma migrate dev --name init --skip-seed >/dev/null 2>&1; do
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX ]; then
    echo "Timed out waiting for database to be ready. Check your DATABASE_URL and Postgres status." >&2
    exit 1
  fi
  echo "Waiting for DB to be ready (attempt $COUNT/$MAX)..."
  sleep 3
done

echo "Migrations applied. Running seed script..."
npm run seed

echo "Setup complete. Start dev server with: npm run dev"
