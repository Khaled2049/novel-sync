"""ADK tools for story generation, chapter creation, and brainstorming."""
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Handle imports for both direct execution and module import
try:
    from .context_builder import StoryContextBuilder
    from .llm_provider import get_llm_provider, LLMProvider
except ImportError:
    # Add parent directory to path for direct execution
    current_dir = Path(__file__).parent
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


class BrainstormingTool:
    """Tool for brainstorming ideas."""

    def __init__(self, project_id: str, location: str = "us-central1"):
        """Initialize the brainstorming tool."""
        self.project_id = project_id
        self.location = location
        self.llm_provider: LLMProvider = get_llm_provider(project_id, location)
        self.context_builder = StoryContextBuilder(project_id)

    async def execute(
        self,
        story_id: str,
        idea_type: str,
        prompt: Optional[str] = None,
        count: int = 5,
    ) -> Dict[str, Any]:
        """
        Generate brainstorming ideas.

        Args:
            story_id: Firestore story document ID
            idea_type: Type of idea (characters/plots/places/themes)
            prompt: Optional specific prompt or requirement
            count: Number of ideas to generate (default 5)

        Returns:
            Dictionary with list of generated ideas
        """
        # Build context from Firestore
        context = self.context_builder.build_story_context(story_id)
        formatted_context = self.context_builder.format_context_for_prompt(context)

        story = context["story"]
        genre = story.get("genre", "general fiction")
        tone = story.get("tone", "neutral")

        # Build type-specific prompt
        type_prompts = {
            "characters": f"""Generate {count} unique character ideas for this {genre} story with a {tone} tone.

{formatted_context}

For each character, provide:
- Name
- Role in the story
- Key personality traits
- Backstory (2-3 sentences)
- Motivations and goals
- How they fit into the existing story context""",

            "plots": f"""Generate {count} plot ideas or plot developments for this {genre} story with a {tone} tone.

{formatted_context}

For each plot idea, provide:
- Plot title/name
- Description of the plot element
- How it connects to existing story elements
- Potential conflicts or tensions
- How it advances the story""",

            "places": f"""Generate {count} location or setting ideas for this {genre} story with a {tone} tone.

{formatted_context}

For each place, provide:
- Name of the location
- Description and atmosphere
- Key features or landmarks
- How it fits into the story
- Potential events that could happen there""",

            "themes": f"""Generate {count} theme ideas for this {genre} story with a {tone} tone.

{formatted_context}

For each theme, provide:
- Theme name
- Description
- How it relates to the existing story elements
- Ways to explore this theme in the narrative""",
        }

        base_prompt = type_prompts.get(idea_type, type_prompts["characters"])
        if prompt:
            base_prompt += f"\n\nAdditional requirements: {prompt}"

        # Generate using LLM provider
        generated_text = self.llm_provider.generate_content(base_prompt)

        # Parse ideas (simple extraction - could be improved)
        ideas = self._parse_ideas(generated_text, count)

        return {
            "storyId": story_id,
            "type": idea_type,
            "ideas": ideas,
            "rawResponse": generated_text,
        }

    def _parse_ideas(self, text: str, expected_count: int) -> List[Dict[str, Any]]:
        """Parse ideas from generated text."""
        # Simple parsing - split by numbered items or dashes
        lines = text.split("\n")
        ideas = []
        current_idea = {}

        for line in lines:
            line = line.strip()
            if not line:
                if current_idea:
                    ideas.append(current_idea)
                    current_idea = {}
                continue

            # Check if it's a new idea (starts with number or dash)
            if line[0].isdigit() or line.startswith("-"):
                if current_idea:
                    ideas.append(current_idea)
                current_idea = {"text": line}
            else:
                if current_idea:
                    current_idea["text"] += " " + line
                else:
                    current_idea = {"text": line}

        if current_idea:
            ideas.append(current_idea)

        # Limit to expected count
        return ideas[:expected_count]


class CharacterBrainstormingTool:
    """Specialized tool for character brainstorming."""

    def __init__(self, project_id: str, location: str = "us-central1"):
        """Initialize the character brainstorming tool."""
        self.project_id = project_id
        self.location = location
        self.llm_provider: LLMProvider = get_llm_provider(project_id, location)
        self.context_builder = StoryContextBuilder(project_id)

    async def execute(
        self,
        story_id: str,
        role: Optional[str] = None,
        archetype: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate character ideas.

        Args:
            story_id: Firestore story document ID
            role: Optional character role (protagonist, antagonist, etc.)
            archetype: Optional character archetype

        Returns:
            Dictionary with character profiles
        """
        context = self.context_builder.build_story_context(story_id)
        formatted_context = self.context_builder.format_context_for_prompt(context)

        story = context["story"]
        genre = story.get("genre", "general fiction")
        tone = story.get("tone", "neutral")

        role_text = f"Role: {role}" if role else "Any role"
        archetype_text = f"Archetype: {archetype}" if archetype else "Any archetype"

        prompt = f"""Generate a detailed character profile for this {genre} story with a {tone} tone.

{formatted_context}

Character Requirements:
- {role_text}
- {archetype_text}

Provide a complete character profile with:
- Name
- Age and physical description
- Personality traits (3-5 key traits)
- Backstory (detailed, 2-3 paragraphs)
- Motivations and goals
- Fears and weaknesses
- Relationships with other characters
- How they fit into the story's plot
- Character arc potential

Make the character compelling and well-developed."""

        generated_text = self.llm_provider.generate_content(prompt)

        return {
            "storyId": story_id,
            "character": {
                "role": role,
                "archetype": archetype,
                "profile": generated_text,
            },
        }


class PlotBrainstormingTool:
    """Specialized tool for plot brainstorming."""

    def __init__(self, project_id: str, location: str = "us-central1"):
        """Initialize the plot brainstorming tool."""
        self.project_id = project_id
        self.location = location
        self.llm_provider: LLMProvider = get_llm_provider(project_id, location)
        self.context_builder = StoryContextBuilder(project_id)

    async def execute(
        self,
        story_id: str,
        plot_type: str = "conflict",
    ) -> Dict[str, Any]:
        """
        Generate plot ideas.

        Args:
            story_id: Firestore story document ID
            plot_type: Type of plot element (conflict/twist/subplot/development)

        Returns:
            Dictionary with plot suggestions
        """
        context = self.context_builder.build_story_context(story_id)
        formatted_context = self.context_builder.format_context_for_prompt(context)

        story = context["story"]
        genre = story.get("genre", "general fiction")
        tone = story.get("tone", "neutral")

        type_descriptions = {
            "conflict": "a major conflict or obstacle",
            "twist": "a plot twist or unexpected development",
            "subplot": "a subplot that complements the main story",
            "development": "a plot development that advances the story",
        }

        plot_desc = type_descriptions.get(plot_type, "a plot element")

        prompt = f"""Generate {plot_desc} for this {genre} story with a {tone} tone.

{formatted_context}

Provide:
- Title/name for this plot element
- Detailed description
- How it connects to existing story elements
- Characters involved
- Potential consequences or outcomes
- How it advances the overall narrative
- Tension or conflict it creates

Make it compelling and well-integrated with the existing story."""

        generated_text = self.llm_provider.generate_content(prompt)

        return {
            "storyId": story_id,
            "plotType": plot_type,
            "plot": generated_text,
        }

