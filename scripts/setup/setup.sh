#!/bin/bash

set -euo pipefail

# === [MCP Setup] Starting environment setup ===
echo "=== [MCP Setup] Starting environment setup ==="

# 1. Ensure we're in the project root (where backend/ and frontend/ exist)
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo "[ERROR] Please run this script from the project root (where 'backend/' and 'frontend/' directories exist)."
  exit 1
fi

# 2. Check for required tools
for tool in python3 pip npm; do
  if ! command -v $tool &>/dev/null; then
    echo "[ERROR] Required tool '$tool' is not installed or not in PATH."
    exit 1
  fi
done

# 3. Backend setup
echo "=== [MCP Setup] Setting up backend Python environment ==="
cd backend

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

if [ -f "requirements.txt" ]; then
  echo "[MCP Setup] Installing backend Python dependencies..."
  pip install --upgrade pip
  pip install -r requirements.txt
else
  echo "[WARNING] requirements.txt not found. Skipping pip install."
fi

if [ -f ".env.example" ] && [ ! -f ".env" ]; then
  cp .env.example .env
  echo "[MCP Setup] Copied backend .env.example to .env"
fi

if [ -d "alembic" ]; then
  if command -v alembic &>/dev/null; then
    echo "[MCP Setup] Running Alembic migrations..."
    alembic upgrade head
  else
    echo "[WARNING] Alembic not installed. Skipping migrations."
  fi
fi

# 4. Run backend tests
if command -v pytest &>/dev/null; then
  echo "=== [MCP Setup] Running backend tests with pytest ==="
  pytest || { echo "[ERROR] Backend tests failed!"; exit 1; }
else
  echo "[WARNING] pytest not installed. Skipping backend tests."
fi

deactivate
cd ..

# 5. Frontend setup
echo "=== [MCP Setup] Setting up frontend Node.js environment ==="
cd frontend

if [ -f "package.json" ]; then
  npm install
  # Warn about vulnerabilities
  if npm audit --audit-level=moderate; then
    echo "[MCP Setup] No moderate or higher vulnerabilities found in frontend dependencies."
  else
    echo "[WARNING] There are moderate or higher vulnerabilities in frontend dependencies. Please review 'npm audit' output above."
  fi
else
  echo "[WARNING] No package.json found in frontend. Skipping npm install."
fi

if [ -f ".env.example" ] && [ ! -f ".env" ]; then
  cp .env.example .env
  echo "[MCP Setup] Copied frontend .env.example to .env"
fi

cd ..

echo "=== [MCP Setup] Setup Complete! ==="
echo ""
echo "To run the backend:"
echo "  cd backend"
echo "  source .venv/bin/activate"
echo "  python run_backend.py"
echo ""
echo "To run the frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Remember to set up your .env files with the correct secrets and DB URLs." 