"""LLM provider abstraction for supporting multiple AI backends."""
import os
import json
import re
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
import httpx


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate_content(self, prompt: str) -> str:
        """
        Generate content from a prompt.

        Args:
            prompt: The input prompt

        Returns:
            Generated text content
        """
        pass

    @abstractmethod
    async def generate_structured_content(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Dict[str, Any],
    ) -> List[str]:
        """
        Generate structured content with a JSON schema constraint.

        Args:
            system_prompt: System-level instructions for the AI
            user_prompt: User-level prompt with the actual task
            response_schema: JSON schema defining the expected response structure

        Returns:
            List of strings (parsed from the structured JSON response)
        """
        pass


class VertexAIProvider(LLMProvider):
    """Vertex AI (Gemini) provider."""

    def __init__(self, project_id: str, location: str = "us-central1", model_name: str = "gemini-1.5-pro"):
        """Initialize Vertex AI provider."""
        from google.cloud import aiplatform
        from vertexai.generative_models import GenerativeModel

        self.project_id = project_id
        self.location = location
        aiplatform.init(project=project_id, location=location)
        self.model = GenerativeModel(model_name)

    def generate_content(self, prompt: str) -> str:
        """Generate content using Vertex AI."""
        response = self.model.generate_content(prompt)
        return response.text

    async def generate_structured_content(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Dict[str, Any],
    ) -> List[str]:
        """Generate structured content using Vertex AI with JSON schema."""
        from vertexai.generative_models import GenerationConfig
        
        # Combine system and user prompts
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        # Use generate_content with response_schema parameter
        generation_config = GenerationConfig(
            response_schema=response_schema,
            response_mime_type="application/json",
        )
        
        response = self.model.generate_content(
            full_prompt,
            generation_config=generation_config,
        )
        
        # Parse JSON response
        try:
            json_data = json.loads(response.text)
            # Extract the array from the response
            if isinstance(json_data, list):
                return json_data
            elif isinstance(json_data, dict) and "items" in json_data:
                return json_data["items"]
            else:
                raise ValueError(f"Unexpected JSON structure: {json_data}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {e}. Response: {response.text}")


class OllamaProvider(LLMProvider):
    """Ollama local LLM provider."""

    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "llama3.2"):
        """
        Initialize Ollama provider.

        Args:
            base_url: Ollama API base URL (default: http://localhost:11434)
            model_name: Model name to use (default: llama3.2)
                      Common models: llama3.2, mistral, phi3, gemma2, etc.
        """
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.api_url = f"{self.base_url}/api/generate"

    def generate_content(self, prompt: str) -> str:
        """Generate content using Ollama."""
        try:
            response = httpx.post(
                self.api_url,
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                },
                timeout=300.0,  # 5 minutes timeout
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except httpx.RequestError as e:
            raise RuntimeError(f"Failed to connect to Ollama at {self.base_url}: {e}")
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama API error: {e.response.status_code} - {e.response.text}")

    async def generate_structured_content(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Dict[str, Any],
    ) -> List[str]:
        """Generate structured content using Ollama with JSON parsing."""
        # Since Ollama doesn't natively support JSON schema, enhance the prompt
        # to explicitly request JSON format
        schema_description = json.dumps(response_schema, indent=2)
        enhanced_prompt = f"""{system_prompt}

{user_prompt}

IMPORTANT: You MUST respond with ONLY a valid JSON array that matches this schema:
{schema_description}

Do not include any text before or after the JSON array. Return ONLY the JSON array."""

        try:
            response = httpx.post(
                self.api_url,
                json={
                    "model": self.model_name,
                    "prompt": enhanced_prompt,
                    "stream": False,
                },
                timeout=300.0,  # 5 minutes timeout
            )
            response.raise_for_status()
            result = response.json()
            response_text = result.get("response", "").strip()
            
            # Try to extract JSON from the response (may have extra text)
            # Look for JSON array pattern
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
            
            # Parse JSON response
            try:
                json_data = json.loads(response_text)
                # Extract the array from the response
                if isinstance(json_data, list):
                    return json_data
                elif isinstance(json_data, dict) and "items" in json_data:
                    return json_data["items"]
                else:
                    raise ValueError(f"Unexpected JSON structure: {json_data}")
            except json.JSONDecodeError as e:
                raise ValueError(
                    f"Failed to parse JSON response from Ollama: {e}. "
                    f"Response text: {response_text[:200]}..."
                )
        except httpx.RequestError as e:
            raise RuntimeError(f"Failed to connect to Ollama at {self.base_url}: {e}")
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama API error: {e.response.status_code} - {e.response.text}")


