@echo off
title Push The Bead Room by Pallas to GitHub
echo ========================================================
echo   🌸 Pushing All Files to GitHub Repository 🎨
echo   Target: https://github.com/prateek-raut/the-bead-room.git
echo ========================================================
echo.

git init
git add .
git commit -m "Complete website, admin portal and backend for The Bead Room by Pallas"
git branch -M main
git remote remove origin
git remote add origin https://github.com/prateek-raut/the-bead-room.git
git push -u origin main

echo.
echo ========================================================
echo   Done! All files pushed to GitHub.
echo ========================================================
pause
