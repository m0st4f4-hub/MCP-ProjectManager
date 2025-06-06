Here is the **full, resolved `README.md`** file with all sections and previously conflicting parts properly merged:

```markdown
[![CI - Main](https://github.com/m0st4f4-hub/MCP-ProjectManager/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/m0st4f4-hub/MCP-ProjectManager/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/mcp-project-manager-cli.svg)](https://badge.fury.io/js/mcp-project-manager-cli)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

# MCP Project Manager Suite

An open-source, full-stack suite for collaborative project management, empowering human users and AI agents to manage, automate, and execute complex projects—end-to-end. Built with a FastAPI backend, a Next.js/Chakra UI frontend, and integrated with the Model Context Protocol (MCP) for advanced agentic capabilities.

---

## 🚀 Quick Start

### One-Command Development Setup

```bash
python start_system.py
```

This will automatically:

* ✅ Launch the FastAPI backend and Next.js frontend together
* ✅ Clear ports 8000 and 3000
* ✅ Open API docs at [http://localhost:8000/docs](http://localhost:8000/docs)
* 📄 API schema snapshot: `backend/openapi.json`

### Alternative Launch Methods

```bash
# Quick start options:
scripts/dev/dev_launcher.bat              # Windows batch script
node scripts/dev/dev_launcher.js          # Cross-platform Node.js
# OR
powershell scripts/dev/dev_launcher.ps1   # PowerShell (Windows)
```

### Database Migrations

Apply pending migrations using the CLI:

```bash
node scripts/utils/cli.js migrate
```

See [`docs/02-setup/README.md`](./docs/02-setup/README.md) for complete setup instructions.
For an overview of all dev scripts, see [`scripts/README.md`](./scripts/README.md).
For required environment variables and defaults, check [`docs/02-setup/README.md#environment-variables`](./docs/02-setup/README.md#environment-variables).
If you're contributing, read the [`docs/03-development/README.md`](./docs/03-development/README.md) guide.

---

## 🧱 Tech Stack

* **Backend:** FastAPI, SQLAlchemy, Pydantic, Alembic, SQLite/PostgreSQL
* **Frontend:** Next.js, Chakra UI, TypeScript, Zustand
* **Orchestration & Agents:** MCP Server, `.cursor` rules, fastapi-mcp
* **Dev & CLI:** Node.js, Python, Commander.js

---

## 📁 Project Structure

```text
project-manager/
├── backend/                # FastAPI service
├── frontend/               # Next.js + Chakra UI app
├── docs/                   # Comprehensive documentation
│   ├── 01-overview/        # Project overview and introduction
│   ├── 02-setup/           # Setup and installation guide
│   ├── 03-development/     # Development guide and standards
│   ├── 04-api/             # Complete API documentation
│   ├── 06-agents/          # Agent development guide
│   └── 08-operations/      # Operations and troubleshooting
├── scripts/                # Development and utility scripts
│   ├── dev/                # Development launchers
│   ├── utils/              # Utility scripts and CLI
│   └── README.md           # Scripts documentation
├── .cursor/                # MCP rules
├── start_system.py         # One-command setup
├── sql_app.db              # SQLite DB (default)
├── .github/                # CI/CD workflows
```

---

## ✅ Features

* Human-agent task collaboration
* Full task/project lifecycle management
* Task dependencies, filtering, archiving
* Memory service with `/api/memory/ingest-url`, `/api/memory/ingest-text` and `/api/memory/ingest/upload`
* Integrated MCP agentic automation
* CLI-first UX with automatic backend/frontend orchestration
* Auto-restoring services and port management

### Uploading Files to Memory

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -F "file=@path/to/file.txt" \
  http://localhost:8000/api/v1/memory/ingest/upload
```

In the frontend, call `memoryApi.uploadFile(file)` after selecting a file in the UI.

---

## 🆕 New Pages

- **Project Detail**: `/projects/<id>` displays a single project's tasks using `ProjectDetail`.
- **Templates**: `/templates` with subpages for creating (`/templates/new`) and editing templates.
- **User Roles**: `/user-roles` page to assign and manage roles.
- **Memory Graph**: `/memory/graph` visualizes the knowledge graph.
- **Metrics**: `/mcp-tools/metrics` shows runtime metrics.

## 🪝 Custom Hooks

- `useEventSource(path, onMessage)` – Subscribe to `/mcp-tools/stream` events.
  ```tsx
  const { lastEvent } = useEventSource('/mcp-tools/stream', e => console.log(e));
  ```
- `useProjectData(projectId)` – Fetch a project and its tasks.
  ```tsx
  const { project, tasks, refresh } = useProjectData(id);
  ```
- `useFilteredTasks(tasks, filters)` – Memoized task filtering.
- `useFilteredProjects(projects, filters, activeProject)` – Sync project lists with task view.

## 📸 UI Screenshots

![Light theme](./image-light.png)
![Dark theme](./image-dark.png)

---

## 🖥️ Manual Setup (Optional)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Makefile Commands

The root `Makefile` provides shortcuts for common tasks:

```bash
make migrate   # apply database migrations
make format    # auto-fix Python and frontend code style
```

---

## 🧪 Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

### Type Checking

```bash
npm run type-check
```

---

## 🔍 System Validation & Tests

```bash
python final_integration.py --mode all
```
This runs a comprehensive validation including checks for project template and agent rule features.

---

## 📜 License

ISC

---

## 📂 File List

<!-- File List Start -->
## File List

- `.cursorignore`
- `.flake8`
- `.gitignore`
- `.npmignore`
- `.pre-commit-config.yaml`
- `.prettierrc.json`
- `AEROSPACE_GRADE_DOCUMENTATION.md`
- `AGENTS.MD`
- `AUTH_SETUP.md`
- `BACKEND_FRONTEND_ALIGNMENT_REPORT.md`
- `CLEANUP_SUMMARY.md`
- `CONTRIBUTING.md`
- `DEV_LAUNCHER_COMPLETE.md`
- `DEV_LAUNCHER_GUIDE.md`
- `DEV_SCRIPTS.md`
- `LICENSE`
- `Makefile`
- `PROMETHEUS_GRAFANA_SETUP.md`
- `SYSTEM_GUIDE.md`
- `USER_FLOWS.md`
- `final_integration.py`
- `image-dark.png`
- `image-light.png`
- `package-lock.json`
- `package.json`
- `run_backend.py`
- `start_system.py`
- `validate_alignment.py`
- `validate_frontend.js`

<!-- File List End -->




---

## 🧠 Architecture Diagram

```mermaid
graph TD
    user((User)) -->|interacts with| frontend(Frontend)
    frontend -->|API requests| backend(Backend)
    backend -->|persists| database[(Database)]
    backend -->|integrates| mcp(MCP Server)
```

---

## 💬 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for pre-commit hooks, commit style, and test expectations.

```

Let me know if you'd like a downloadable version or if you want all sections refactored to match internal documentation styling guidelines.
```
