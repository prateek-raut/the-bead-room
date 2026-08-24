@echo off
title The Bead Room by Pallas - E-Commerce Server
echo ========================================================
echo   🌸 Starting The Bead Room by Pallas Server 🎨
echo ========================================================
echo   Web Storefront : https://github.com/prateek-raut/the-bead-room
echo   Admin Portal   : https://github.com/prateek-raut/the-bead-room/admin.html
echo   Store Email    : sarakamdar26@gmail.com
echo ========================================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
