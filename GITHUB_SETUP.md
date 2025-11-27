# GitHub Setup Instructions

## Quick Setup

1. **Create the repository on GitHub:**
   - Go to: https://github.com/new
   - Repository name: `gamified-task-manager`
   - Description: "Gamified Task Manager - Full featured task management app"
   - Choose Public or Private
   - **DO NOT** check "Initialize with README"
   - Click "Create repository"

2. **Run the push script:**
   ```bash
   push_to_github.bat
   ```

3. **If authentication is required:**
   - GitHub no longer accepts passwords for git operations
   - You'll need a **Personal Access Token (PAT)**
   - Create one at: https://github.com/settings/tokens
   - Select scopes: `repo` (full control of private repositories)
   - Use the token as your password when prompted

## Manual Setup (Alternative)

If the script doesn't work, run these commands manually:

```bash
cd task_manager

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Gamified Task Manager"

# Add remote
git remote add origin https://github.com/orestismaths/gamified-task-manager.git

# Set branch to main
git branch -M main

# Push
git push -u origin main
```

## Repository URL

After successful push:
- **Repository:** https://github.com/orestismaths/gamified-task-manager
- **Clone URL:** `https://github.com/orestismaths/gamified-task-manager.git`

## Troubleshooting

### "Repository not found"
- Make sure you created the repository on GitHub first
- Check the repository name matches exactly: `gamified-task-manager`

### "Authentication failed"
- Use a Personal Access Token instead of password
- Create token at: https://github.com/settings/tokens

### "Permission denied"
- Make sure you have write access to the repository
- Check that the repository name is correct

