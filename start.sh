#!/bin/bash

echo "========================================"
echo "Gamified Task Manager - Starting..."
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install dependencies!"
        echo "Please make sure Node.js is installed."
        exit 1
    fi
    echo ""
fi

echo "Starting development server..."
echo ""
echo "The app will open at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

