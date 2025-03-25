export type RouteParameter = {
  name: string
  type: string
  required: boolean
  description: string
}

export type RouteResponse = {
  status: number
  description: string
  example: string
}

export type ApiRoute = {
  method: string
  path: string
  description: string
  parameters: RouteParameter[]
  responses: RouteResponse[]
}

export type ApiEndpoint = {
  id: string
  title: string
  description: string
  routes: ApiRoute[]
}

// API endpoints documentation
export const endpoints: ApiEndpoint[] = [
  {
    id: "patients",
    title: "Patients API",
    description: "Endpoints for managing patient data",
    routes: [
      // ... data yang sama seperti sebelumnya
    ],
  },
  // ... endpoint lainnya
]

// Example code snippets
export const codeExamples: Record<string, string> = {
  javascript: `// Example: Fetch patient data
  // ... kode yang sama seperti sebelumnya`,
  python: `# Example: Fetch patient data
  // ... kode yang sama seperti sebelumnya`,
  curl: `# Get patient by ID
  // ... kode yang sama seperti sebelumnya`,
}

