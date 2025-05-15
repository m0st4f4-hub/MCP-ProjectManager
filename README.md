[![CI - Main](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/mcp-project-manager-cli.svg)](https://badge.fury.io/js/mcp-project-manager-cli)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

# MCP Project Manager Suite

An open-source, full-stack suite for collaborative project management, empowering human users and AI agents to manage, automate, and execute complex projects—end-to-end. Built with a FastAPI backend, a Next.js/Chakra UI frontend, and integrated with the Model Context Protocol (MCP) for advanced agentic capabilities.

## Tech Stack

*   **Backend:**
    *   FastAPI (Python 3.x)
    *   SQLAlchemy (ORM)
    *   Pydantic (Data Validation)
    *   Alembic (Database Migrations)
    *   SQLite (Default) / PostgreSQL (Optional)
    *   Uvicorn (ASGI Server)
    *   `python-dotenv` (Environment Variables)
    *   MCP Server Integration (`fastapi-mcp`)
*   **Frontend:**
    *   Next.js (React Framework)
    *   TypeScript
    *   Chakra UI (Component Library & Styling)
    *   Zustand (State Management)
    *   `fetch` API / React Query (for backend communication)
*   **Development & CLI:**
    *   Node.js & npm
    *   Python Virtual Environment (`venv`)
    *   Commander.js (CLI Framework)
*   **Agent & Rules Engine:**
    *   Model Context Protocol (MCP)
    *   `.cursor` rules (.mdc files)

## Project Structure

```
project-manager/
├── .cursor/                # MCP rules and agent configurations
│   ├── rules/              # Agent rule files (.mdc)
│   └── ...
├── backend/
│   ├── .venv/              # Python virtual environment
│   ├── alembic/            # Alembic migration scripts
│   ├── crud.py             # Database CRUD functions
│   ├── database.py         # Database engine, session, Base
│   ├── main.py             # FastAPI application, routes, MCP integration
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic schemas for API data
│   ├── tests/              # Backend tests
│   ├── pyproject.toml      # Project metadata and dependencies (or requirements.txt)
│   └── sql_app.db          # SQLite database file
│   └── .env                # Optional: for PostgreSQL connection details
├── frontend/
│   ├── public/             # Static assets (images, favicons)
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (e.g., ThemeContext)
│   │   ├── theme/          # Chakra UI theme configuration (index.ts)
│   │   ├── services/       # API communication logic
│   │   └── store/          # Zustand state management
│   ├── next.config.mjs     # Next.js configuration
│   ├── package.json        # Node dependencies
│   ├── tsconfig.json       # TypeScript configuration
├── cli.js                  # Main CLI script for the suite
├── BRAND_ASSETS_GUIDE.md   # Branding guidelines and asset paths
└── README.md               # This file
```

## Features (Overview)

*   **Collaborative Project Management:** Enables seamless collaboration between human users and AI agents.
*   **MCP Integration:** Leverages the Model Context Protocol for rule-driven agent orchestration, automation, and task delegation.
*   **Agentic Capabilities:** Define and utilize different AI agents for specialized tasks within projects.
*   **Unified Interface:** Modern WebGUI (Next.js/Chakra UI) for human interaction, monitoring, and guidance.
*   **Comprehensive Task Management:** Create, view, update, delete, and assign tasks and subtasks.
*   **Project Organization:** Group tasks into projects with descriptions and statuses.
*   **Flexible Filtering:** Filter and search tasks by various criteria.
*   **CLI for Easy Setup & Management:** One-command setup and an `npx`-runnable CLI to manage the entire suite.

## Setup and Running

While the `mcp-project-manager-cli` (see below) is the recommended way to get started, you can also set up and run the backend and frontend services manually.

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
# The cli.js installs these directly: fastapi, uvicorn, sqlalchemy, alembic, psycopg2-binary
# Ensure these are captured in a requirements.txt or pyproject.toml for manual setup if preferred.
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary

# (Optional) Configure PostgreSQL
# 1. Create a .env file in the backend/ directory
# 2. Add your PostgreSQL connection details:
#    DATABASE_USER=your_db_user
#    DATABASE_PASSWORD=your_db_password
#    DATABASE_HOST=your_db_host (e.g., localhost)
#    DATABASE_PORT=your_db_port (e.g., 5432)
#    DATABASE_NAME=your_db_name
# 3. Uncomment the PostgreSQL section in backend/database.py
#    and comment out the SQLite section.

# Run the FastAPI development server
# It will automatically create the sql_app.db (SQLite) if it doesn't exist
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`.
Interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js)

```bash
# Navigate to the frontend directory (from the project root)
cd frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

## How It Works

1.  The **MCP Project Manager CLI** (`cli.js`) orchestrates the setup and launching of all services.
2.  The **FastAPI backend** (Python) serves the main API, manages database interactions (via SQLAlchemy and Pydantic), and integrates the MCP server (`fastapi-mcp`) for agentic operations based on `.cursor/rules`.
3.  The **Next.js frontend** (TypeScript, Chakra UI) provides a responsive and themeable user interface for project and task management, interacting with the backend API.
4.  **Zustand** is used for client-side state management in the frontend.
5.  **Chakra UI** provides the component library and styling, ensuring a consistent and modern look and feel with light/dark mode support.
6.  Data is stored in an **SQLite database** by default, with PostgreSQL as an option.
7.  **Alembic** is used for database schema migrations.

# Project Manager CLI

**MCP + WebGUI = Collaborative Agent & Human Project Management Platform**

> Where agents and humans manage projects—together.

Project Manager CLI is a next-generation platform that seamlessly combines autonomous agent orchestration (via the Model Context Protocol, MCP) with a modern web-based GUI. It empowers both human users and AI agents to collaboratively manage, automate, and execute complex projects—end-to-end.

## Prerequisites

- Node.js (v18.x or higher recommended, v14 minimum)
- Python (v3.8 or higher)
- npm (comes with Node.js)

## Installation

You can run the MCP Project Manager CLI directly using npx. This command now runs the fully bundled application:

```bash
npx mcp-project-manager-cli start
```

This is the recommended way for most users to start the Project Manager Suite, as it ensures you are running the pre-built and tested version of the application.

Alternatively, you can install it globally:

```bash
npm install -g mcp-project-manager-cli
mcp-project-manager start
```
This will also run the bundled application.

## Features

- One-command installation and startup
- Automatic dependency installation for both backend and frontend
- Auto-restart on failure
- Cross-platform support (Windows, macOS, Linux)
- Real-time logging with color-coded output
- Automatic port management

## What it Does

When you run `npx mcp-project-manager-cli start` or `mcp-project-manager start`:

1. **Checks for Prerequisites:** Verifies that compatible versions of Node.js and Python are available on your system.
2. **Runs Bundled Application:** Executes the pre-built Project Manager Suite. This includes:
    *   The FastAPI backend server.
    *   The Next.js frontend application.
3. **No Local Setup Needed:** Unlike previous versions or manual setup, this command *does not* perform local dependency installations (npm install for frontend, pip install for backend) or Python virtual environment creation in your current directory. These steps are handled during the bundling of the `mcp-project-manager-cli` package itself.
4. **Manages Services:** Starts both backend and frontend services with auto-restart capabilities.
5. **Provides Logging:** Offers real-time, color-coded logging for both services.
6. **Port Management:** Uses default ports (Backend: 8000, Frontend: 3000) and may offer options for custom ports (check `mcp-project-manager start --help`).

The key change is that `start` now directly runs the application, simplifying setup and ensuring a consistent environment. For development or contributions to the suite itself, refer to the manual setup instructions earlier in this README.

## Configuration

The services will run on the following default ports:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Troubleshooting

If you encounter any issues:

1. Make sure both Node.js and Python are installed and in your PATH
2. Check if the ports 8000 and 3000 are available
3. If services fail to start, check the logs for detailed error messages

## License

ISC

