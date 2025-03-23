"use client"

import { useEffect, useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocs() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch("/api/docs")
      .then((response) => response.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error("Failed to load API docs:", error))
  }, [])

  if (!spec) {
    return <div className="p-8 text-center">Loading API documentation...</div>
  }

  return (
    <div className="api-docs-container">
      <SwaggerUI spec={spec} />
    </div>
  )
}

