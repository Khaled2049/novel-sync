import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
} from "@google/generative-ai";

export class AITextGenerator {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chat: ChatSession;
  private history: { role: string; parts: { text: string }[] }[];
  public id: number;

  constructor(id: number) {
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.history = [
      {
        role: "user",
        parts: [
          {
            text: "You are a veteran author and will help me write a novel. You will read my previous sentences and generate a new sentence to guide the story. Always generate exactly one sentence.",
          },
        ],
      },
    ];

    this.id = id;
    this.chat = this.model.startChat({
      history: this.history,
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
  }

  private async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Error generating content");
    }
  }

  async generateRandomTopic(): Promise<string> {
    const prompt = "Generate a random topic for a story.";

    try {
      const result = await this.model.generateContent(prompt);
      const generatedText = result.response.text().trim();
      this.history.push({ role: "model", parts: [{ text: generatedText }] });
      return generatedText;
    } catch (error: any) {
      console.error("Error:", error);
      return "Error generating random topic";
    }
  }

  async extpandText(text: string): Promise<string> {
    const prompt = `Expand the following sentence into a paragraph: ${text}`;
    return this.generateContent(prompt);
  }

  async paraphraseText(text: string): Promise<string> {
    const prompt = `Paraphrase the following: ${text}`;
    return this.generateContent(prompt);
  }

  async summarizePlotOrScene(text: string): Promise<string> {
    const prompt = `Provide a concise summary of the following plot or scene: ${text}`;
    return this.generateContent(prompt);
  }

  async adjustToneAndStyle(text: string, desiredTone: string): Promise<string> {
    const prompt = `Adjust the tone and style of the following text to be ${desiredTone}: ${text}`;
    return this.generateContent(prompt);
  }

  async enhanceCharacterDialogue(
    dialogue: string,
    character: string
  ): Promise<string> {
    const prompt = `Enhance the following dialogue to better reflect ${character}'s personality and manner of speaking: ${dialogue}`;
    return this.generateContent(prompt);
  }

  async exploreTheme(text: string, theme: string): Promise<string> {
    const prompt = `Analyze and enhance the exploration of the theme "${theme}" in the following text: ${text}`;
    return this.generateContent(prompt);
  }

  async generateLine(prevText: string): Promise<string> {
    const lines = prevText.split("\n").slice(-5).join("\n");
    let prompt = `Based on the following context, generate exactly one sentence to continue the story:\n\n${lines}\n\nContinue with one sentence:`;

    if (this.id == 1) {
      prompt = `You are a who writer thrives in crafting stories filled with deep emotions, sorrow, and introspection.
       They often explore themes of loss, longing, and the darker aspects of the human experience. Their writing is poetic, heavy with symbolism, and can evoke a strong emotional response in readers. Based on the following context, generate exactly one sentence to continue the story:\n\n${lines}\n\nContinue with one sentence:`;
    } else if (this.id == 2) {
      prompt = `You are a writer who is all about spreading positivity and joy through their words. They create stories that inspire hope, happiness, and a sense of well-being. Their characters often overcome challenges with a smile, and their plots are filled with moments of triumph, love, and light-hearted humor.Based on the following context, generate exactly one sentence to continue the story:\n\n${lines}\n\nContinue with one sentence:`;
    } else if (this.id == 3) {
      prompt = `You are a writer who delves into the deeper questions of life, often exploring themes of existence, purpose, and morality. Their writing is introspective and challenges readers to think critically about the world around them. They weave complex ideas into their narratives, creating stories that linger in the reader's mind long after the final page.Based on the following context, generate exactly one sentence to continue the story:\n\n${lines}\n\nContinue with one sentence:`;
    } else if (this.id == 4) {
      prompt = `You are a writer is a master of crafting love stories that capture the essence of romance and passion. They create characters with deep emotional connections and plots that explore the highs and lows of love. Whether it's a slow-burning romance or a whirlwind affair, their stories are filled with heartfelt moments and tender emotions.Based on the following context, generate exactly one sentence to continue the story:\n\n${lines}\n\nContinue with one sentence:`;
    }

    this.history.push({ role: "user", parts: [{ text: prompt }] });

    try {
      const result = await this.chat.sendMessage(prompt);
      const generatedText = result.response.text().trim();
      const sentences = generatedText.split(/[.!?]+/);
      const singleSentence =
        sentences[0] + (generatedText.match(/[.!?]+/) || ["."])[0];
      this.history.push({ role: "model", parts: [{ text: singleSentence }] });
      return " " + singleSentence;
    } catch (error) {
      console.error("Error:", error);
      return "";
    }
  }

  async generateFromSuggestion(suggestion: string): Promise<string> {
    const prompt = `Based on the suggestion "${suggestion}", generate exactly two sentences to start a story Suggestion: ${suggestion}\n\nContinue with two sentences:`;
    this.history.push({ role: "user", parts: [{ text: prompt }] });

    try {
      const result = await this.chat.sendMessage(prompt);
      const generatedText = result.response.text().trim();
      const sentences =
        generatedText
          .split(/[.!?]+/)
          .slice(0, 2)
          .join(". ") + ".";
      this.history.push({ role: "model", parts: [{ text: " " + sentences }] });
      return sentences;
    } catch (error) {
      console.error("Error:", error);
      return "";
    }
  }

  async generateSuggestions(desire: string): Promise<string[]> {
    try {
      const prompt = `Given the desire "${desire}", provide 5 specific suggestions or topics to write about. Return only the numbered list of suggestions, with no additional text.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const suggestions = text
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line) => line.length > 0);

      if (suggestions.length < 5) {
        throw new Error("Not enough suggestions generated");
      }
      return suggestions.slice(0, 5);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      throw error;
    }
  }
}
