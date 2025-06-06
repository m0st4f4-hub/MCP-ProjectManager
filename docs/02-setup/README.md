# Setup & Installation Guide

This guide covers everything you need to get the MCP Project Manager running on your development machine.

## 🚀 Quick Start (Recommended)

### One-Command Setup
```bash
python start_system.py
```

This automatically:
- ✅ Launches FastAPI backend and Next.js frontend
- ✅ Clears ports 8000 and 3000
- ✅ Opens API docs at [http://localhost:8000/docs](http://localhost:8000/docs)
- ✅ Creates API schema snapshot: `backend/openapi.json`

### Alternative Launch Methods

Choose the method that works best for your platform:

```bash
# Quick start options:
scripts/dev/dev_launcher.bat
# OR
node scripts/dev/dev_launcher.js
# OR
npm run dev
# OR
powershell scripts/dev/dev_launcher.ps1
```

## 📋 System Requirements

### Backend Requirements
- **Python**: 3.8+ (3.11+ recommended)
- **Database**: SQLite (included) or PostgreSQL
- **OS**: Windows, macOS, Linux

### Frontend Requirements
- **Node.js**: 18+ (npm included)
- **Browser**: Modern browser with ES6+ support

## 🔧 Manual Setup (Advanced)

### Backend Setup

1. **Create Virtual Environment**
   ```bash
   cd backend
   python -m venv .venv
   
   # Activate (Windows)
   .venv\Scripts\activate
   
   # Activate (macOS/Linux)
   source .venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your settings (optional for development)
   ```

4. **Initialize Database**
   ```bash
   # Apply migrations
   python -m alembic upgrade head
   ```

5. **Start Backend Server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example environment file
   cp .env.local.example .env.local
   
   # Edit .env.local if backend runs on different port
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🌐 Environment Configuration

### Backend Environment Variables (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./sql_app.db` | Database connection string |
| `SECRET_KEY` | `mysecretkey` | JWT signing key |
| `DEBUG` | `True` | Enable debug mode |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token lifetime |

### Frontend Environment Variables (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Backend API URL |

## 🗄️ Database Setup

### SQLite (Default)
No additional setup required. Database file (`sql_app.db`) is created automatically.

### PostgreSQL (Optional)
1. Install PostgreSQL
2. Create database
3. Update `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
   ```

### Database Migrations

```bash
# Apply all pending migrations
cd backend
python -m alembic upgrade head

# Create new migration (after model changes)
alembic revision --autogenerate -m "description"
```

## 🧪 Verification

### Check Backend
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- OpenAPI Spec: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Check Frontend
- Application: [http://localhost:3000](http://localhost:3000)
- Project Management: [http://localhost:3000/projects](http://localhost:3000/projects)
- Task Dashboard: [http://localhost:3000/tasks](http://localhost:3000/tasks)

### Run Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Integration tests
python final_integration.py --mode all
```

## 🛠️ Development Tools

### CLI Tool
```bash
# Install globally
npm install -g mcp-project-manager-cli

# Use locally
node scripts/utils/cli.js migrate  # Apply database migrations
```

### Makefile Commands
```bash
make migrate   # Apply database migrations
make format    # Auto-fix code style (Python + Frontend)
```

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill processes (Windows)
taskkill /F /PID <PID_NUMBER>
```

### Backend Issues
```bash
# Recreate virtual environment
cd backend
rm -rf .venv
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Frontend Issues
```bash
# Clear dependencies and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
rm sql_app.db
python -m alembic upgrade head
```

## 📱 Platform-Specific Notes

### Windows
- Use `scripts/dev/dev_launcher.bat` for best experience
- PowerShell execution policy may need adjustment:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### macOS/Linux
- Use `./init_backend.sh` for backend initialization
- Ensure Python 3.8+ is available as `python3`

### Docker (Future)
Docker support is planned for future releases.

## 🎯 Next Steps

After successful setup:
1. Read the [Development Guide](../03-development/README.md)
2. Explore the [API Documentation](../04-api/README.md)
3. Check out [Frontend Components](../05-frontend/README.md)

## 📞 Getting Help

- Check the [Troubleshooting Guide](../08-operations/troubleshooting.md)
- Review [Common Issues](../08-operations/common-issues.md)
- Open an issue on GitHub for bugs or feature requests
