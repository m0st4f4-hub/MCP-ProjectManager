#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "[init] Creating Python virtual environment..."
  python3 -m venv .venv
fi

PIP=".venv/bin/pip"
ALEMBIC=".venv/bin/alembic"

# Install requirements
echo "[init] Installing Python requirements..."
$PIP install -r requirements.txt

# Run migrations
echo "[init] Applying Alembic migrations..."
$ALEMBIC upgrade head

echo "[init] Backend initialization complete"
