#!/bin/bash

# Initialize git repository (if not already done)
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "🚢 Initial commit: AIS Ship Tracker with NOAA data integration"

# Add your GitHub repository as remote (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/ship-navigation-tracker.git

# Push to GitHub main branch
git branch -M main
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "🌐 Your repository: https://github.com/yourusername/ship-navigation-tracker"
echo ""
echo "Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings > Pages"
echo "3. Select 'GitHub Actions' as source"
echo "4. Your app will be available at: https://yourusername.github.io/ship-navigation-tracker/"