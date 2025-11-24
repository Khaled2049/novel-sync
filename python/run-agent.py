#!/usr/bin/env python3
"""Launcher script for the story agent server."""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Load environment variables from .env file
# Try multiple locations: project root, agents folder, and agents/storyAgent folder
env_locations = [
    project_root / ".env",  # project root .env
    project_root / "agents" / ".env",  # agents/.env
    project_root / "agents" / "storyAgent" / ".env",  # agents/storyAgent/.env
]

for env_path in env_locations:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        print(f"Loaded environment variables from {env_path}")
        break

# Set environment variables if not already set
if not os.getenv("FIRESTORE_EMULATOR_HOST"):
    # Check if emulator is likely running
    emulator_host = os.getenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
    os.environ["FIRESTORE_EMULATOR_HOST"] = emulator_host

# Import and run the server
if __name__ == "__main__":
    from agents.storyAgent.server import app
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

