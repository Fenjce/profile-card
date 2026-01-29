@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   GIT UPLOAD TOOL
echo ========================================
echo.
echo 1. Git Push (current branch)
echo 2. Git Push Branch (specify branch)
echo 3. Delete Oldest Commits (specify count and branch)
echo.

set /p choice="Select option (1-3): "

if "%choice%"=="1" goto push_current
if "%choice%"=="2" goto push_branch
if "%choice%"=="3" goto delete_commits
echo Invalid choice!
pause
exit /b 1

:push_current
echo.
echo [1/4] Checking git status...
cd ..
git status
cd scripts
echo.

echo [2/4] Staging all changes...
cd ..
git add -A
if errorlevel 1 (
    echo Error: Failed to stage changes
    cd scripts
    pause
    exit /b 1
)
cd scripts

echo.
echo Staged files:
cd ..
git diff --cached --name-only
cd scripts
echo.

REM Get current timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
set timestamp=!mydate! !mytime!

echo [3/4] Committing changes...
cd ..
git commit -m "Auto commit: !timestamp!"
if errorlevel 1 (
    echo Error: Failed to commit (maybe no changes?)
    cd scripts
    pause
    exit /b 1
)
cd scripts

echo.
echo Commit info:
cd ..
git log -1 --oneline
cd scripts
echo.

echo [4/4] Pushing to remote...
cd ..
git push
if errorlevel 1 (
    echo Error: Failed to push
    cd scripts
    pause
    exit /b 1
)
cd scripts

echo.
echo ========================================
echo   PUSH SUCCESS!
echo ========================================
echo.
pause
exit /b 0

:push_branch
echo.
set /p branch="Enter branch name: "

if "!branch!"=="" (
    echo Error: Branch name cannot be empty
    pause
    exit /b 1
)

echo.
echo [1/3] Checking git status...
cd ..
git status
cd scripts
echo.

echo [2/3] Pushing to branch: !branch!...
cd ..
git push origin !branch!
if errorlevel 1 (
    echo Error: Failed to push to branch !branch!
    cd scripts
    pause
    exit /b 1
)
cd scripts

echo.
echo [3/3] Final status:
cd ..
git status
cd scripts
echo.

echo ========================================
echo   PUSH TO BRANCH SUCCESS!
echo ========================================
echo.
pause
exit /b 0

:delete_commits
echo.
set /p count="Enter number of OLDEST commits to delete: "
set /p branch="Enter branch name: "

if "!count!"=="" (
    echo Error: Commit count cannot be empty
    pause
    exit /b 1
)

if "!branch!"=="" (
    echo Error: Branch name cannot be empty
    pause
    exit /b 1
)

REM Validate count is a number
for /f %%A in ('powershell -Command "if ('!count!' -match '^[0-9]+$') {Write-Host 'valid'} else {Write-Host 'invalid'}"') do set validation=%%A

if "!validation!"=="invalid" (
    echo Error: Commit count must be a number
    pause
    exit /b 1
)

echo.
echo WARNING: This will delete the OLDEST !count! commits from branch "!branch!"
echo.
set /p confirm="Are you sure? (yes/no): "

if /i not "!confirm!"=="yes" (
    echo Operation cancelled
    pause
    exit /b 0
)

echo.
echo [1/4] Checking current branch...
cd ..
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i
cd scripts

echo Current branch: !current_branch!
echo Target branch: !branch!
echo.

if /i not "!current_branch!"=="!branch!" (
    echo [2/4] Switching to branch: !branch!...
    cd ..
    git checkout !branch!
    if errorlevel 1 (
        echo Error: Failed to checkout branch !branch!
        cd scripts
        pause
        exit /b 1
    )
    cd scripts
) else (
    echo [2/4] Already on branch: !branch!
)

echo.
echo [3/4] Deleting oldest !count! commits using git reset...
cd ..
git reset --hard HEAD~!count!
if errorlevel 1 (
    echo Error: Failed to delete commits
    cd scripts
    pause
    exit /b 1
)
cd scripts

echo.
echo [4/4] Force pushing to remote...
cd ..
git push origin !branch! --force
if errorlevel 1 (
    echo Error: Failed to force push
    cd scripts
    pause
    exit /b 1
)
cd scripts

echo.
echo ========================================
echo   DELETE OLDEST COMMITS SUCCESS!
echo ========================================
echo.
pause
exit /b 0
