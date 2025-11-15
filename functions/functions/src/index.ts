import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

setGlobalOptions({
  maxInstances: 5,
  memory: "512MiB",
  timeoutSeconds: 540, // Increased for async operations
});

admin.initializeApp();

// Export existing endpoints

export const getData = onRequest(async (request, response) => {
  const db = admin.firestore();

  try {
    const storiesRef = db.collection("stories");
    const snapshot = await storiesRef.get();

    if (snapshot.empty) {
      logger.info('No matching documents found in the "stories" collection.');
      response.status(404).send("No stories found");
      return;
    }

    const storiesData: any[] = [];

    // Use Promise.all to fetch all stories and their subcollections in parallel
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        const storyData = {
          id: doc.id,
          ...doc.data(),
          chapters: [] as any[],
          characters: [] as any[],
          plots: [] as any[],
          places: [] as any[],
        };

        // Fetch all subcollections in parallel
        const [
          chaptersSnapshot,
          charactersSnapshot,
          plotsSnapshot,
          placesSnapshot,
        ] = await Promise.all([
          doc.ref.collection("chapters").get(),
          doc.ref.collection("characters").get(),
          doc.ref.collection("plots").get(),
          doc.ref.collection("places").get(),
        ]);

        // Add chapters data
        chaptersSnapshot.forEach((chapterDoc) => {
          storyData.chapters.push({
            id: chapterDoc.id,
            ...chapterDoc.data(),
          });
        });

        // Add characters data
        charactersSnapshot.forEach((characterDoc) => {
          storyData.characters.push({
            id: characterDoc.id,
            ...characterDoc.data(),
          });
        });

        // Add plots data
        plotsSnapshot.forEach((plotDoc) => {
          storyData.plots.push({
            id: plotDoc.id,
            ...plotDoc.data(),
          });
        });

        // Add places data
        placesSnapshot.forEach((placeDoc) => {
          storyData.places.push({
            id: placeDoc.id,
            ...placeDoc.data(),
          });
        });

        storiesData.push(storyData);
      })
    );

    logger.info("Fetched all stories data with subcollections or have I?", {
      storiesCount: storiesData.length,
    });

    response.status(200).json(storiesData);
  } catch (error) {
    logger.error("Error fetching stories data:", error);
    response.status(500).send("Internal Server Error");
  }
});

export const authenticate = onRequest(
  { cors: true },
  async (request, response) => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        response.status(400).json({ error: "Email and password required" });
        return;
      }

      // For emulator, you need to use the REST API
      const apiKey = "fake-api-key"; // Emulator accepts any key
      const authUrl = process.env.FUNCTIONS_EMULATOR
        ? `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`
        : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const authResponse = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      const authData = await authResponse.json();

      if (authData.idToken) {
        response.status(200).json({
          idToken: authData.idToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
        });
      } else {
        response
          .status(401)
          .json({ error: authData.error || "Authentication failed" });
      }
    } catch (error) {
      logger.error("Auth error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  }
);

// Export new agent endpoints
export { generateStory } from "./generateStory";
export { generateChapter } from "./generateChapter";
export {
  brainstormIdeas,
  brainstormCharacter,
  brainstormPlot,
} from "./brainstormIdeas";
export {
  getStoryContextEndpoint as getStoryContext,
  updateContext,
} from "./contextEndpoints";
export {
  getJobStatus,
  getStoryJobsEndpoint as getStoryJobs,
} from "./jobEndpoints";
