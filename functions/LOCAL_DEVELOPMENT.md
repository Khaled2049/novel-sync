# Local Development Guide

This guide explains how to run the entire application locally using Firebase emulators.

## Prerequisites

1. **Node.js 22+** and npm
2. **Python 3.9+** and pip
3. **Firebase CLI**: `npm install -g firebase-tools`
4. **Google Cloud SDK** (optional, for Firestore authentication if not using emulator)

## Setup Steps

### 1. Install Dependencies

#### Firebase Functions
```bash
cd functions/functions
npm install
```

#### Python Agent
```bash
cd agents/storyAgent
pip install -r requirements.txt
```

### 2. Configure Environment Variables

#### For Python Agent

Create a `.env` file in `agents/storyAgent/`:
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_AI_STUDIO_API_KEY=your-api-key  # Required for AI generation
GOOGLE_AI_STUDIO_MODEL=gemini-2.0-flash-exp  # Optional, defaults to gemini-2.0-flash-exp
FIRESTORE_EMULATOR_HOST=localhost:8080  # For local Firestore emulator
```

Or set environment variables:
```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_AI_STUDIO_API_KEY=your-api-key
export GOOGLE_AI_STUDIO_MODEL=gemini-2.0-flash-exp
export FIRESTORE_EMULATOR_HOST=localhost:8080
```

**Note**: Vertex AI is not required. The service uses Google AI Studio API directly.

#### For Firebase Functions

The agent service URL is automatically set to `http://localhost:8000` when running locally (see `functions/src/agentService.ts`).


## Running Locally

### Option 1: Run Everything Manually (Recommended for Development)

#### Terminal 1: Start Firebase Emulators
```bash
cd functions/functions
npm run emulator
```

This starts:
- Firestore emulator on `http://localhost:8080`
- Functions emulator on `http://localhost:5001`
- Auth emulator on `http://localhost:9099`
- Emulator UI on `http://localhost:4000`

#### Terminal 2: Start Python Agent Service
```bash
cd agents/storyAgent
python -m agents.storyAgent.server
```

The agent service will start on `http://localhost:8000`

### Option 2: Use the Startup Script

Create a script to start everything:

**Windows (start-local.bat):**
```batch
@echo off
start "Firebase Emulators" cmd /k "cd functions/functions && npm run emulator"
timeout /t 5
start "Python Agent" cmd /k "cd agents/storyAgent && python -m agents.storyAgent.server"
```

**Linux/Mac (start-local.sh):**
```bash
#!/bin/bash
# Start Firebase emulators in background
cd functions/functions && npm run emulator &
sleep 5
# Start Python agent
cd agents/storyAgent && python -m agents.storyAgent.server
```

## Testing the Setup

### 1. Check Firebase Emulators

Visit `http://localhost:4000` to see the Emulator UI.

### 2. Check Python Agent

```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "healthy", "project_id": "your-project-id"}
```

### 3. Test Firebase Functions

The functions will be available at:
- `http://localhost:5001/your-project-id/us-central1/generateStory`
- `http://localhost:5001/your-project-id/us-central1/generateChapter`
- etc.

## Connecting to Firestore Emulator

### Firebase Functions

Firebase Functions automatically connect to the emulator when `FUNCTIONS_EMULATOR` environment variable is set (which happens automatically when running `firebase emulators:start`).

### Python Agent

The Python agent needs to be configured to use the emulator. Set the environment variable:

```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
```

Or in your `.env` file:
```
FIRESTORE_EMULATOR_HOST=localhost:8080
```

The `context_builder.py` will automatically use the emulator when this variable is set.

## Important Notes

### Firestore Emulator Data

- Data in the Firestore emulator is **ephemeral** - it's cleared when you stop the emulator
- To persist data, use the `--export-on-exit` flag:
  ```bash
  firebase emulators:start --export-on-exit=./emulator-data
  ```
- To import existing data:
  ```bash
  firebase emulators:start --import=./emulator-data
  ```

### Authentication

For local testing, you can:
1. Use the Auth emulator to create test users
2. Or use Firebase Admin SDK with a service account (for testing without auth)

### AI Model Configuration

The Python agent supports multiple AI backends for local testing:

#### Option 1: Google AI Studio API - Production Mode (Default)

**Requires:** Google AI Studio API key
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Set `GOOGLE_AI_STUDIO_API_KEY` environment variable
- Uses `gemini-2.0-flash-exp` by default (free tier friendly)

