import { firestore, logger } from "firebase-functions/v2";
import * as admin from "firebase-admin";

// import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase Admin SDK
admin.initializeApp();
// const STARTING_PROMPT = `
// You are a veteran author and will help me write a novel.
// You will read my previous sentences and generate a new sentence to guide the story.
// Always generate exactly one sentence.
// `;
// const genAI = new GoogleGenerativeAI(String(process.env.API_KEY));
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// const generateContent = async (prompt: string): Promise<string> => {
//   try {
//     // const result = await model.generateContent(STARTING_PROMPT + prompt);
//     // return result.response.text().trim();
//     return "This is a generated content";
//   } catch (error) {
//     console.error("Error:", error);
//     throw new Error("Error generating content");
//   }
// };

export const onWriteCharacters = firestore.onDocumentWritten(
  "stories/{storyId}/characters/{characterId}",
  async (event) => {
    const storyId = event.params.storyId;
    const characterId = event.params.characterId;

    const change = event.data;
    if (!change) {
      logger.info(`Character ${characterId} deleted from story ${storyId}`);
      return;
    }

    const characterData = change.after?.data();
    if (!characterData) {
      logger.info(`No data in character document ${characterId}`);
      return;
    }

    logger.info(`Character added/updated in story ${storyId}`, characterData);

    const context = `New character added: ${JSON.stringify(characterData)}`;

    try {
      const contextRef = admin
        .firestore()
        .collection("stories")
        .doc(storyId)
        .collection("context")
        .doc(storyId);

      // Wrap the string in an object
      await contextRef.set({ context }, { merge: true });

      logger.info(`Context updated for story ${storyId}`);
    } catch (error) {
      logger.error(
        `Error writing character data to context for story ${storyId}:`,
        error
      );
    }
  }
);

// export const onWritePlots = firestore.onDocumentWritten(
//   "stories/{storyId}/plots/{plotId}",
//   async (event) => {
//     const storyId = event.params.storyId;
//     const plotId = event.params.plotId;

//     const change = event.data;
//     if (!change.after) {
//       logger.info(`Plot ${plotId} deleted from story ${storyId}`);
//       return;
//     }

//     const plotData = change.after.data();
//     if (!plotData) {
//       logger.info(`No data in plot document ${plotId}`);
//       return;
//     }

//     logger.info(`Plot added/updated in story ${storyId}`, plotData);

//     // Update the story's context or perform related operations
//     const storyContextRef = admin
//       .firestore()
//       .doc(`stories/${storyId}/meta/context`);
//     const storyContextDoc = await storyContextRef.get();

//     const storyContext = storyContextDoc.exists ? storyContextDoc.data() : {};
//     const updatedPrompt = `${
//       storyContext?.prompt || ""
//     }\nNew plot added: ${JSON.stringify(plotData)}`;

//     await storyContextRef.set({ prompt: updatedPrompt }, { merge: true });

//     logger.info(`Plot ${plotId} processed for story ${storyId}`);
//   }
// );

// export const onWritePlaces = firestore.onDocumentWritten(
//   "stories/{storyId}/places/{placeId}",
//   async (event) => {
//     const storyId = event.params.storyId;
//     const placeId = event.params.placeId;

//     const change = event.data;
//     if (!change.after) {
//       logger.info(`Place ${placeId} deleted from story ${storyId}`);
//       return;
//     }

//     const placeData = change.after.data();
//     if (!placeData) {
//       logger.info(`No data in place document ${placeId}`);
//       return;
//     }

//     logger.info(`Place added/updated in story ${storyId}`, placeData);

//     // Update the story's context or perform related operations
//     const storyContextRef = admin
//       .firestore()
//       .doc(`stories/${storyId}/meta/context`);
//     const storyContextDoc = await storyContextRef.get();

//     const storyContext = storyContextDoc.exists ? storyContextDoc.data() : {};
//     const updatedPrompt = `${
//       storyContext?.prompt || ""
//     }\nNew place added: ${JSON.stringify(placeData)}`;

//     await storyContextRef.set({ prompt: updatedPrompt }, { merge: true });

//     logger.info(`Place ${placeId} processed for story ${storyId}`);
//   }
// );
