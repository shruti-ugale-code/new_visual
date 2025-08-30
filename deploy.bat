@echo off
echo 🚢 Deploying AIS Ship Tracker to GitHub...
echo.

git add .
git commit -m "🚢 AIS Ship Tracker: Maritime surveillance system"
git remote add origin https://github.com/shruti-ugale-code/new_visual.git 2>nul
git push -u origin main

echo.
echo ✅ Deployed successfully!
echo 🌐 Repository: https://github.com/shruti-ugale-code/new_visual
echo 📱 Live App: https://shruti-ugale-code.github.io/new_visual/
echo.
echo Next: Enable GitHub Pages in repository settings!
pause