#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Running database migrations..."
flask db upgrade

echo "Skipping seeding (database already seeded)..."

echo "Starting gunicorn..."
python -m gunicorn -w 1 -b 0.0.0.0:$PORT --timeout 120 wsgi:app
