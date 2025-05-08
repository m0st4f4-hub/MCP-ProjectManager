@echo off
echo Starting Backend Server...
start "Backend" cmd /c "npm run dev:backend"

echo Waiting 5 seconds before starting Frontend...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend" cmd /c "npm run dev:frontend"

echo Both processes launched in separate windows.
