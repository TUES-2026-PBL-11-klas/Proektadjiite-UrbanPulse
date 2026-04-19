#!/bin/sh
set -eu

echo "Waiting for database and running migrations..."

until npx prisma migrate deploy; do
  echo "Database not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "Starting UrbanPulse backend..."
exec node src/index.js
