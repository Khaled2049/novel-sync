/** Service for communicating with the Python agent. */
import * as logger from "firebase-functions/logger";
import axios, { AxiosError } from "axios";

export interface AgentRequest {
  action: string;
  parameters: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Configuration for agent service.
 * In production, this should point to the deployed Cloud Run service.
 * For local development, it can point to a local server.
 */
const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL || "http://localhost:8000";

/**
 * Call the Python agent service.
 */
export async function callAgent(
  action: string,
  parameters: Record<string, unknown>
): Promise<AgentResponse> {
  const request: AgentRequest = {
    action,
    parameters,
  };

  try {
    logger.info(`Calling agent service: ${action}`, { parameters });

    const response = await axios.post(
      `${AGENT_SERVICE_URL}/agent/execute`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5 minutes timeout
      }
    );

    logger.info(`Agent service response received for ${action}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logger.error(`Agent service error: ${action}`, {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      return {
        success: false,
        error: axiosError.response?.data
          ? String(axiosError.response.data)
          : axiosError.message,
      };
    }

    logger.error(`Error calling agent service: ${action}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Call agent with retry logic.
 */
export async function callAgentWithRetry(
  action: string,
  parameters: Record<string, unknown>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<AgentResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await callAgent(action, parameters);
      if (result.success) {
        return result;
      }
      lastError = new Error(result.error || "Unknown error");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        logger.info(
          `Retry attempt ${attempt}/${maxRetries} for ${action} after ${retryDelay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Max retries exceeded",
  };
}
