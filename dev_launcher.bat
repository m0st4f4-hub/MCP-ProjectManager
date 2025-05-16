@echo off
REM Batch file to launch Task Manager Dev Servers

REM --- Clear backend (8080) and frontend (3000) ports before starting servers ---
powershell -NoProfile -Command "$ports = @(8080, 3000); foreach ($port in $ports) { try { $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($process) { Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('Killed process on port ' + $port) } else { Write-Host ('No process found on port ' + $port) } } catch { Write-Host $_.Exception.Message } }; exit 0"

REM --- End port clearing ---

title Task Manager Dev Launcher

echo Starting Backend Server...
REM Start the backend dev server in a new window
start "Task Manager Backend" npm run dev:backend

echo.
echo Starting Frontend Server...
REM Start the frontend dev server in a new window
start "Task Manager Frontend" npm run dev:frontend

echo.
echo Backend and Frontend servers launched in separate windows.

REM Optional: Pause to see this message before the launcher window closes
REM pause 