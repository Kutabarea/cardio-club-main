$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "Cardio Club Windows demo launcher" -ForegroundColor Cyan
Write-Host "---------------------------------" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Checking demo data..." -ForegroundColor Yellow
npm run demo:check

Write-Host ""
Write-Host "2. Building production app..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "3. Checking port 3001..." -ForegroundColor Yellow

$port = 3001
$existingConnection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($existingConnection) {
  Write-Host "Port 3001 is already busy. Stopping old process..." -ForegroundColor Yellow

  foreach ($connection in $existingConnection) {
    if ($connection.OwningProcess) {
      Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
    }
  }

  Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "4. Starting production server on http://localhost:3001 ..." -ForegroundColor Yellow

$command = "cd `"$projectRoot`"; npm run demo:serve"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $command

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "5. Opening browser..." -ForegroundColor Yellow

Start-Process "http://localhost:3001"
Start-Process "http://localhost:3001/admin"
Start-Process "http://localhost:3001/api/health"

Write-Host ""
Write-Host "Demo is running:" -ForegroundColor Green
Write-Host "Site:   http://localhost:3001"
Write-Host "Admin:  http://localhost:3001/admin"
Write-Host "Health: http://localhost:3001/api/health"
Write-Host ""
Write-Host "To create public link: npm run demo:tunnel" -ForegroundColor Cyan
Write-Host "To stop demo server:   npm run demo:stop" -ForegroundColor Cyan