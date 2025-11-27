# Quick Start Guide 🚀

## Windows Users

### Option 1: Automatic Start (Recommended)
1. Double-click `start.bat`
2. The script will automatically:
   - Install dependencies if needed
   - Start the development server
3. Open your browser to [http://localhost:3000](http://localhost:3000)

### Option 2: Manual Installation
1. Double-click `install.bat` to install dependencies
2. Then double-click `start.bat` to start the app

### Option 3: Command Line
```bash
# Install dependencies (first time only)
npm install

# Start the app
npm run dev
```

## Mac/Linux Users

### Option 1: Using the Script
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual
```bash
# Install dependencies (first time only)
npm install

# Start the app
npm run dev
```

## Troubleshooting

### "npm is not recognized"
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)
- Make sure to check "Add to PATH" during installation
- Restart your terminal/command prompt after installation

### "Port 3000 already in use"
- **Solution**: Close other applications using port 3000, or:
  - Edit `package.json` and change the dev script to: `"dev": "next dev -p 3001"`

### "Module not found" errors
- **Solution**: Delete `node_modules` folder and run `npm install` again

## First Time Setup

1. Make sure Node.js 18+ is installed
2. Run `install.bat` (Windows) or `npm install` (Mac/Linux)
3. Run `start.bat` (Windows) or `npm run dev` (Mac/Linux)
4. Open [http://localhost:3000](http://localhost:3000)

## What to Expect

- The app will start on port 3000
- You'll see a colorful, gamified task manager interface
- Create your first task and watch the XP system in action!
- Complete tasks to see confetti celebrations! 🎉

