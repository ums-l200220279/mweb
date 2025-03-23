export interface OpenAPIInfo {
  title: string
  description: string
  version: string
  termsOfService?: string
  contact?: {
    name?: string
    url?: string
    email?: string
  }
  license?: {
    name: string
    url?: string
  }
}

export interface OpenAPIServer {
  url: string
  description?: string
  variables?: Record<
    string,
    {
      default: string
      enum?: string[]
      description?: string
    }
  >
}

export interface OpenAPISecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect"
  description?: string
  name?: string
  in?: "query" | "header" | "cookie"
  scheme?: string
  bearerFormat?: string
  flows?: any // OAuth2 flows
  openIdConnectUrl?: string
}

export interface OpenAPIParameter {
  name: string
  in: "query" | "header" | "path" | "cookie"
  description?: string
  required?: boolean
  deprecated?: boolean
  schema: any
}

export interface OpenAPIRequestBody {
  description?: string
  required?: boolean
  content: Record<
    string,
    {
      schema: any
      examples?: Record<string, any>
    }
  >
}

export interface OpenAPIResponse {
  description: string
  content?: Record<
    string,
    {
      schema: any
      examples?: Record<string, any>
    }
  >
}

export interface OpenAPIOperation {
  tags?: string[]
  summary?: string
  description?: string
  operationId: string
  parameters?: OpenAPIParameter[]
  requestBody?: OpenAPIRequestBody
  responses: Record<string, OpenAPIResponse>
  deprecated?: boolean
  security?: Array<Record<string, string[]>>
}

export interface OpenAPIPathItem {
  summary?: string
  description?: string
  get?: OpenAPIOperation
  put?: OpenAPIOperation
  post?: OpenAPIOperation
  delete?: OpenAPIOperation
  options?: OpenAPIOperation
  head?: OpenAPIOperation
  patch?: OpenAPIOperation
  trace?: OpenAPIOperation
  servers?: OpenAPIServer[]
  parameters?: OpenAPIParameter[]
}

export interface OpenAPIDocument {
  openapi: string
  info: OpenAPIInfo
  servers?: OpenAPIServer[]
  paths: Record<string, OpenAPIPathItem>
  components?: {
    schemas?: Record<string, any>
    responses?: Record<string, OpenAPIResponse>
    parameters?: Record<string, OpenAPIParameter>
    requestBodies?: Record<string, OpenAPIRequestBody>
    securitySchemes?: Record<string, OpenAPISecurityScheme>
  }
  security?: Array<Record<string, string[]>>
  tags?: Array<{
    name: string
    description?: string
    externalDocs?: {
      description?: string
      url: string
    }
  }>
  externalDocs?: {
    description?: string
    url: string
  }
}

export class OpenAPIGenerator {
  private document: OpenAPIDocument

  constructor(info: OpenAPIInfo) {
    this.document = {
      openapi: "3.0.3",
      info,
      paths: {},
    }
  }

  /**
   * Add a server to the OpenAPI document
   */
  public addServer(server: OpenAPIServer): this {
    if (!this.document.servers) {
      this.document.servers = []
    }

    this.document.servers.push(server)
    return this
  }

  /**
   * Add a security scheme to the OpenAPI document
   */
  public addSecurityScheme(name: string, scheme: OpenAPISecurityScheme): this {
    if (!this.document.components) {
      this.document.components = {}
    }

    if (!this.document.components.securitySchemes) {
      this.document.components.securitySchemes = {}
    }

    this.document.components.securitySchemes[name] = scheme
    return this
  }

  /**
   * Add a schema to the OpenAPI document
   */
  public addSchema(name: string, schema: any): this {
    if (!this.document.components) {
      this.document.components = {}
    }

    if (!this.document.components.schemas) {
      this.document.components.schemas = {}
    }

    this.document.components.schemas[name] = schema
    return this
  }

  /**
   * Add a path to the OpenAPI document
   */
  public addPath(path: string, pathItem: OpenAPIPathItem): this {
    this.document.paths[path] = pathItem
    return this
  }

  /**
   * Add a GET operation to a path
   */
  public addGetOperation(path: string, operation: OpenAPIOperation): this {
    if (!this.document.paths[path]) {
      this.document.paths[path] = {}
    }

    this.document.paths[path].get = operation
    return this
  }

  /**
   * Add a POST operation to a path
   */
  public addPostOperation(path: string, operation: OpenAPIOperation): this {
    if (!this.document.paths[path]) {
      this.document.paths[path] = {}
    }

    this.document.paths[path].post = operation
    return this
  }

  /**
   * Add a PUT operation to a path
   */
  public addPutOperation(path: string, operation: OpenAPIOperation): this {
    if (!this.document.paths[path]) {
      this.document.paths[path] = {}
    }

    this.document.paths[path].put = operation
    return this
  }

  /**
   * Add a DELETE operation to a path
   */
  public addDeleteOperation(path: string, operation: OpenAPIOperation): this {
    if (!this.document.paths[path]) {
      this.document.paths[path] = {}
    }

    this.document.paths[path].delete = operation
    return this
  }

  /**
   * Generate the OpenAPI document
   */
  public generate(): OpenAPIDocument {
    return this.document
  }

  /**
   * Generate the OpenAPI document as JSON
   */
  public generateJSON(): string {
    return JSON.stringify(this.document, null, 2)
  }

  /**
   * Generate the OpenAPI document as YAML
   */
  public generateYAML(): string {
    // In a real implementation, this would convert JSON to YAML
    // For demonstration purposes, we're returning a placeholder
    return `# OpenAPI document in YAML format\n# Convert from JSON using a library like js-yaml`
  }
}

