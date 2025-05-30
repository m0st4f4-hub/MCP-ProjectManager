# 🚀 Task Manager Development Launcher Guide

## ✅ Quick Start Options

### Option 1: Batch File Launcher (Windows) - **RECOMMENDED**
```bash
# From project root
dev_launcher.bat
```

### Option 2: PowerShell Launcher (Windows)
```powershell
# From project root  
powershell -ExecutionPolicy Bypass -File dev_launcher.ps1
```

### Option 3: Node.js Launcher (Cross-platform)
```bash
# From project root
node dev_launcher.js
```

### Option 4: NPM Scripts
```bash
# All servers with one command
npm run dev

# Or individual servers
npm run dev:backend    # Backend only
npm run dev:frontend   # Frontend only
```

### Option 5: Manual Commands
```bash
# Backend (from project root)
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (from project root)
cd frontend && npm run dev
```

## 📋 What Each Launcher Does

### 🔧 Automatic Setup
- ✅ **Kills processes** on ports 8000 and 3000
- ✅ **Starts backend** server with correct Python environment
- ✅ **Starts frontend** server with Next.js dev mode
- ✅ **Opens separate windows** for each server
- ✅ **Provides clear URLs** for access

### 🌐 Server URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📁 File Descriptions

### `dev_launcher.bat` ⭐ **RECOMMENDED**
- **Platform**: Windows only
- **Features**: Colorized output, automatic port clearing, separate windows
- **Best for**: Windows development

### `dev_launcher.ps1`
- **Platform**: Windows PowerShell
- **Features**: Advanced PowerShell features, colored output
- **Best for**: PowerShell users

### `dev_launcher.js`
- **Platform**: Cross-platform (Windows, macOS, Linux)
- **Features**: Node.js based, handles process cleanup
- **Best for**: Cross-platform teams

### `package.json` scripts
- **Platform**: Cross-platform
- **Features**: Standard npm commands
- **Best for**: Integration with existing workflows

## 🛠️ Manual Development Commands

### Backend Development
```bash
# Activate virtual environment and start server
cd D:\mcp\task-manager
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Run backend tests
npm run test:backend
# or
cd backend && .venv\Scripts\pytest.exe tests\test_async_example.py -v
```

### Frontend Development  
```bash
# Start frontend development server
cd D:\mcp\task-manager\frontend
npm run dev

# Build frontend for production
npm run build

# Run frontend linting
npm run lint
```

## 🔍 Troubleshooting

### Port Already in Use
The launchers automatically kill processes on ports 8000 and 3000, but if you encounter issues:

```bash
# Manual port clearing (Windows)
netstat -ano | findstr :8000
taskkill /F /PID <PID_NUMBER>

netstat -ano | findstr :3000  
taskkill /F /PID <PID_NUMBER>
```

### Virtual Environment Issues
If backend fails to start:
```bash
# Recreate virtual environment
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Dependencies
If frontend fails to start:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Best Practices

1. **Use `dev_launcher.bat`** for daily Windows development
2. **Check ports are clear** before manual starts  
3. **Use separate terminals** for debugging individual services
4. **Monitor logs** in the separate windows that open
5. **Use Ctrl+C** to stop servers gracefully

## 📋 Development Workflow

1. **Start Development**:
   ```bash
   dev_launcher.bat
   ```

2. **Verify Services**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000/docs

3. **Development**:
   - Edit code (both servers auto-reload)
   - Check logs in separate windows
   - Test API endpoints via docs

4. **Stop Development**:
   - Close launcher window OR
   - Ctrl+C in each server window

---

**Ready to develop!** 🎉 All launchers are configured with the correct commands and ports.
