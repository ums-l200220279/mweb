import type React from "react"

type RouteParameter = {
  name: string
  type: string
  required: boolean
  description: string
}

type RouteResponse = {
  status: number
  description: string
  example: string
}

type RouteProps = {
  method: string
  path: string
  description: string
  parameters: RouteParameter[]
  responses: RouteResponse[]
}

export const RouteDocumentation: React.FC<RouteProps> = ({ method, path, description, parameters, responses }) => {
  return (
    <div className="mb-8 border-b pb-6">
      <div className="flex items-center mb-4">
        <span
          className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
            method === "GET"
              ? "bg-blue-100 text-blue-800"
              : method === "POST"
                ? "bg-green-100 text-green-800"
                : method === "PUT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
          }`}
        >
          {method}
        </span>
        <code className="text-sm font-mono bg-gray-100 p-1 rounded">{path}</code>
      </div>
      <p className="mb-4">{description}</p>

      {parameters.length > 0 && (
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
              {parameters.map((param, paramIndex) => (
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
        {responses.map((response, respIndex) => (
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
  )
}

