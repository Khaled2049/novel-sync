"""Tool for generating individual chapters with continuity."""
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

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


class ChapterGenerationTool:
    """Tool for generating individual chapters with continuity."""

    def __init__(self, project_id: str, location: str = "us-central1"):
        """Initialize the chapter generation tool."""
        self.project_id = project_id
        self.location = location
        self.llm_provider: LLMProvider = get_llm_provider(project_id, location)
        self.context_builder = StoryContextBuilder(project_id)

    async def execute(
        self,
        story_id: str,
        chapter_number: int,
        previous_chapters: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a chapter with continuity.

        Args:
            story_id: Firestore story document ID
            chapter_number: The chapter number to generate
            previous_chapters: Optional list of previous chapter contents

        Returns:
            Dictionary with generated chapter content
        """
        # Build context from Firestore
        context = self.context_builder.build_story_context(story_id)
        formatted_context = self.context_builder.format_context_for_prompt(context)

        # Get existing chapters for continuity
        existing_chapters = context.get("chapters", [])
        if previous_chapters is None:
            previous_chapters = existing_chapters[:chapter_number - 1]

        # Build continuity summary
        continuity_text = ""
        if previous_chapters:
            continuity_text = "\n=== PREVIOUS CHAPTERS SUMMARY ===\n"
            for i, chapter in enumerate(previous_chapters[-3:], 1):  # Last 3 chapters
                chapter_num = chapter.get("chapterNumber", i)
                title = chapter.get("title", "Untitled")
                content = chapter.get("content", "")[:500]  # First 500 chars
                continuity_text += f"Chapter {chapter_num}: {title}\n{content}...\n\n"

        # Build prompt
        prompt = f"""You are an expert novelist. Generate Chapter {chapter_number} for this story.

{formatted_context}

{continuity_text}

Generate Chapter {chapter_number} that:
1. Maintains continuity with previous chapters
2. Advances the plot naturally
3. Develops characters appropriately
4. Incorporates the story's established elements
5. Has a compelling beginning and ending that encourages reading the next chapter

Return the chapter in the following format:
- Title: [Chapter Title]
- Chapter Number: {chapter_number}
- Content: [Full chapter text]
"""

        # Generate using LLM provider
        generated_text = self.llm_provider.generate_content(prompt)

        return {
            "storyId": story_id,
            "chapterNumber": chapter_number,
            "content": generated_text,
        }

