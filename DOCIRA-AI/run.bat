@echo off
title DocuMind AI - Starting

echo ========================================
echo       DocuMind AI Starting...
echo ========================================
echo.

docker compose -f docker-compose.prod.yml up -d

echo.
echo ========================================
echo       DocuMind AI is Running!
echo ========================================
echo.
echo Open: http://localhost
echo.

start http://localhost

pause
