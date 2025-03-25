"use client"

import { useReducer } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs"

// API endpoints documentation
const endpoints = [
  {
    id: "patients",
    title: "Patients API",
    description: "Endpoints for managing patient data",
    routes: [
      {
        method: "GET",
        path: "/api/patients",
        description: "Get all patients",
        parameters: [],
        responses: [
          { status: 200, description: "Success", example: '{ "patients": [...] }' },
          { status: 401, description: "Unauthorized", example: '{ "error": "Unauthorized" }' },
          { status: 500, description: "Server Error", example: '{ "error": "Internal Server Error" }' },
        ],
      },
      {
        method: "GET",
        path: "/api/patients/:id",
        description: "Get patient by ID",
        parameters: [{ name: "id", type: "string", required: true, description: "Patient ID" }],
        responses: [
          { status: 200, description: "Success", example: '{ "patient": { ... } }' },
          { status: 404, description: "Not Found", example: '{ "error": "Patient not found" }' },
          { status: 401, description: "Unauthorized", example: '{ "error": "Unauthorized" }' },
          { status: 500, description: "Server Error", example: '{ "error": "Internal Server Error" }' },
        ],
      },
    ],
  },
  {
    id: "assessments",
    title: "Assessments API",
    description: "Endpoints for cognitive assessments",
    routes: [
      {
        method: "GET",
        path: "/api/assessments",
        description: "Get all assessments",
        parameters: [],
        responses: [
          { status: 200, description: "Success", example: '{ "assessments": [...] }' },
          { status: 401, description: "Unauthorized", example: '{ "error": "Unauthorized" }' },
          { status: 500, description: "Server Error", example: '{ "error": "Internal Server Error" }' },
        ],
      },
    ],
  },
]

// Example code snippets
const codeExamples = {
  javascript: `// Example: Fetch patient data
const fetchPatient = async (patientId) => {
  try {
    const response = await fetch(\`/api/patients/\${patientId}\`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient');
    }
    const data = await response.json();
    return data.patient;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};`,
  python: `# Example: Fetch patient data
import requests

def fetch_patient(patient_id):
    try:
        response = requests.get(f'/api/patients/{patient_id}')
        response.raise_for_status()
        return response.json()['patient']
    except requests.exceptions.RequestException as e:
        print(f'Error fetching patient: {e}')
        raise`,
  curl: `# Get patient by ID
curl -X GET "https://api.memoright.com/api/patients/123" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`,
}

type State = {
  activeTab: string
  activeCodeTab: string
  copiedCode: boolean
}

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_CODE_TAB"; payload: string }
  | { type: "SET_COPIED_CODE"; payload: boolean }

const initialState: State = {
  activeTab: "patients",
  activeCodeTab: "javascript",
  copiedCode: false,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload }
    case "SET_CODE_TAB":
      return { ...state, activeCodeTab: action.payload }
    case "SET_COPIED_CODE":
      return { ...state, copiedCode: action.payload }
    default:
      return state
  }
}

const ApiDocumentation = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { activeTab, activeCodeTab, copiedCode } = state

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    dispatch({ type: "SET_COPIED_CODE", payload: true })
    setTimeout(() => dispatch({ type: "SET_COPIED_CODE", payload: false }), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      <p className="mb-8">
        Welcome to the Memoright API documentation. Use these endpoints to integrate with our cognitive health platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(tabId) => dispatch({ type: "SET_ACTIVE_TAB", payload: tabId })}
                orientation="vertical"
              >
                <TabsList className="flex flex-col items-start">
                  {endpoints.map((endpoint) => (
                    <TabsTrigger key={endpoint.id} value={endpoint.id} className="w-full text-left">
                      {endpoint.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {endpoints.map((endpoint) => (
            <TabsContent key={endpoint.id} value={endpoint.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{endpoint.title}</CardTitle>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {endpoint.routes.map((route, index) => (
                    <div key={index} className="mb-8 border-b pb-6">
                      <div className="flex items-center mb-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                            route.method === "GET"
                              ? "bg-blue-100 text-blue-800"
                              : route.method === "POST"
                                ? "bg-green-100 text-green-800"
                                : route.method === "PUT"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {route.method}
                        </span>
                        <code className="text-sm font-mono bg-gray-100 p-1 rounded">{route.path}</code>
                      </div>
                      <p className="mb-4">{route.description}</p>

                      {route.parameters.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Parameters</h4>
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border px-4 py-2 text-left">Name</th>
                                <th className="border px-4 py-2 text-left">Type</th>
                                <th className="border px-4 py-2 text-left">Required</th>
                                <th className="border px-4 py-2 text-left">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {route.parameters.map((param, paramIndex) => (
                                <tr key={paramIndex}>
                                  <td className="border px-4 py-2">{param.name}</td>
                                  <td className="border px-4 py-2">{param.type}</td>
                                  <td className="border px-4 py-2">{param.required ? "Yes" : "No"}</td>
                                  <td className="border px-4 py-2">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2">Responses</h4>
                        {route.responses.map((response, respIndex) => (
                          <div key={respIndex} className="mb-2">
                            <div className="flex items-center mb-1">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                                  response.status >= 200 && response.status < 300
                                    ? "bg-green-100 text-green-800"
                                    : response.status >= 400 && response.status < 500
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {response.status}
                              </span>
                              <span>{response.description}</span>
                            </div>
                            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{response.example}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Examples of how to use the API in different languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCodeTab} onValueChange={(tabId) => dispatch({ type: "SET_CODE_TAB", payload: tabId })}>
                <TabsList className="mb-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([language, code]) => (
                  <TabsContent key={language} value={language}>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(code)}
                        aria-label={copiedCode ? "Code copied" : "Copy code"}
                      >
                        {copiedCode ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                        <span className="ml-1">{copiedCode ? "Copied" : "Copy"}</span>
                      </Button>
                      <div aria-live="polite" className="sr-only">
                        {copiedCode ? "Code copied to clipboard" : ""}
                      </div>
                      <SyntaxHighlighter language={language === "curl" ? "bash" : language} style={docco}>
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ApiDocumentation

