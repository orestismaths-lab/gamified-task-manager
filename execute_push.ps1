$ErrorActionPreference = "Continue"
$output = @()

function Write-OutputAndLog {
    param($message)
    Write-Host $message
    $script:output += $message
}

Write-OutputAndLog "========================================"
Write-OutputAndLog "GitHub Push Script"
Write-OutputAndLog "========================================"
Write-OutputAndLog ""

Set-Location "C:\Users\ofragkog\OneDrive - OTE\Domain Leader\Presentations\Cursor\Customer Systems\presentation\task_manager"

# Step 1: Initialize git
Write-OutputAndLog "[1/6] Initializing git..."
if (-not (Test-Path .git)) {
    $result = git init 2>&1 | Out-String
    Write-OutputAndLog $result
} else {
    Write-OutputAndLog "Git already initialized"
}

# Step 2: Add files
Write-OutputAndLog "[2/6] Adding files..."
$result = git add . 2>&1 | Out-String
Write-OutputAndLog $result

# Step 3: Commit
Write-OutputAndLog "[3/6] Committing..."
$result = git commit -m "Initial commit: Gamified Task Manager - Full featured task management app with gamification, dark mode, Kanban board, and 12+ advanced features" 2>&1 | Out-String
Write-OutputAndLog $result

# Step 4: Set remote
Write-OutputAndLog "[4/6] Setting remote..."
git remote remove origin 2>$null
$result = git remote add origin https://github.com/orestismaths-lab/gamified-task-manager.git 2>&1 | Out-String
Write-OutputAndLog $result
$result = git remote -v 2>&1 | Out-String
Write-OutputAndLog $result

# Step 5: Set branch
Write-OutputAndLog "[5/6] Setting branch to main..."
$result = git branch -M main 2>&1 | Out-String
Write-OutputAndLog $result

# Step 6: Push
Write-OutputAndLog "[6/6] Pushing to GitHub..."
Write-OutputAndLog "NOTE: This may require authentication"
Write-OutputAndLog ""
$result = git push -u origin main 2>&1 | Out-String
Write-OutputAndLog $result

Write-OutputAndLog ""
Write-OutputAndLog "========================================"
if ($LASTEXITCODE -eq 0) {
    Write-OutputAndLog "SUCCESS! Code pushed to GitHub!"
    Write-OutputAndLog "Repository: https://github.com/orestismaths-lab/gamified-task-manager"
} else {
    Write-OutputAndLog "Push completed (check output above for any errors)"
}
Write-OutputAndLog "========================================"

# Save output to file
$output | Out-File -FilePath "push_output.txt" -Encoding UTF8
Write-Host "`nOutput saved to: push_output.txt" -ForegroundColor Cyan