/**
 * Generate OpenAPI documentation for the Memoright API
 */
export function generateMemorightAPIDocumentation(): OpenAPIDocument {
  const generator = new OpenAPIGenerator({
    title: "Memoright API",
    description: "API for the Memoright cognitive health platform",
    version: "1.0.0",
    contact: {
      name: "Memoright Support",
      email: "support@memoright.com",
      url: "https://memoright.com/support",
    },
    license: {
      name: "Proprietary",
      url: "https://memoright.com/terms",
    },
  })

  // Add servers
  generator.addServer({
    url: "https://api.memoright.com/v1",
    description: "Production server",
  })

  generator.addServer({
    url: "https://api-staging.memoright.com/v1",
    description: "Staging server",
  })

  // Add security schemes
  generator.addSecurityScheme("bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT token authentication",
  })

  generator.addSecurityScheme("apiKeyAuth", {
    type: "apiKey",
    in: "header",
    name: "X-API-Key",
    description: "API key authentication",
  })

  // Add schemas
  generator.addSchema("Patient", {
    type: "object",
    required: ["id", "firstName", "lastName", "dateOfBirth"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Unique identifier for the patient",
      },
      firstName: {
        type: "string",
        description: "First name of the patient",
      },
      lastName: {
        type: "string",
        description: "Last name of the patient",
      },
      dateOfBirth: {
        type: "string",
        format: "date",
        description: "Date of birth in ISO 8601 format (YYYY-MM-DD)",
      },
      gender: {
        type: "string",
        enum: ["male", "female", "other", "unknown"],
        description: "Gender of the patient",
      },
      email: {
        type: "string",
        format: "email",
        description: "Email address of the patient",
      },
      phone: {
        type: "string",
        description: "Phone number of the patient",
      },
      address: {
        type: "object",
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          postalCode: { type: "string" },
          country: { type: "string" },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Creation timestamp in ISO 8601 format",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Last update timestamp in ISO 8601 format",
      },
    },
  })

  generator.addSchema("CognitiveAssessment", {
    type: "object",
    required: ["id", "patientId", "type", "score", "maxScore", "completedAt"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Unique identifier for the assessment",
      },
      patientId: {
        type: "string",
        format: "uuid",
        description: "Identifier of the patient who took the assessment",
      },
      type: {
        type: "string",
        description: "Type of cognitive assessment",
      },
      score: {
        type: "number",
        description: "Score achieved in the assessment",
      },
      maxScore: {
        type: "number",
        description: "Maximum possible score for the assessment",
      },
      completedAt: {
        type: "string",
        format: "date-time",
        description: "Completion timestamp in ISO 8601 format",
      },
      duration: {
        type: "number",
        description: "Duration of the assessment in seconds",
      },
      domains: {
        type: "object",
        additionalProperties: {
          type: "number",
        },
        description: "Scores for individual cognitive domains",
      },
      notes: {
        type: "string",
        description: "Additional notes about the assessment",
      },
    },
  })

  // Add paths and operations

  // GET /patients
  generator.addGetOperation("/patients", {
    tags: ["Patients"],
    summary: "List patients",
    description: "Retrieve a list of patients with optional filtering",
    operationId: "listPatients",
    parameters: [
      {
        name: "limit",
        in: "query",
        description: "Maximum number of patients to return",
        required: false,
        schema: {
          type: "integer",
          format: "int32",
          minimum: 1,
          maximum: 100,
          default: 20,
        },
      },
      {
        name: "offset",
        in: "query",
        description: "Number of patients to skip",
        required: false,
        schema: {
          type: "integer",
          format: "int32",
          minimum: 0,
          default: 0,
        },
      },
      {
        name: "search",
        in: "query",
        description: "Search term to filter patients by name",
        required: false,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      "200": {
        description: "Successful operation",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Patient",
                  },
                },
                meta: {
                  type: "object",
                  properties: {
                    total: {
                      type: "integer",
                      description: "Total number of patients matching the criteria",
                    },
                    limit: {
                      type: "integer",
                      description: "Maximum number of patients returned",
                    },
                    offset: {
                      type: "integer",
                      description: "Number of patients skipped",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "401": {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Unauthorized",
                },
              },
            },
          },
        },
      },
      "403": {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Forbidden",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  })

  // POST /patients
  generator.addPostOperation("/patients", {
    tags: ["Patients"],
    summary: "Create a patient",
    description: "Create a new patient record",
    operationId: "createPatient",
    requestBody: {
      description: "Patient data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["firstName", "lastName", "dateOfBirth"],
            properties: {
              firstName: {
                type: "string",
                description: "First name of the patient",
              },
              lastName: {
                type: "string",
                description: "Last name of the patient",
              },
              dateOfBirth: {
                type: "string",
                format: "date",
                description: "Date of birth in ISO 8601 format (YYYY-MM-DD)",
              },
              gender: {
                type: "string",
                enum: ["male", "female", "other", "unknown"],
                description: "Gender of the patient",
              },
              email: {
                type: "string",
                format: "email",
                description: "Email address of the patient",
              },
              phone: {
                type: "string",
                description: "Phone number of the patient",
              },
              address: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  postalCode: { type: "string" },
                  country: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      "201": {
        description: "Patient created successfully",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Patient",
            },
          },
        },
      },
      "400": {
        description: "Bad request",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Invalid patient data",
                },
                details: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["First name is required", "Date of birth must be a valid date"],
                },
              },
            },
          },
        },
      },
      "401": {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Unauthorized",
                },
              },
            },
          },
        },
      },
      "403": {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Forbidden",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  })

  // Add more paths and operations...

  return generator.generate()
}

