export const aiReviewResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "engineeringReadiness",
    "topRisks",
    "questionsForEngineer",
    "nextActions",
    "confidenceNotes",
    "reportNarrative",
    "limitations"
  ],
  properties: {
    summary: { type: "string" },
    engineeringReadiness: {
      type: "object",
      additionalProperties: false,
      required: ["label", "explanation"],
      properties: {
        label: {
          type: "string",
          enum: ["insufficient_data", "early_review", "reviewable", "needs_engineering_validation"]
        },
        explanation: { type: "string" }
      }
    },
    topRisks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "riskId",
          "title",
          "priority",
          "evidenceIds",
          "explanation",
          "recommendedAction",
          "confidence"
        ],
        properties: {
          riskId: { type: "string" },
          title: { type: "string" },
          priority: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "informational"]
          },
          evidenceIds: { type: "array", items: { type: "string" } },
          explanation: { type: "string" },
          recommendedAction: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    },
    questionsForEngineer: { type: "array", items: { type: "string" } },
    nextActions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "reason", "evidenceIds", "priority"],
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          evidenceIds: { type: "array", items: { type: "string" } },
          priority: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "informational"]
          }
        }
      }
    },
    confidenceNotes: { type: "array", items: { type: "string" } },
    reportNarrative: { type: "string" },
    limitations: { type: "array", items: { type: "string" } }
  }
} as const;
