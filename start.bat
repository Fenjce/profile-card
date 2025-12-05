@echo off
title Profile Card - Development Server
color 0A

echo ========================================
echo   Profile Card - Development Server
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "node_modules" (
    echo.
    echo node_modules not found. Installing dependencies...
    echo.
    npm install
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

choice /C YN /M "Do you want to open the browser tabs"
if errorlevel 2 goto skip_browser
if errorlevel 1 goto open_browser

:open_browser
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000
start http://localhost:3000/admin/edit
goto start_server

:skip_browser
echo.
echo Skipping browser opening...

:start_server
npm run dev
pause

