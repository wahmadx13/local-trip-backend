#!/bin/sh
set -e

POSTGRES_HOST="${POSTGRES_HOST:-db}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

echo "Waiting for PostgreSQL..."
until nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  sleep 1
done

echo "Generating Prisma client..."
npm run prisma:generate

echo "Applying Prisma migrations..."
npm run prisma:migrate:deploy

echo "Starting NestJS server..."
npm run start:dev
