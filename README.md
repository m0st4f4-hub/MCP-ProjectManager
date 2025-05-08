# Task Manager - FastAPI & Next.js

A full-stack task manager application built with a FastAPI backend and a Next.js frontend.

## Tech Stack

*   **Backend:**
    *   FastAPI
    *   Python 3.x
    *   SQLAlchemy (ORM)
    *   Pydantic (Data Validation)
    *   SQLite (Default Database) / PostgreSQL (Optional)
    *   Uvicorn (ASGI Server)
    *   `python-dotenv` (Environment Variables)
*   **Frontend:**
    *   Next.js (React Framework)
    *   TypeScript
    *   Tailwind CSS (Styling)
    *   Zustand (State Management)
    *   `fetch` API (for backend communication)
*   **Development:**
    *   Node.js & npm
    *   Python Virtual Environment (`venv`)

## Project Structure

```
task-manager/
├── backend/
│   ├── .venv/              # Python virtual environment (created on setup)
│   ├── crud.py             # Database CRUD functions
│   ├── database.py         # Database engine, session, Base
│   ├── main.py             # FastAPI application, routes, CORS
│   ├── models.py           # SQLAlchemy ORM models (Task table)
│   ├── schemas.py          # Pydantic schemas for API data
│   ├── requirements.txt    # Python dependencies
│   └── sql_app.db          # SQLite database file (created on first run)
│   └── .env                # Optional: for PostgreSQL connection details
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages (page.tsx)
│   │   ├── components/     # React components (AddTaskForm, TaskList, etc.)
│   │   ├── services/       # API communication logic (api.ts)
│   │   └── store/          # Zustand state management (taskStore.ts)
│   ├── next.config.mjs     # Next.js configuration
│   ├── package.json        # Node dependencies
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
└── README.md               # This file
```

## Features (Overview)

*   **Task Management:** Create, view, update, and delete tasks.
*   **Project Organization:** Create, view, update, and delete projects to group tasks.
*   **Agent Assignment:** (If applicable and UI supports it clearly) Assign agents to tasks.
*   **Scope Definition:** (If applicable and UI supports it clearly) Define scopes for tasks.
*   **Subtask Management:** Create and manage subtasks under main tasks.
*   **Filtering:** Filter tasks by project, agent, or scope.

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

1.  The **Next.js frontend** (running on port 3000) provides the user interface.
2.  Components in `src/components` handle the display and user interactions.
3.  State management is handled globally using **Zustand** (`src/store/taskStore.ts`).
4.  When data is needed or actions occur (add, update, delete), components (usually via the Zustand store) call functions in the **API service** (`src/services/api.ts`).
5.  The API service uses `fetch` to make requests to the **FastAPI backend** (running on port 8000).
6.  The FastAPI backend receives requests, validates data using **Pydantic schemas** (`schemas.py`), and interacts with the database using **CRUD functions** (`crud.py`) and **SQLAlchemy models** (`models.py`).
7.  **CORS middleware** in FastAPI allows the frontend (on port 3000) to communicate with the backend (on port 8000).
8.  Data is stored in the **SQLite database** (`sql_app.db`) by default, or PostgreSQL if configured.