**Note:** This uses the same API as production. Free tier available for `gemini-2.0-flash-exp` model.

#### Option 2: Ollama - Free Local Testing

Use a local LLM via Ollama to avoid costs during development.

**Setup:**
1. Install Ollama from https://ollama.ai
2. Pull a model (e.g., `ollama pull llama3.2` or `ollama pull mistral`)
3. Start Ollama (usually runs automatically after installation)
4. Set environment variables:
   ```bash
   export USE_OLLAMA=true
   export OLLAMA_BASE_URL=http://localhost:11434  # Default
   export OLLAMA_MODEL=llama3.2  # Or your preferred model
   ```

Or in your `.env` file:
```bash
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Available Models:**
- `llama3.2` - Fast and efficient (recommended for testing)
- `mistral` - Good balance of speed and quality
- `phi3` - Smaller, faster model
- `gemma2` - Google's open model
- See https://ollama.ai/library for more options

#### Option 3: Mock Mode - No AI Calls

For testing API flow without any AI model:

Set environment variable:
```bash
export USE_MOCK=true
```

Or in your `.env` file:
```bash
USE_MOCK=true
```

This returns predefined mock responses and requires no setup.

## Troubleshooting

### Python Agent Can't Connect to Firestore Emulator

1. Make sure `FIRESTORE_EMULATOR_HOST=localhost:8080` is set
2. Verify the Firestore emulator is running on port 8080
3. Check that the Python Firestore client is using the emulator:
   ```python
   from google.cloud import firestore
   import os
   
   # Should automatically use emulator if FIRESTORE_EMULATOR_HOST is set
   db = firestore.Client()
   ```

### Firebase Functions Can't Reach Python Agent

1. Verify the Python agent is running on `http://localhost:8000`
2. Check `AGENT_SERVICE_URL` in `functions/src/agentService.ts` (defaults to `http://localhost:8000`)
3. Make sure there are no firewall issues blocking localhost connections

### Authentication Errors

1. For Firebase Auth: Use the emulator UI to create test users
2. For Google AI Studio: Make sure `GOOGLE_AI_STUDIO_API_KEY` is set correctly
3. For Firestore: The emulator doesn't require authentication

### Ollama Connection Errors

If using Ollama and getting connection errors:
1. Verify Ollama is running: `ollama list` or visit `http://localhost:11434`
2. Check that the model is installed: `ollama pull <model-name>`
3. Verify `OLLAMA_BASE_URL` matches your Ollama instance
4. Test Ollama directly: `curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"test"}'`

### Port Conflicts

If ports are already in use:
- Firestore: Change port in `firebase.json` (default: 8080)
- Functions: Change port in `firebase.json` (default: 5001)
- Python Agent: Change port in `server.py` (default: 8000)

## Development Workflow

1. **Start emulators**: `cd functions/functions && npm run emulator`
2. **Start agent**: `cd agents/storyAgent && python -m agents.storyAgent.server`
3. **Make changes** to TypeScript or Python code
4. **Rebuild TypeScript**: `cd functions/functions && npm run build` (or use `npm run build:watch`)
5. **Restart agent** if Python code changes
6. **Test** using the emulator UI or API calls

## Testing from Postman

### Quick Setup for Cost-Free Testing

1. **Use Mock Mode** (fastest, no setup):
   ```bash
   export USE_MOCK=true
   cd agents/storyAgent
   python -m agents.storyAgent.server
   ```

2. **Or Use Ollama** (real AI, but local and free):
   - Install Ollama and pull a model
   - Set `USE_OLLAMA=true` in your environment
   - Start the agent service

### Example Postman Request

**Endpoint:**
```
POST http://localhost:5001/your-project-id/us-central1/brainstormIdeas
```

**Headers:**
```
Authorization: Bearer <your-firebase-id-token>
Content-Type: application/json
```

**Body:**
```json
{
  "storyId": "your-test-story-id",
  "type": "characters",
  "prompt": "Test brainstorming",
  "count": 3
}
```

**Getting a Firebase Auth Token:**
1. Use the Auth emulator UI at `http://localhost:4000` to create a test user
2. Or use the `/authenticate` endpoint:
   ```
   POST http://localhost:5001/your-project-id/us-central1/authenticate
   {
     "email": "test@example.com",
     "password": "testpassword123"
   }
   ```

## Next Steps

- See `functions/AGENT_API.md` for API endpoint documentation
- See `agents/storyAgent/README.md` for agent service documentation

