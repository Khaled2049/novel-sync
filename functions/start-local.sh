#!/bin/bash
# Start script for local development

echo "Starting local development environment..."

# Check if Firebase emulators are already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "Firestore emulator appears to be running on port 8080"
else
    echo "Starting Firebase emulators..."
    cd functions
    npm run emulator &
    FIREBASE_PID=$!
    echo "Firebase emulators started (PID: $FIREBASE_PID)"
    sleep 5  # Wait for emulators to start
fi

# Check if Python agent is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Python agent appears to be running on port 8000"
else
    echo "Starting Python agent..."
    
    # Set environment variables for emulator
    export FIRESTORE_EMULATOR_HOST=localhost:8080
    
    # Start Python agent from project root
    python run-agent.py &
    AGENT_PID=$!
    echo "Python agent started (PID: $AGENT_PID)"
fi

echo ""
echo "Local development environment is running!"
echo "Firebase Emulator UI: http://localhost:4000"
echo "Python Agent: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait

