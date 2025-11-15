import axiosInstance from "./index";

export interface BrainstormIdeasRequest {
  storyId: string;
  type: "characters" | "plots" | "places" | "themes";
  prompt?: string;
  count?: number;
}

export interface BrainstormIdea {
  text: string;
}

export interface BrainstormIdeasResponse {
  data: {
    storyId: string;
    type: "characters" | "plots" | "places" | "themes";
    ideas: BrainstormIdea[];
  };
}

/**
 * Generate brainstorming ideas synchronously (characters, plots, places, or themes).
 *
 * @param request - The brainstorm request parameters
 * @returns Promise resolving to brainstorm ideas response
 * @throws Error if the request fails
 */
export const brainstormIdeas = async (
  request: BrainstormIdeasRequest
): Promise<BrainstormIdeasResponse> => {
  try {
    const response = await axiosInstance.post<BrainstormIdeasResponse>(
      "/brainstormIdeas",
      request
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Failed to generate brainstorm ideas";
    throw new Error(errorMessage);
  }
};
