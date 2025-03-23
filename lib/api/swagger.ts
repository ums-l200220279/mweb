import { createSwaggerSpec } from "next-swagger-doc"

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Memoright API Documentation",
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        description: "API documentation for the Memoright brain training application",
        contact: {
          name: "Memoright Support",
          email: "support@memoright.app",
        },
        license: {
          name: "MIT",
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || "https://api.memoright.app",
          description: "Production server",
        },
        {
          url: "http://localhost:3000",
          description: "Local development server",
        },
      ],
      tags: [
        {
          name: "Auth",
          description: "Authentication endpoints",
        },
        {
          name: "Users",
          description: "User management endpoints",
        },
        {
          name: "Games",
          description: "Game-related endpoints",
        },
        {
          name: "Sessions",
          description: "Game session endpoints",
        },
        {
          name: "Results",
          description: "Game results and analytics",
        },
        {
          name: "Health",
          description: "Health data integration",
        },
        {
          name: "Payments",
          description: "Subscription and payment endpoints",
        },
      ],
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
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
              image: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Game: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              difficulty: {
                type: "string",
                enum: ["easy", "medium", "hard", "expert"],
              },
              imageUrl: { type: "string", nullable: true },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          GameSession: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              gameId: { type: "string" },
              startedAt: { type: "string", format: "date-time" },
              endedAt: { type: "string", format: "date-time", nullable: true },
              difficulty: {
                type: "string",
                enum: ["easy", "medium", "hard", "expert"],
              },
              status: {
                type: "string",
                enum: ["in_progress", "completed", "abandoned"],
              },
              score: { type: "number", nullable: true },
              metadata: {
                type: "object",
                additionalProperties: true,
                nullable: true,
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {
                type: "object",
                additionalProperties: true,
                nullable: true,
              },
            },
          },
        },
      },
    },
  })

  return spec
}

