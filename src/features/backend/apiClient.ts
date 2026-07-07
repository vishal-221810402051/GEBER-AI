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
    aiReview: false;
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
