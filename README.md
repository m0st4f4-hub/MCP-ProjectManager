# MCP Task Manager (Formerly Task Manager) - FastAPI & Next.js

A full-stack, MCP-enabled task management application designed to serve as the central hub for an agentic framework. It is built with a FastAPI backend and a Next.js frontend.

## Core Goal

To provide a robust platform for creating, managing, and tracking tasks, projects, and agents, with deep integration for the Model Context Protocol (MCP) to support automated workflows and agent operations.

## Tech Stack

*   **Backend:**
    *   FastAPI
    *   Python 3.x
    *   SQLAlchemy (ORM)
    *   Pydantic (Data Validation)
    *   SQLite (Default Database) / PostgreSQL (Optional)
    *   Uvicorn (ASGI Server)
    *   `python-dotenv` (Environment Variables)
    *   `fastapi-mcp` (Model Context Protocol Integration)
*   **Frontend:**
    *   Next.js 15+ (React Framework with Turbopack)
    *   React 19+
    *   TypeScript
    *   Tailwind CSS (Utility-first CSS Framework)
    *   Chakra UI (Component Library)
    *   Zustand (State Management)
    *   `fetch` API (for backend communication)
*   **Development:**
    *   Node.js & npm
    *   Python Virtual Environment (`venv`)

## Project Structure

```
task-manager/
├── backend/
│   ├── .venv/              # Python virtual environment
│   ├── app/                # Main application module (example structure)
│   │   ├── __init__.py
│   │   ├── crud.py         # Database CRUD functions
│   │   ├── database.py     # Database engine, session, Base
│   │   ├── main.py         # FastAPI application, routes, MCP init
│   │   ├── models.py       # SQLAlchemy ORM models
│   │   └── schemas.py      # Pydantic schemas for API data
│   ├── mcp/
│   │   └── server/
│   │       └── agents/     # Directory for potential MCP agent implementations
│   ├── requirements.txt    # Python dependencies
│   ├── sql_app.db          # SQLite database file
│   └── .env                # Optional: for PostgreSQL connection details
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages (layout.tsx, page.tsx)
│   │   ├── components/     # React components
│   │   ├── providers/      # Client-side providers (e.g., Chakra UI)
│   │   ├── services/       # API communication logic
│   │   └── store/          # Zustand state management
│   ├── next.config.mjs     # Next.js configuration
│   ├── package.json        # Node dependencies
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
├── .cursor/                # Cursor-specific configurations (rules, tools)
├── .gitignore
└── README.md               # This file
```
*(Note: The backend structure for application files like `main.py`, `crud.py`, etc., might reside directly in `backend/` or within a subdirectory like `backend/app/`. The example above assumes `backend/app/` for modularity, consistent with imports like `from . import models` in `main.py` if it were in `backend/app/main.py`.)*

## Features

*   **Task Management:** Create, view, update, and delete tasks with titles, descriptions, status, priority, etc.
*   **Project Organization:** Create, view, update, and delete projects to group tasks.
*   **Agent Registration:** Register and manage agents that can be assigned to tasks.
*   **Task Assignment:** Link tasks to specific projects and assign them to registered agents.
*   **Subtask Management:** (If implemented) Create and manage subtasks under main tasks.
*   **Filtering:** Filter tasks by project, agent, or other criteria.
*   **MCP Enabled:** Backend integration with `FastApiMCP` to expose MCP-compliant endpoints.
*   **Planning Support:** Includes a `/planning/generate-prompt` endpoint for integration with planning agents like Overmind.

## MCP Integration

The backend is designed for integration with the Model Context Protocol:
*   It utilizes `fastapi-mcp` to initialize and mount MCP functionalities.
*   Standard MCP routes (e.g., under `/mcp/...`) are expected to be available once `FastApiMCP` is active.
*   The system includes specific endpoints like `/planning/generate-prompt` which can be used by MCP agents (e.g., OvermindAgent) to facilitate planning and execution within the broader agentic framework.
*   The `backend/mcp/server/agents/` directory is provisioned, suggesting future capabilities for hosting or defining MCP agents directly within the Task Manager's backend.

## Setup and Running

### Prerequisites

*   Python 3.8+
*   Node.js 18.x+ and npm

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
# On Windows:
python -m venv .venv
.\.venv\Scripts\activate
# On macOS/Linux:
# python3 -m venv .venv
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure PostgreSQL (see original README section for details)

# Run the FastAPI development server
# It will automatically create the sql_app.db (SQLite) if it doesn't exist
# and initialize MCP services.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# (If main.py is directly in backend/, use: uvicorn main:app --reload ...)
```

The backend API will be available at `http://localhost:8000`.
Interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs`.
MCP endpoints should be available under `http://localhost:8000/mcp/`.

### 2. Frontend Setup (Next.js)

```bash
# Navigate to the frontend directory (from the project root)
cd frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```

The frontend application, titled "MCP Task Manager Frontend," will be available at `http://localhost:3000`.

## How It Works

1.  The **Next.js frontend** (`MCP Task Manager Frontend` on port 3000) provides the user interface.
2.  Components in `src/components` and pages in `src/app/` handle display and user interactions, leveraging **Tailwind CSS** and **Chakra UI** for styling.
3.  Global state is managed using **Zustand** (`src/store/`).
4.  Frontend communicates with the backend via API service calls (`src/services/`).
5.  The **FastAPI backend** (port 8000) handles requests:
    *   Validates data using Pydantic schemas.
    *   Interacts with the database (SQLite/PostgreSQL) via SQLAlchemy models and CRUD operations.
    *   Initializes `FastApiMCP` to provide Model Context Protocol services and endpoints.
6.  CORS middleware enables cross-origin communication.