class MockProvider(LLMProvider):
    """Mock provider for testing without any AI calls."""

    def generate_content(self, prompt: str) -> str:
        """Generate mock content."""
        # Simple mock that returns formatted responses based on prompt content
        if "character" in prompt.lower():
            return """1. **Aria Blackwood** - A mysterious scholar with a hidden past, seeking ancient knowledge. Key traits: Intelligent, secretive, determined. Backstory: Former member of a secret organization, now on the run. Motivations: To uncover the truth about her family's disappearance.

2. **Marcus Thorne** - A skilled warrior with a code of honor. Key traits: Brave, loyal, conflicted. Backstory: Raised in a military academy, left after questioning orders. Motivations: To protect the innocent and find redemption.

3. **Luna Starweaver** - A magical healer with a connection to nature. Key traits: Compassionate, intuitive, powerful. Backstory: Discovered her powers during a childhood illness. Motivations: To heal the world and restore balance."""
        
        elif "plot" in prompt.lower():
            return """1. **The Hidden Prophecy** - An ancient prophecy reveals that the main character must make a difficult choice between saving their loved one or saving the world. This creates internal conflict and drives the story forward.

2. **The Betrayal** - A trusted ally is revealed to be working for the antagonist, creating tension and forcing the protagonist to question everyone around them.

3. **The Discovery** - The protagonist discovers that their greatest enemy is actually trying to prevent a greater evil, forcing them to reconsider their entire mission."""
        
        elif "place" in prompt.lower():
            return """1. **The Whispering Woods** - A mystical forest where the trees seem to speak secrets. The atmosphere is eerie yet beautiful, with ancient magic lingering in the air. Key features include glowing mushrooms and a hidden clearing where important events occur.

2. **The Crystal Caves** - Underground caverns filled with luminescent crystals that store magical energy. These caves serve as a sanctuary and a source of power for the characters.

3. **The Forgotten Library** - An abandoned library containing lost knowledge and dangerous secrets. The shelves stretch endlessly, and some books are said to be alive."""
        
        elif "theme" in prompt.lower():
            return """1. **Sacrifice and Redemption** - Exploring how characters must give up something important to achieve their goals and find redemption for past mistakes.

2. **The Nature of Power** - Examining how power corrupts and how different characters handle authority and responsibility.

3. **Identity and Self-Discovery** - Characters questioning who they are and discovering their true purpose in the world."""
        
        else:
            # Generic response
            return f"""This is a mock response for testing purposes.

Prompt received: {prompt[:100]}...

[Mock content would be generated here in a real scenario. This allows you to test the API flow without incurring costs or requiring an AI model.]"""

    async def generate_structured_content(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Dict[str, Any],
    ) -> List[str]:
        """Generate mock structured content for testing."""
        # Return mock suggestions based on context
        # Check if the prompt mentions next lines or continuation
        if "next line" in user_prompt.lower() or "continuation" in user_prompt.lower() or "[INSERTION_POINT]" in user_prompt:
            return [
                "The morning light filtered through the curtains, casting long shadows across the room.",
                "She paused, considering her next words carefully before speaking.",
                "A sense of unease settled over him as he realized what was about to happen.",
            ]
        else:
            # Generic mock suggestions
            return [
                "Mock suggestion 1 for structured content testing.",
                "Mock suggestion 2 for structured content testing.",
                "Mock suggestion 3 for structured content testing.",
            ]


def get_llm_provider(project_id: Optional[str] = None, location: str = "us-central1") -> LLMProvider:
    """
    Factory function to get the appropriate LLM provider based on environment variables.

    Environment variables:
    - USE_OLLAMA: If set to "true", use Ollama instead of Vertex AI
    - OLLAMA_BASE_URL: Ollama API base URL (default: http://localhost:11434)
    - OLLAMA_MODEL: Model name to use (default: llama3.2)
    - USE_MOCK: If set to "true", use mock provider (no AI calls)

    Args:
        project_id: GCP project ID (required for Vertex AI)
        location: GCP location (required for Vertex AI)

    Returns:
        LLMProvider instance
    """
    use_mock = os.getenv("USE_MOCK", "").lower() == "true"
    use_ollama = os.getenv("USE_OLLAMA", "").lower() == "true"

    if use_mock:
        print("Using Mock LLM Provider for testing.")
        return MockProvider()
    
    if use_ollama:
        print("Using Ollama LLM Provider.")
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model_name = os.getenv("OLLAMA_MODEL", "phi4-mini")
        return OllamaProvider(base_url=base_url, model_name=model_name)
    
    # Default to Vertex AI
    if not project_id:
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        raise ValueError(
            "GOOGLE_CLOUD_PROJECT must be set for Vertex AI, "
            "or set USE_OLLAMA=true or USE_MOCK=true for local testing"
        )
    
    model_name = os.getenv("VERTEX_AI_MODEL", "gemini-1.5-pro")
    return VertexAIProvider(project_id=project_id, location=location, model_name=model_name)

