export type ApiErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type HealthResponse = {
  ok: true;
  service: "geber-ai-backend";
  status: "healthy";
  timestamp: string;
};

export type CapabilitiesResponse = {
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
