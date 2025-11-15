# Story Agent Service

Python-based AI agent service for generating stories, chapters, and brainstorming ideas using Google's Gemini model via Vertex AI.

## Setup

### Prerequisites

- Python 3.9+
- Google Cloud Project with Vertex AI API enabled
- Firestore database access
- Service account with appropriate permissions

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export VERTEX_AI_LOCATION="us-central1"  # Optional, defaults to us-central1
```

### Running the Service

#### Local Development

```bash
python -m agents.storyAgent.server
```

The service will start on `http://localhost:8000`

#### Production (Cloud Run)

1. Build and deploy:
```bash
gcloud run deploy story-agent \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id
```

## API Endpoints

### POST /agent/execute

Execute an agent action.

**Request:**
```json
{
  "action": "generateStory|generateChapter|brainstormIdeas|brainstormCharacter|brainstormPlot",
  "parameters": {
    "storyId": "story-id",
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### GET /health

Health check endpoint.

## Agent Actions

### generateStory
Generates a complete story based on Firestore context.

**Parameters:**
- `storyId` (required): Firestore story document ID
- `genre` (optional): Story genre
- `tone` (optional): Story tone
- `length` (optional): Story length (short/medium/long)

### generateChapter
Generates a single chapter with continuity.

**Parameters:**
- `storyId` (required): Firestore story document ID
- `chapterNumber` (required): Chapter number to generate
- `previousChapters` (optional): List of previous chapters for context

### brainstormIdeas
Generates brainstorming ideas.

**Parameters:**
- `storyId` (required): Firestore story document ID
- `type` (required): Type of idea (characters/plots/places/themes)
- `prompt` (optional): Additional requirements
- `count` (optional): Number of ideas (default: 5)

### brainstormCharacter
Generates detailed character ideas.

**Parameters:**
- `storyId` (required): Firestore story document ID
- `role` (optional): Character role
- `archetype` (optional): Character archetype

### brainstormPlot
Generates plot ideas.

**Parameters:**
- `storyId` (required): Firestore story document ID
- `plotType` (optional): Type of plot (conflict/twist/subplot/development)

## Architecture

- `agent.py`: Main agent class that orchestrates tools
- `tools.py`: Individual tools for story generation, chapter creation, and brainstorming
- `context_builder.py`: Fetches and formats story context from Firestore
- `server.py`: FastAPI HTTP server for the agent service

