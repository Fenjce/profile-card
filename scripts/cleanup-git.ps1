$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "   GIT HISTORY CLEANUP"
Write-Host "========================================"
Write-Host ""
Write-Host "WARNING: This will:"
Write-Host "- Delete ALL branches except main"
Write-Host "- Keep only FIRST and LATEST commits on main"
Write-Host "- Permanently delete all commits in between"
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled."
    pause
    exit 0
}

Write-Host ""
Write-Host "Step 1: Deleting all branches except main..."

# Get all branches and delete them except main
$branches = git branch -a | Where-Object { $_ -notmatch "main" -and $_ -notmatch "HEAD" }
foreach ($branch in $branches) {
    $branchName = $branch.Trim().Replace("* ", "").Replace("remotes/origin/", "")
    if ($branchName -ne "main") {
        Write-Host "Deleting branch: $branchName"
        git branch -D $branchName 2>$null
        git push origin --delete $branchName 2>$null
    }
}

Write-Host ""
Write-Host "Step 2: Cleaning up main branch history..."

# Get total commit count on main
$totalCommits = git rev-list --count main
Write-Host "Total commits on main: $totalCommits"

if ($totalCommits -gt 2) {
    # Get the FIRST (oldest) commit
    $allCommits = git log --oneline --reverse main
    $firstCommit = $allCommits | Select-Object -First 1
    $firstHash = $firstCommit.Split(" ")[0]
    
    # Get the LATEST (newest) commit
    $latestCommit = git log --oneline main | Select-Object -First 1
    $latestHash = $latestCommit.Split(" ")[0]
    
    Write-Host "First commit (oldest): $firstHash"
    Write-Host "Latest commit (newest): $latestHash"
    Write-Host ""
    Write-Host "Keeping these 2 commits, deleting all in between..."
    
    # Create a new commit that combines first and latest
    git checkout $firstHash
    git reset --soft $latestHash
    git commit --amend -m "Cleanup: Kept first and latest commits"
    
    # Force push to remote
    git push --force origin HEAD:main
    
    # Go back to main
    git checkout main
    
    # Clean up reflog and garbage collect
    Write-Host "Cleaning up git database..."
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    Write-Host ""
    Write-Host "Cleanup complete - kept first and latest commits on main"
} else {
    Write-Host "Total commits on main: $totalCommits - Already at or below 2 commits"
}

Write-Host ""
Write-Host "========================================"
Write-Host "   DONE!"
Write-Host "========================================"
Write-Host ""
pause
