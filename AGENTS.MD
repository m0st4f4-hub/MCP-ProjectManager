Understood. I will conduct an in-depth analysis of the MCP Project Manager repository (backend and frontend) and supplement it with targeted external research to identify best practices for AGENTS.md authoring and Codex prompt engineering.

This will allow me to generate a highly optimized, repository-specific AGENTS.md that aligns with the current architecture, toolchain, and development conventions—and elevates agent productivity to its peak potential.

I'll report back with the complete AGENTS.md draft once research is complete.


# AGENTS.md for MCP Project Manager

This repository is a **Task Manager** built with **FastAPI** (backend) and **Next.js** (frontend), designed for human-agent collaboration via the **Model Context Protocol (MCP)**. The backend provides REST APIs for projects, tasks, users, and memory services.  There are also helper scripts (`scripts/dev/dev_launcher.js` for cross-platform use, `scripts/dev/dev_launcher.bat`/`.ps1` for Windows PowerShell) that clear ports 8000/3000 and start the backend with Uvicorn and frontend with `npm run dev`.  The FastAPI backend is launched (in dev) via `uvicorn backend.main:app --reload` and serves on `http://localhost:8000` with docs at `/docs`.

## Quick Start

```bash
# One-command setup and launch
python start_system.py

# Or use the development launchers
node scripts/dev/dev_launcher.js          # Cross-platform Node.js
.\scripts\dev\dev_launcher.ps1            # Windows PowerShell  
.\scripts\dev\dev_launcher.bat            # Windows Batch

# Or traditional approach
npm run dev     # runs scripts/dev/dev_launcher.bat (on Windows) or you can run `node scripts/dev/dev_launcher.js` cross-platform
```

## Tech Stack & Structure

* **Backend (API/MCP Server):** FastAPI (Python 3.x) with SQLAlchemy and Pydantic for data models, Alembic for migrations, and SQLite (default, or PostgreSQL via `.env`).  The backend code lives under `backend/`, with `main.py` defining the FastAPI app and routes, `models.py` for ORM models, `schemas/` for Pydantic types, and `alembic/` for DB migrations.  A built-in **Knowledge Graph/Memory service** lets agents store and retrieve structured data (see `backend/crud/memory.py` and related models).  The FastAPI app also integrates the MCP framework (`fastapi-mcp`) to expose agent tools based on the `.cursor/rules` files.

* **Frontend (Web GUI):** Next.js (React + TypeScript) with Chakra UI for styling and Zustand for state management.  The frontend code is in `frontend/`, with React components under `frontend/src/`, public assets in `frontend/public/`, and configuration files (`next.config.mjs`, `tsconfig.json`, etc) at the root of `frontend/`.  The frontend communicates with the backend API (e.g. via fetch or React Query) and supports features like task dependencies, file attachments, theming, etc.

* **CLI & Dev Launcher:** A Node.js CLI (`scripts/utils/cli.js` in the repo, published as `mcp-project-manager-cli`) uses Commander.js to bootstrap and run the suite.  This CLI automates dependency installs, project setup, and launching of both backend and frontend services.  There are also helper scripts (`scripts/dev/dev_launcher.js` for cross-platform use, `scripts/dev/dev_launcher.bat`/`.ps1` for Windows PowerShell) that clear ports 8000/3000 and start the backend with Uvicorn and frontend with `npm run dev`.  The FastAPI backend is launched (in dev) via `uvicorn backend.main:app --reload` and serves on `http://localhost:8000` with docs at `/docs`.

* **MCP and .cursor rules:**  Agent behaviors and tools are defined via Model Context Protocol rules (`.mdc` files) in the `.cursor/rules/` folder.  The CLI copies or updates these rules so that the MCP server (fastapi-mcp) can use them.  Agents can invoke backend APIs (CRUD endpoints, memory service, etc.) as tools via MCP, as well as custom CLI commands.

## Setup & Bootstrapping

To set up a fresh dev environment, follow these steps (examples use Unix-style shell commands):

1. **Backend environment:**

   ```bash
   cd backend
   python3 -m venv .venv            # create a Python venv
   source .venv/bin/activate       # activate it
   pip install fastapi uvicorn sqlalchemy alembic python-dotenv aiosqlite   # core deps
   # If using PostgreSQL, create backend/.env with DATABASE_* vars (then adjust `backend/database.py`)
   ```

   This installs FastAPI, Uvicorn, SQLAlchemy, Alembic, etc.  (The `cli.js` can also do this automatically.)

