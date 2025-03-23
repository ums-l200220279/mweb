/**
 * API Documentation Generator untuk Memoright
 *
 * Utilitas untuk menghasilkan dokumentasi API secara otomatis
 * berdasarkan kode sumber dan komentar.
 */

import { logger } from "@/lib/logger"
import fs from "fs/promises"
import path from "path"

export interface ApiEndpoint {
  path: string
  method: string
  description: string
  parameters: {
    name: string
    type: string
    required: boolean
    description: string
    schema?: any
  }[]
  requestBody?: {
    description: string
    required: boolean
    content: Record<
      string,
      {
        schema: any
        example?: any
      }
    >
  }
  responses: Record<
    string,
    {
      description: string
      content?: Record<
        string,
        {
          schema: any
          example?: any
        }
      >
    }
  >
  security?: string[]
  tags?: string[]
}

export interface ApiDocumentation {
  title: string
  version: string
  description: string
  servers: {
    url: string
    description: string
  }[]
  endpoints: ApiEndpoint[]
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, any>
  }
}

export class ApiDocumentationGenerator {
  private apiDocs: ApiDocumentation
  private apiRoutesDir: string

  constructor(options: {
    title: string
    version: string
    description: string
    servers: {
      url: string
      description: string
    }[]
    apiRoutesDir: string
  }) {
    this.apiDocs = {
      title: options.title,
      version: options.version,
      description: options.description,
      servers: options.servers,
      endpoints: [],
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    }

    this.apiRoutesDir = options.apiRoutesDir
  }

