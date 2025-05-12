@echo off
REM Batch file to launch Task Manager Dev Servers

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