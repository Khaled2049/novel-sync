@echo off
REM Start script for local development on Windows

echo Starting local development environment...

REM Start Firebase emulators in a new window
start "Firebase Emulators" cmd /k "cd functions && npm run emulator"

REM Wait for emulators to start
timeout /t 5 /nobreak >nul

REM Start Python agent in a new window
start "Python Agent" cmd /k "set FIRESTORE_EMULATOR_HOST=localhost:8080 && python run-agent.py"

echo.
echo Local development environment is starting!
echo Firebase Emulator UI: http://localhost:4000
echo Python Agent: http://localhost:8000
echo.
echo Close the windows to stop the services