2. **Frontend environment:**

   ```bash
   cd frontend
   npm install   # install Node dependencies
   ```

   (This installs Next.js, React, Chakra UI, Zustand, and all frontend packages.)

3. **Database setup:**
   Apply migrations with Alembic (this will create the SQLite `sql_app.db` if needed):

   ```bash
   cd backend
   python -m alembic upgrade head
   ```

   If switching to PostgreSQL, define a `.env` and rerun `alembic upgrade head` to initialize the new database.

4. **Starting servers:**  You can launch both servers with one command:

   ```bash
   npm run dev     # runs dev_launcher.bat (on Windows) or you can run `node dev_launcher.js` cross-platform
   ```

   This clears ports 8000/3000 and starts the backend (`uvicorn`) and frontend (`next dev`) concurrently.  Alternatively, run them manually:

   ```bash
   cd backend; uvicorn main:app --reload --host 0.0.0.0 --port 8000
   cd frontend; npm run dev
   ```

   The backend API will be at **[http://localhost:8000](http://localhost:8000)** (with docs at `/docs`), and the frontend at \*\*[http://localhost:3000\*\*:contentReference\[oaicite:20\]{index=20}\:contentReference\[oaicite:21\]{index=21}](http://localhost:3000**:contentReference[oaicite:20]{index=20}:contentReference[oaicite:21]{index=21}).

## Build, Test, and Lint

* **Build:** For production or CI, run

  ```bash
  cd frontend && npm run build   # builds Next.js frontend (output in .next)
  ```

  (After building frontend, you may bundle/install backend requirements with `npm run build:all`, which triggers `npm run build` then `pip install -r backend/requirements.txt`.)

* **Type-check:**
  The frontend uses TypeScript. Run `npx tsc --noEmit` or `npm run type-check` to catch TS errors.  ESLint is set up for both backend and frontend. The frontend's ESLint script is `npm run lint` (using Next.js's config), and there is `npm run fix` to auto-fix ESLint issues.  The backend code should be linted with flake8; a helper `comprehensive_flake8_fixer.py` is provided to auto-clean common issues.

* **Tests:**

  * **Frontend tests:** Use Vitest (unit/integration) and Playwright (E2E). You can run all tests via `npm run test:all`.  Specific commands include `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, or launch the test UI (`npm run test:ui`, `npm run test:e2e:ui`). Coverage can be generated with `npm run test:coverage`.  (These scripts are defined in `frontend/package.json`.)
  * **Backend tests:** Run `pytest` in the `backend/` directory. For example:

    ```bash
    cd backend
    .venv/bin/pytest tests/ -v
    ```

    (On Windows this is `.venv\Scripts\pytest.exe tests -v` as in `package.json`.)  Include any new tests for new features and aim for high coverage.

* **Lint/Format:**
  Always fix lint errors and format code before committing. For JS/TS, use `npm run fix` (ESLint auto-fix) and `npm run format` (Prettier) in the `frontend/` directory.  For Python, run flake8 and use the provided fixer as needed.  The project enforces consistent style: uppercase naming where required, no unused imports, line length limits, etc.  (The `comprehensive_flake8_fixer.py` demonstrates the strict backend style rules.)

## Coding Standards & Commit Style

* **Coding conventions:** Follow the patterns in the codebase.  Use clear, descriptive names (avoid abbreviations).  The repository includes many detailed READMEs (e.g. component-level READMEs under `frontend/src/`)—study them to match existing styles.  Always handle errors and edge cases.  Write comments/docstrings only where necessary (code should be self-explanatory).

* **Commits/PRs:** Use concise, imperative commit messages (e.g. "Add feature X", "Fix bug in Y") and follow Conventional Commit style (prefix with `feat:`, `fix:`, `docs:`, etc).  If an `AGENTS.md` rule specifies a PR title or message format, the agent should follow it.  Include issue or ticket references if applicable.  Each PR should include a summary of changes; if tests or linting are required, mention that in the PR description.

* **Citation:** When the agent makes changes, it should cite relevant code or docs as evidence of correctness (as Codex does).  For example, when fixing a bug, run tests and cite the test output and logs.  See Codex docs for guidance on citation style.

## Allowed Languages & Directories

* **Languages:** Only use the languages present in the repo: **Python** (3.8+) for backend, **JavaScript/TypeScript** for frontend and CLI, and **Markdown** for docs.  Do not introduce other languages or frameworks.  Tests should be written in TypeScript (frontend) or Python/Pytest (backend) as shown.

* **Directories to avoid editing:** Do **not** modify or inspect the following:

  * `backend/.venv/` – the Python virtualenv (ignore entirely).
  * `frontend/node_modules/` and `frontend/.next/` – dependency caches/build artifacts.
  * Any `*.db` files (e.g. `sql_app.db`). These are generated databases, not source.
  * Auto-generated files or logs (`*.log`, `.DS_Store`, etc).
    The agent should focus on source files under `backend/`, `frontend/src/`, `cli.js`, `.cursor/rules/`, etc, and should *not* write code outside these areas.

## Environment & Compatibility

* **Python:** The project targets **Python 3.8+** (recommend 3.11+).  Use `python3` accordingly.
* **Node:** Requires **Node.js 18+** and npm (v18.x or higher).  (Official docs also mention Node 16+ for older code, but prefer 18+ since TypeScript and Next.js versions may require it.)
* **OS:** Development is supported on macOS, Linux, or Windows (PowerShell). The dev launcher scripts handle OS differences.
* **Dependencies:** The root `package.json` manages CLI dependencies; `frontend/package.json` manages all frontend deps (Next.js 15, React 18, Chakra UI, Zustand, etc).  The `backend/requirements.txt` or `pyproject.toml` (if present) lists Python packages. Use those for installs.

## Agent Tools & Advanced Features

* **CLI & Dev Tools:** The agent can invoke the CLI and launcher as "tools".  For example, run `npx mcp-project-manager` (or `node cli.js`) to use the integrated CLI, or execute `python start_system.py` to start the entire system.  The agent should quote full commands and work in the project root unless otherwise needed.

* **MCP (.cursor) Rules:** The `.cursor/rules/` folder contains Model Context Protocol rule files (`.mdc`) that define agent behaviors and tasks.  When planning agent actions, follow the patterns in these rules.  For instance, custom MCP tools are defined here.  The agent should *not* modify these rule files directly (they are auto-loaded), but can use them as guidance.

* **Task Templates:** When describing or breaking down tasks, use clear templates.  For multi-step tasks, use numbered or bullet lists to structure steps.  (For example: "1. Do X. 2. Then do Y.")  This ensures clarity and reproducibility.

* **Memory Service:** The backend's **Knowledge Graph/Memory** allows storing and retrieving facts.  Use memory endpoints (`/memory`) to create or query memory tags if useful.  For example, to recall context or associated files, attach memory entities to tasks via the API.  (See `backend/routers/memory.py` for usage.)  These memory entries persist across sessions and help maintain context.

* **Tool Invocation:** The agent can run any shell command listed in the project.  Common tools include `uvicorn`, `npm`, `pytest`, etc.  Always ensure the correct working directory (e.g. run backend commands in `backend/`, frontend commands in `frontend/`).  The dev scripts show examples: e.g. `spawn('npm', ['run','dev'], { cwd: 'frontend', shell: true })`.  Use absolute or relative paths to avoid ambiguity if needed.

## Prompting Guidelines

* **Be explicit and deterministic.**  Give precise instructions, avoid vague terms. For multi-step tasks, use numbered lists.  Specify exact function or variable names rather than "it" or "that".
* **Follow specs and docs.**  Refer to README/ARCHITECTURE docs for context.  Use the technology and naming conventions shown there.
* **Run tests and cite results.**  After making code changes, run the test suite (both frontend and backend) and include test output citations to verify correctness. Also run `npm run lint` or flake8 and fix any errors.
* **Commit process:** Draft the change, then produce a commit message summarizing the change. The commit message should be imperative (e.g. "Fix database null bug"), and can mention related issues or tests run.
* **Memory:** If an agent needs to remember something across interactions, store it using the memory service (e.g. "store task IDs with tag 'todo'"). Then later recall with the same tag.
* **Review:** Finally, re-run all tests and lint/format, ensure everything passes cleanly, and provide citations of the passing output.

By following this guide, the Codex agent will understand how to navigate the code, set up the environment, and adhere to this project's conventions and quality standards.