  /**
   * Generate dokumentasi API
   */
  public async generate(): Promise<ApiDocumentation> {
    try {
      // Scan direktori API routes
      await this.scanApiRoutes(this.apiRoutesDir)

      // Tambahkan skema komponen dari file definisi
      await this.addComponentSchemas()

      return this.apiDocs
    } catch (error) {
      logger.error("Failed to generate API documentation", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Scan direktori API routes
   */
  private async scanApiRoutes(dir: string, basePath = ""): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // Jika direktori, scan rekursif
          let newBasePath = basePath

          // Jika bukan direktori khusus Next.js, tambahkan ke base path
          if (entry.name !== "api" && !entry.name.startsWith("_") && !entry.name.startsWith(".")) {
            newBasePath = path.join(basePath, entry.name)
          }

          await this.scanApiRoutes(fullPath, newBasePath)
        } else if (entry.isFile() && (entry.name === "route.ts" || entry.name === "route.js")) {
          // Jika file route, parse endpoint
          await this.parseApiEndpoint(fullPath, basePath)
        }
      }
    } catch (error) {
      logger.error(
        `Failed to scan API routes directory: ${dir}`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Parse API endpoint dari file route
   */
  private async parseApiEndpoint(filePath: string, basePath: string): Promise<void> {
    try {
      // Baca file
      const content = await fs.readFile(filePath, "utf-8")

      // Parse HTTP methods
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]

      for (const method of methods) {
        const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`, "i")

        if (methodRegex.test(content)) {
          // Parse komentar JSDoc
          const jsdocRegex = new RegExp(
            `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*export\\s+async\\s+function\\s+${method}\\s*\\(`,
            "i",
          )
          const jsdocMatch = content.match(jsdocRegex)

          const endpoint: ApiEndpoint = {
            path: this.normalizePath(basePath),
            method: method,
            description: "",
            parameters: [],
            responses: {},
          }

          if (jsdocMatch && jsdocMatch[1]) {
            // Parse deskripsi
            const descriptionMatch = jsdocMatch[1].match(/@description\s+(.*?)(?=@|\*\/)/s)
            if (descriptionMatch) {
              endpoint.description = descriptionMatch[1].trim()
            }

            // Parse parameter
            const paramMatches = jsdocMatch[1].matchAll(/@param\s+{([^}]+)}\s+([^\s]+)\s+(.*?)(?=@|\*\/)/gs)
            for (const paramMatch of paramMatches) {
              const type = paramMatch[1].trim()
              const name = paramMatch[2].trim()
              const description = paramMatch[3].trim()

              endpoint.parameters.push({
                name,
                type,
                required: !type.includes("?"),
                description,
              })
            }

            // Parse response
            const responseMatches = jsdocMatch[1].matchAll(/@response\s+{(\d+)}\s+(.*?)(?=@|\*\/)/gs)
            for (const responseMatch of responseMatches) {
              const statusCode = responseMatch[1].trim()
              const description = responseMatch[2].trim()

              endpoint.responses[statusCode] = {
                description,
              }
            }

            // Parse tags
            const tagsMatch = jsdocMatch[1].match(/@tags\s+(.*?)(?=@|\*\/)/s)
            if (tagsMatch) {
              endpoint.tags = tagsMatch[1]
                .trim()
                .split(",")
                .map((tag) => tag.trim())
            }

            // Parse security
            const securityMatch = jsdocMatch[1].match(/@security\s+(.*?)(?=@|\*\/)/s)
            if (securityMatch) {
              endpoint.security = securityMatch[1]
                .trim()
                .split(",")
                .map((security) => security.trim())
            }
          }

          // Tambahkan endpoint ke dokumentasi
          this.apiDocs.endpoints.push(endpoint)
        }
      }
    } catch (error) {
      logger.error(
        `Failed to parse API endpoint: ${filePath}`,
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  /**
   * Normalisasi path API
   */
  private normalizePath(basePath: string): string {
    // Ganti parameter dinamis dengan format OpenAPI
    let normalizedPath = basePath.replace(/\[([^\]]+)\]/g, "{$1}")

    // Pastikan path dimulai dengan /
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = "/" + normalizedPath
    }

    return normalizedPath
  }

  /**
   * Tambahkan skema komponen dari file definisi
   */
  private async addComponentSchemas(): Promise<void> {
    try {
      const schemasDir = path.join(process.cwd(), "lib", "api", "schemas")

      // Periksa apakah direktori ada
      try {
        await fs.access(schemasDir)
      } catch {
        // Direktori tidak ada, lewati
        return
      }

      const entries = await fs.readdir(schemasDir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
          const filePath = path.join(schemasDir, entry.name)
          const content = await fs.readFile(filePath, "utf-8")

          // Parse skema Zod atau definisi tipe
          // Ini adalah implementasi sederhana, implementasi nyata akan lebih kompleks
          const schemaMatches = content.matchAll(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*z\.object$$\{([^}]+)\}$$/gs)

          for (const schemaMatch of schemaMatches) {
            const schemaName = schemaMatch[1]
            const schemaContent = schemaMatch[2]

            // Parse properti skema
            const schema: any = {
              type: "object",
              properties: {},
              required: [],
            }

            const propertyMatches = schemaContent.matchAll(/([A-Za-z0-9_]+):\s*z\.([^(,]+)(?:$$$$)?([^,]*)/gs)

            for (const propertyMatch of propertyMatches) {
              const propertyName = propertyMatch[1].trim()
              const propertyType = propertyMatch[2].trim()
              const propertyModifiers = propertyMatch[3].trim()

              let type: string
              switch (propertyType) {
                case "string":
                  type = "string"
                  break
                case "number":
                  type = "number"
                  break
                case "boolean":
                  type = "boolean"
                  break
                case "array":
                  type = "array"
                  break
                case "object":
                  type = "object"
                  break
                default:
                  type = "string"
              }

              schema.properties[propertyName] = { type }

              // Periksa apakah properti wajib
              if (!propertyModifiers.includes("optional()")) {
                schema.required.push(propertyName)
              }
            }

            // Tambahkan skema ke komponen
            this.apiDocs.components.schemas[schemaName] = schema
          }
        }
      }
    } catch (error) {
      logger.error("Failed to add component schemas", error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Export dokumentasi ke file JSON
   */
  public async exportToJson(outputPath: string): Promise<void> {
    try {
      // Konversi ke format OpenAPI
      const openApiDoc = this.convertToOpenApi()

      // Tulis ke file
      await fs.writeFile(outputPath, JSON.stringify(openApiDoc, null, 2), "utf-8")

      logger.info(`API documentation exported to ${outputPath}`)
    } catch (error) {
      logger.error(
        "Failed to export API documentation to JSON",
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Konversi ke format OpenAPI
   */
  private convertToOpenApi(): any {
    const paths: Record<string, any> = {}

    // Konversi endpoints ke format OpenAPI
    for (const endpoint of this.apiDocs.endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {}
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        description: endpoint.description,
        tags: endpoint.tags || [],
        parameters: endpoint.parameters.map((param) => ({
          name: param.name,
          in: param.name.startsWith("body") ? "body" : "query",
          required: param.required,
          description: param.description,
          schema: param.schema || {
            type: this.mapTypeToOpenApi(param.type),
          },
        })),
        responses: Object.entries(endpoint.responses).reduce(
          (acc, [code, response]) => {
            acc[code] = {
              description: response.description,
              content: response.content || {
                "application/json": {
                  schema: {
                    type: "object",
                  },
                },
              },
            }
            return acc
          },
          {} as Record<string, any>,
        ),
        security: endpoint.security ? endpoint.security.map((sec) => ({ [sec]: [] })) : undefined,
      }
    }

    return {
      openapi: "3.0.0",
      info: {
        title: this.apiDocs.title,
        version: this.apiDocs.version,
        description: this.apiDocs.description,
      },
      servers: this.apiDocs.servers,
      paths,
      components: this.apiDocs.components,
    }
  }

  /**
   * Map tipe TypeScript ke tipe OpenAPI
   */
  private mapTypeToOpenApi(type: string): string {
    switch (type.toLowerCase()) {
      case "string":
        return "string"
      case "number":
      case "bigint":
        return "number"
      case "boolean":
        return "boolean"
      case "object":
        return "object"
      case "array":
        return "array"
      default:
        return "string"
    }
  }
}

