@echo off
title DocuMind AI - Stopping

echo ========================================
echo       Stopping DocuMind AI...
echo ========================================
echo.

docker compose -f docker-compose.prod.yml down

echo.
echo DocuMind AI stopped successfully.
echo.

pause