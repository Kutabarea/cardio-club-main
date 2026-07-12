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
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3001
echo.
echo Tunnel stopped.
pause