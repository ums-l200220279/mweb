import { type NextRequest, NextResponse } from "next/server"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { createApiResponse } from "@/lib/api-config"

/**
 * OpenAPI documentation endpoint
 * GET /api/v1/docs
 */
async function handler(request: NextRequest) {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "MemoRight API",
      version: "1.0.0",
      description: "API for the MemoRight cognitive training application",
      contact: {
        name: "MemoRight Support",
        email: "support@memoright.com",
        url: "https://memoright.com/support",
      },
    },
    servers: [
      {
        url: "https://memoright.com/api/v1",
        description: "Production server",
      },
      {
        url: "https://staging.memoright.com/api/v1",
        description: "Staging server",
      },
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Health check endpoint",
          description: "Returns the health status of the API and its dependencies",
          tags: ["System"],
          responses: {
            "200": {
              description: "System is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          status: { type: "string", example: "healthy" },
                          timestamp: { type: "string", format: "date-time" },
                          services: {
                            type: "object",
                            properties: {
                              database: { type: "string", example: "healthy" },
                              redis: { type: "string", example: "healthy" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "503": {
              description: "System is degraded or unhealthy",
            },
          },
        },
      },
      "/auth/sessions": {
        get: {
          summary: "Get active sessions",
          description: "Returns all active sessions for the authenticated user",
          tags: ["Authentication"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "List of active sessions",
            },
            "401": {
              description: "Unauthorized",
            },
          },
        },
      },
      "/games/sessions/{id}/complete": {
        post: {
          summary: "Complete a game session",
          description: "Records the results of a completed game session",
          tags: ["Games"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Game session ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    score: { type: "number" },
                    accuracy: { type: "number" },
                    reactionTime: { type: "number" },
                    duration: { type: "integer" },
                  },
                  required: ["score", "duration"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Game session completed successfully",
            },
            "400": {
              description: "Invalid request data",
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Game session not found",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["USER", "INSTRUCTOR", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        GameResult: {
          type: "object",
          properties: {
            id: { type: "string" },
            gameType: { type: "string" },
            score: { type: "number" },
            accuracy: { type: "number" },
            reactionTime: { type: "number" },
            duration: { type: "integer" },
            difficulty: { type: "string" },
            taskType: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  }

  return NextResponse.json(createApiResponse(true, openApiSpec), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  })
}

export const GET = (request: NextRequest) => withErrorHandling(request, handler)

