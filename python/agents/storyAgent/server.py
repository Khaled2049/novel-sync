"""HTTP server for the story agent service."""
import os
import sys
import logging
from pathlib import Path
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Configure logging for Cloud Run
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=Path(__file__).parent / ".env")


# Handle both direct execution and module import
# Add parent directory to path for direct execution
current_dir = Path(__file__).parent
parent_dir = current_dir.parent.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

try:
    # Try relative import first (when used as module)
    from .agent import StoryAgent
except ImportError:
    # Fall back to absolute import (when run directly)
    from agents.storyAgent.agent import StoryAgent

app = FastAPI(title="Story Agent Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("VERTEX_AI_LOCATION", "us-central1")  # Not used (legacy parameter, kept for compatibility)

if not PROJECT_ID:
    raise ValueError("GOOGLE_CLOUD_PROJECT environment variable must be set")

agent = StoryAgent(project_id=PROJECT_ID, location=LOCATION)


class AgentRequest(BaseModel):
    """Request model for agent execution."""
    action: str
    parameters: Dict[str, Any]


class AgentResponse(BaseModel):
    """Response model for agent execution."""
    success: bool
    data: Any = None
    error: str = None


@app.post("/agent/execute", response_model=AgentResponse)
async def execute_agent(request: AgentRequest) -> AgentResponse:
    """
    Execute an agent action.

    Actions:
    - generateStory: Generate a complete story
    - generateChapter: Generate a chapter
    - brainstormIdeas: Generate brainstorming ideas
    - brainstormCharacter: Generate character ideas
    - brainstormPlot: Generate plot ideas
    - generateNextLines: Generate next line suggestions
    """
    try:
        logger.info(f"Received agent request: action={request.action}, parameters_keys={list(request.parameters.keys())}")
        print(f"[SERVER] Received agent request: action={request.action}, parameters_keys={list(request.parameters.keys())}")
        
        result = await agent.execute_agent(request.action, request.parameters)
        
        logger.info(f"Agent execution completed successfully for {request.action}")
        print(f"[SERVER] Agent execution completed successfully for {request.action}")
        return AgentResponse(success=True, data=result)
    except Exception as e:
        logger.error(f"Error executing agent action {request.action}: {str(e)}", exc_info=True)
        print(f"[SERVER ERROR] Error executing agent action {request.action}: {str(e)}")
        import traceback
        print(f"[SERVER ERROR] Traceback: {traceback.format_exc()}")
        return AgentResponse(
            success=False,
            error=str(e)
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "project_id": PROJECT_ID}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))  # Cloud Run sets PORT=8080, default to 8000 for local dev
    uvicorn.run(app, host="0.0.0.0", port=port)

