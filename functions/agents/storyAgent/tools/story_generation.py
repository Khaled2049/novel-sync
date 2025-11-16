"""Tool for generating complete stories."""
import sys
from pathlib import Path
from typing import Dict, Any, Optional

# Handle imports for both direct execution and module import
try:
    from ..context_builder import StoryContextBuilder
    from ..llm_provider import get_llm_provider, LLMProvider
except ImportError:
    # Add parent directory to path for direct execution
    current_dir = Path(__file__).parent.parent
    parent_dir = current_dir.parent.parent
    if str(parent_dir) not in sys.path:
        sys.path.insert(0, str(parent_dir))
    from agents.storyAgent.context_builder import StoryContextBuilder
    from agents.storyAgent.llm_provider import get_llm_provider, LLMProvider


class StoryGenerationTool:
    """Tool for generating complete stories."""

    def __init__(self, project_id: str, location: str = "us-central1"):
        """Initialize the story generation tool."""
        self.project_id = project_id
        self.location = location
        self.llm_provider: LLMProvider = get_llm_provider(project_id, location)
        self.context_builder = StoryContextBuilder(project_id)

    async def execute(
        self, story_id: str, genre: Optional[str] = None, tone: Optional[str] = None, length: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete story.

        Args:
            story_id: Firestore story document ID
            genre: Story genre (optional, uses story data if not provided)
            tone: Story tone (optional, uses story data if not provided)
            length: Story length (short/medium/long)

        Returns:
            Dictionary with generated story content
        """
        # Build context from Firestore
        context = self.context_builder.build_story_context(story_id)
        formatted_context = self.context_builder.format_context_for_prompt(context)

        story = context["story"]
        genre = genre or story.get("genre", "general fiction")
        tone = tone or story.get("tone", "neutral")
        length = length or "medium"

        # Build prompt
        prompt = f"""You are an expert novelist. Generate a complete {genre} story with a {tone} tone.

{formatted_context}

Generate a complete story that:
1. Incorporates all the characters, places, and plot elements provided
2. Maintains consistency with the story's genre and tone
3. Is approximately {length} length
4. Has a clear beginning, middle, and end
5. Includes character development and plot progression

Return the story in the following format:
- Title: [Story Title]
- Story: [Full story text]
- Summary: [Brief summary]
"""

        # Generate using LLM provider
        generated_text = self.llm_provider.generate_content(prompt)

        # Parse response (simple extraction)
        return {
            "storyId": story_id,
            "content": generated_text,
            "metadata": {
                "genre": genre,
                "tone": tone,
                "length": length,
            },
        }

