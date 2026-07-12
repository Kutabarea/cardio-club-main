$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Find-Cloudflared {
  $command = Get-Command cloudflared -ErrorAction SilentlyContinue

  if ($command) {
    return $command.Source
  }

  $candidateFiles = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\cloudflared.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe",
    "$env:ProgramFiles\cloudflared\cloudflared.exe",
    "$env:ProgramFiles\Cloudflare\cloudflared.exe",
    "${env:ProgramFiles(x86)}\cloudflared\cloudflared.exe",
    "${env:ProgramFiles(x86)}\Cloudflare\cloudflared.exe"
  )

  foreach ($file in $candidateFiles) {
    if ($file -and (Test-Path $file)) {
      return $file
    }
  }

  $searchRoots = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages",
    "$env:ProgramFiles",
    "${env:ProgramFiles(x86)}"
  )

  foreach ($root in $searchRoots) {
    if ($root -and (Test-Path $root)) {
      $found = Get-ChildItem -Path $root -Filter "cloudflared.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

      if ($found) {
        return $found.FullName
      }
    }
  }

  return $null
}

Write-Host ""
Write-Host "Cardio Club public demo link" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan
Write-Host ""

$port = 3001
$existingConnection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if (-not $existingConnection) {
  Write-Host "Local demo server is not running on port 3001." -ForegroundColor Red
  Write-Host "First run: npm run demo:win" -ForegroundColor Red
  exit 1
}

$cloudflaredPath = Find-Cloudflared

if (-not $cloudflaredPath) {
  Write-Host "cloudflared is not installed or not visible in PATH." -ForegroundColor Yellow
  Write-Host "Installing cloudflared via winget..." -ForegroundColor Yellow

  $winget = Get-Command winget -ErrorAction SilentlyContinue

  if (-not $winget) {
    Write-Host "winget not found." -ForegroundColor Red
    Write-Host "Temporary tunnel cannot be created automatically on this PC." -ForegroundColor Red
    exit 1
  }

  winget install --id Cloudflare.cloudflared -e --accept-package-agreements --accept-source-agreements

  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"

  $cloudflaredPath = Find-Cloudflared
}

if (-not $cloudflaredPath) {
  Write-Host ""
  Write-Host "cloudflared was installed, but PowerShell still cannot find cloudflared.exe." -ForegroundColor Red
  Write-Host "Close all PowerShell windows, open a new one, then run:" -ForegroundColor Yellow
  Write-Host "cd C:\cardio-club-main" -ForegroundColor Yellow
  Write-Host "npm run demo:tunnel" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Found cloudflared:" -ForegroundColor Green
Write-Host $cloudflaredPath
Write-Host ""

$cmdPath = Join-Path $projectRoot "scripts\run-cloudflared-tunnel.cmd"

$cmdContent = @"
@echo off
title Cardio Club Cloudflare Tunnel
echo.
echo Cardio Club public demo tunnel
echo ------------------------------
echo.
echo Local site: http://localhost:3001
echo.
echo Wait for the line with:
echo https://something.trycloudflare.com
echo.
echo Copy that link and send it to the person who needs to view the demo.
echo Do not close this window while showing the demo.
echo.
"$cloudflaredPath" tunnel --url http://localhost:3001
echo.
echo Tunnel stopped.
pause
"@

[System.IO.File]::WriteAllText($cmdPath, $cmdContent, [System.Text.Encoding]::ASCII)

Write-Host "Starting Cloudflare temporary tunnel..." -ForegroundColor Yellow
Write-Host "A new CMD window will open." -ForegroundColor Cyan
Write-Host "Copy the https://...trycloudflare.com link from that window." -ForegroundColor Cyan
Write-Host ""

Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "`"$cmdPath`""