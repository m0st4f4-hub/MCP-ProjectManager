Param()
$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location "$scriptDir/backend"

if (-Not (Test-Path '.venv')) {
    Write-Host '[init] Creating Python virtual environment...'
    python -m venv .venv
}

$pip = '.venv\Scripts\pip.exe'
$alembic = '.venv\Scripts\alembic.exe'

Write-Host '[init] Installing Python requirements...'
& $pip install -r requirements.txt

Write-Host '[init] Applying Alembic migrations...'
& $alembic upgrade head

Write-Host '[init] Backend initialization complete'
