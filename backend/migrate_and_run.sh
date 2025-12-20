#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Running database migrations..."
flask db upgrade

if [ "$SKIP_SEED" != "1" ]; then
    echo "Seeding database with fresh data..."
    python seed.py
else
    echo "Skipping seeding (SKIP_SEED=1)..."
fi

echo "Starting gunicorn..."
python -m gunicorn -w 1 -b 0.0.0.0:$PORT --timeout 120 wsgi:app
