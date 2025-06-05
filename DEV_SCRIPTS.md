# 🛠️ Development Scripts Overview

This document summarizes the main helper scripts used during development. They are
located in the project root and provide different ways to launch the backend and
frontend or manage the full stack.

## `dev_launcher.js`
- **Purpose:** Cross‑platform Node.js launcher.
- **What it does:**
  - Kills any processes on ports **8000** and **3000**.
  - Starts the FastAPI backend using the Python virtual environment.
  - Launches the Next.js frontend with `npm run dev`.
  - Prints the service URLs and cleans up processes on exit.
- **Usage:**
  ```bash
  node dev_launcher.js
  ```

## `run_backend.py`
- **Purpose:** Launch only the backend API.
- **What it does:**
  - Verifies that `backend/.venv` exists.
  - Runs `uvicorn backend.main:app` on port **8000** with reload enabled.
  - Sets `PYTHONPATH` so local imports work correctly.
- **Usage:**
  ```bash
  python run_backend.py
  ```

## `start_system.py`
- **Purpose:** Set up and start the entire development system.
- **What it does:**
  - Checks the project structure for `backend/` and `frontend/`.
  - Creates the Python virtual environment and installs core packages if needed.
  - Installs Node.js dependencies in the frontend.
  - Initializes the SQLite database if it does not exist.
  - Starts both backend and frontend servers and monitors them.
- **Usage:**
  ```bash
  python start_system.py
  ```

## `backend/check_routes.py`
- **Purpose:** Enumerate FastAPI routes for debugging.
- **What it does:**
  - Imports the FastAPI app and lists all registered routes.
  - Supports a `--json` option to output structured route data.
  - Exits with code `1` if the app fails to load.
- **Usage:**
  ```bash
  python backend/check_routes.py [--json]
  ```

These scripts simplify local development by automating common setup and startup
steps. See `DEV_LAUNCHER_GUIDE.md` for more launcher details.
