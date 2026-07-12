$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "Stopping Cardio Club demo processes..." -ForegroundColor Cyan

$port = 3001
$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

foreach ($connection in $connections) {
  $pidToStop = $connection.OwningProcess

  if ($pidToStop) {
    Write-Host "Stopping process on port 3001. PID: $pidToStop" -ForegroundColor Yellow
    Stop-Process -Id $pidToStop -Force
  }
}

$cloudflaredProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue

foreach ($process in $cloudflaredProcesses) {
  Write-Host "Stopping cloudflared. PID: $($process.Id)" -ForegroundColor Yellow
  Stop-Process -Id $process.Id -Force
}

Write-Host "Demo stopped." -ForegroundColor Green