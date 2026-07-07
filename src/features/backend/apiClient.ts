import type { AiReviewInput, AiReviewResponse } from "../ai/aiReviewTypes";

export type BackendHealthResponse = {
  ok: true;
  service: "geber-ai-backend";
  status: "healthy";
  timestamp: string;
};

export type BackendCapabilitiesResponse = {
  ok: true;
  capabilities: {
    backend: true;
    aiReview: true;
    aiReviewConfigured: boolean;
    fileUpload: false;
    persistence: false;
    authentication: false;
    deterministicFrontendPipeline: true;
  };
  message: string;
};

const defaultBackendBaseUrl = "http://localhost:8787";

async function getJson<T>(path: string, baseUrl = defaultBackendBaseUrl): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function getBackendHealth(baseUrl?: string) {
  return getJson<BackendHealthResponse>("/health", baseUrl);
}

export function getBackendCapabilities(baseUrl?: string) {
  return getJson<BackendCapabilitiesResponse>("/api/capabilities", baseUrl);
}

export async function requestAiReview(input: AiReviewInput, consent: true, baseUrl = defaultBackendBaseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/ai-review`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ consent, input })
    });
    const body = await response.json() as AiReviewResponse;

    return body;
  } catch {
    return {
      ok: false,
      error: {
        code: "BACKEND_UNAVAILABLE",
        message: "Backend is unavailable. Start the backend before running AI review."
      }
    } satisfies AiReviewResponse;
  }
}
