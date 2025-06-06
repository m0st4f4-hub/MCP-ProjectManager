# Task Manager Development Launcher
# PowerShell script to start both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Task Manager Development Launcher" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check and kill processes on specific ports
function Clear-Port {
    param([int]$Port)
    
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Killed process on port $Port" -ForegroundColor Green
        } else {
            Write-Host "✓ Port $Port is free" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Error checking port $Port : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Clear ports
Write-Host "Checking and clearing ports 8000 and 3000..." -ForegroundColor Yellow
Clear-Port -Port 8000
Clear-Port -Port 3000
Write-Host ""

# Change to project root directory
$projectRoot = "D:\mcp\task-manager"
Set-Location $projectRoot

# Apply database migrations
Write-Host "Applying database migrations..." -ForegroundColor Yellow
& backend\.venv\Scripts\python.exe -m alembic upgrade head

# Start Backend Server
Write-Host "Starting Backend Server (Python/FastAPI)..." -ForegroundColor Yellow
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation at: http://localhost:8000/docs" -ForegroundColor Cyan

$backendCommand = "backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server (Next.js)..." -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan

Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev" -WindowStyle Normal

# Return to project root
Set-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "          Servers Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are launching in separate windows." -ForegroundColor White
Write-Host "Press any key to exit launcher..." -ForegroundColor Gray
Write-Host ""

# Wait for user input
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
