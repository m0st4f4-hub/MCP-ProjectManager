@echo off
REM Task Manager Development Launcher
REM Starts both backend and frontend servers with correct commands

title Task Manager Dev Launcher

echo ========================================
echo    Task Manager Development Launcher
echo ========================================
echo.

REM --- Clear backend (8000) and frontend (3000) ports before starting servers ---
echo Checking and clearing ports...
powershell -NoProfile -Command "$ports = @(8000, 3000); foreach ($port in $ports) { try { $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($process) { Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('✓ Killed process on port ' + $port) } else { Write-Host ('✓ Port ' + $port + ' is free') } } catch { Write-Host ('⚠ Error checking port ' + $port + ': ' + $_.Exception.Message) } }; exit 0"
echo.

REM --- Start Backend Server ---
echo Starting Backend Server (Python/FastAPI)...
echo Backend will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
start "Task Manager Backend" cmd /k "cd /d D:\mcp\task-manager && backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo.

REM --- Start Frontend Server ---
echo Starting Frontend Server (Next.js)...
echo Frontend will be available at: http://localhost:3000
start "Task Manager Frontend" cmd /k "cd /d D:\mcp\task-manager\frontend && npm run dev"

echo.
echo ========================================
echo           Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Both servers are launching in separate windows.
echo Close this window or press any key to exit launcher.
echo.

pause >nul
