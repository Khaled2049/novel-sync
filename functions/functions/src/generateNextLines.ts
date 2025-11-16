import { onRequest } from "firebase-functions/https";
import { callAgentWithRetry } from "./agentService";
import { requireStoryOwnership } from "./authService";
import { logger } from "firebase-functions";

export const generateNextLines = onRequest(
  { cors: true },
  requireStoryOwnership(async (request, response, userId, storyId) => {
    try {
      const { content, cursorPosition, chapterId } = request.body;

      // Call agent synchronously
      const agentResponse = await callAgentWithRetry("generateNextLines", {
        storyId,
        content,
        cursorPosition,
        chapterId, // Optional: helps identify which chapter for better context
      });

      if (!agentResponse.success || !agentResponse.data) {
        response.status(500).json({
          error: "Failed to generate next lines",
          details: agentResponse.error,
        });
        return;
      }

      response.status(200).json(agentResponse.data);
    } catch (error) {
      logger.error("Error in generateNextLines", error);
      response.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  })
);
