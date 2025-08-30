@echo off
REM Windows batch script to deploy to GitHub

echo 🚢 Deploying AIS Ship Tracker to GitHub...
echo.

REM Initialize git repository (if not already done)
git init

REM Add all files to git
git add .

REM Create initial commit
git commit -m "🚢 AIS Ship Tracker: Real-time maritime surveillance with NOAA data"

REM Add your specific GitHub repository as remote
git remote add origin https://github.com/shruti-ugale-code/new_visual.git

REM Push to GitHub main branch
git branch -M main
git push -u origin main

echo.
echo ✅ Successfully pushed to GitHub!
echo 🌐 Your repository: https://github.com/shruti-ugale-code/new_visual
echo.
echo Next steps:
echo 1. Go to your GitHub repository
echo 2. Click Settings ^> Pages
echo 3. Select 'GitHub Actions' as source
echo 4. Your app will be available at: https://shruti-ugale-code.github.io/new_visual/
echo.
pause