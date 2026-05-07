#!/usr/bin/env bash

# AI-Based Cognitive Monitoring - macOS Start Script

# Start MongoDB if it's not already running
echo "Ensuring MongoDB is running..."
if ! brew services list | grep -q 'mongodb-community.*started'; then
    echo "Starting MongoDB via Homebrew..."
    brew services start mongodb-community
else
    echo "MongoDB is already running."
fi

# Set up Python virtual environment if it doesn't exist
echo "Setting up Python microservice..."
cd backend
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# Start the Python microservice in the background
echo "Starting Plagiarism Microservice (Port 8000)..."
python plagiarism_service.py &
PYTHON_PID=$!

# Start the Node.js backend
echo "Starting Node.js Backend (Port 5001)..."
npm start &
NODE_PID=$!

# Start the React frontend
echo "Starting React Frontend (Port 3000)..."
cd ../Frontend
npm start &
REACT_PID=$!

echo "All services started. Press Ctrl+C to stop all services."

# Wait and catch Ctrl+C to kill background processes
trap "echo 'Stopping all services...'; kill $PYTHON_PID $NODE_PID $REACT_PID; exit" INT TERM
wait
