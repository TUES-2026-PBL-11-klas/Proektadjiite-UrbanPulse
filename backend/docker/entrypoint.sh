#!/bin/sh
set -eu

echo "Waiting for database and applying Prisma schema..."

until npx prisma db push --skip-generate; do
  echo "Database not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "Starting UrbanPulse backend..."
exec node src/index.js
