import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ApiErrorResponse } from "../types/api.js";

function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    ok: false,
    error: details === undefined
      ? { code, message }
      : { code, message, details }
  };

  return reply.code(statusCode).send(body);
}

export function registerErrorHandlers(app: FastifyInstance) {
  app.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) =>
    sendError(reply, 404, "ROUTE_NOT_FOUND", "The requested backend route does not exist.")
  );

  app.setErrorHandler((error, _request, reply) => {
    const backendError = error as { message?: string; statusCode?: number };
    const statusCode = backendError.statusCode && backendError.statusCode >= 400
      ? backendError.statusCode
      : 500;

    return sendError(
      reply,
      statusCode,
      statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
      statusCode >= 500
        ? "The backend encountered an unexpected error."
        : backendError.message ?? "The backend could not process the request."
    );
  });
}
