import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { VertexAI } from "@google-cloud/vertexai";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: "novelsync-f82ec",
  location: "us-central1", // or your preferred location
});

const model = "gemini-1.5-flash";

async function generateContent(prompt: string): Promise<string> {
  try {
    // Access the generative model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    // Construct the prompt with specific instructions
    const fullPrompt = `
      You are a creative writing assistant. Based on the following context, generate a compelling story outline.
      Please consider the characters, places, and plots provided, and create a cohesive narrative that incorporates these elements.
      
      Context:
      ${prompt}
      
      Please provide a detailed story outline that:
      1. Introduces the main characters
      2. Establishes the setting
      3. Develops the main plot points
      4. Creates interesting character interactions
      5. Builds toward a satisfying conclusion
    `;

    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    const { response } = result;
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No content generated");
    }
    const generatedText = response.candidates[0].content.parts[0].text;

    logger.info("Content generated successfully");
    return generatedText || "No content generated";
  } catch (error) {
    logger.error("Error generating content:", error);
    throw new Error(
      `Error generating content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export const createContext = functions.https.onRequest(async (req, res) => {
  const storyId = req.query.storyId as string;

  if (!storyId) {
    res.status(400).send("Missing storyId parameter");
    return;
  }

  try {
    // Fetch characters from Firestore
    const charactersSnapshot = await admin
      .firestore()
      .collection("stories")
      .doc(storyId)
      .collection("characters")
      .get();

    const characters = charactersSnapshot.docs.map((doc) => doc.data());

    // Fetch places from Firestore
    const placesSnapshot = await admin
      .firestore()
      .collection("stories")
      .doc(storyId)
      .collection("places")
      .get();

    const places = placesSnapshot.docs.map((doc) => doc.data());

    // Fetch plots from Firestore
    const plotSnapshot = await admin
      .firestore()
      .collection("stories")
      .doc(storyId)
      .collection("plots")
      .get();

    const plots = plotSnapshot.docs.map((doc) => doc.data());

    // Combine the context data
    const context = {
      characters,
      places,
      plots,
    };

    logger.info("Context created successfully", context);

    // Generate AI content based on the context
    const generatedText = await generateContent(JSON.stringify(context));

    // Respond with the context and generated content
    res.status(200).json({
      message: "Context created and AI-generated text",
      context,
      generatedText,
    });
  } catch (error) {
    logger.error("Error fetching data or generating content:", error);
    res.status(500).send("Internal Server Error");
  }
});
