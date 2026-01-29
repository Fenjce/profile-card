@echo off
title Profile Card - Development Server
color 0A

echo ========================================
echo   Profile Card - Development Server
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "..\node_modules" (
    echo.
    echo node_modules not found. Installing dependencies...
    echo.
    cd ..
    npm install
    cd scripts
    echo.
    echo Installation complete!
    echo.
) else (
    echo node_modules found. Skipping installation.
    echo.
)

echo Starting Next.js Development Server...
echo.
echo ========================================
echo   Server is starting...
echo ========================================
echo.
echo   Main card: http://localhost:3000
echo   Edit card:  http://localhost:3000/admin/edit
echo.
echo ========================================
echo   Press Ctrl + C to stop the server
echo ========================================
echo.

cd ..
npm run dev
pause

