#!/bin/bash

# English Learning Town - Game Startup Script

echo "🎮 Starting English Learning Town..."

# Start Go backend in background
echo "📡 Starting Go backend server..."
cd backend-go
go run cmd/main.go &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend server is running on port 3000"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Navigate to Godot project
cd ../godot-client

# Try to find Godot executable
GODOT_PATH=""
if [ -f "/Applications/Godot.app/Contents/MacOS/Godot" ]; then
    GODOT_PATH="/Applications/Godot.app/Contents/MacOS/Godot"
elif command -v godot >/dev/null 2>&1; then
    GODOT_PATH="godot"
else
    echo "❌ Godot not found. Please install Godot 4.2+ or add it to PATH"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Godot editor
echo "🎯 Starting Godot editor..."
$GODOT_PATH --path . --editor

# Cleanup function
cleanup() {
    echo "🛑 Shutting down backend server..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for user to close Godot
wait

cleanup