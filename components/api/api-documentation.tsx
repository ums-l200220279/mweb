"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateMemorightAPIDocumentation } from "@/lib/api/openapi"

export function APIDocumentation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [activeEndpoint, setActiveEndpoint] = useState('/patients')
  const [activeMethod, setActiveMethod] = useState('get')
  
  const apiDoc = generateMemorightAPIDocumentation()
  
  const renderEndpointList = () => {
    return Object.entries(apiDoc.paths).map(([path, pathItem]) => (
      <div key={path} className="mb-4">
        <h3 className="text-sm font-semibold mb-2">{path}</h3>
        <div className="space-y-1">
          {pathItem.get && (
            <Button
              variant={activeEndpoint === path && activeMethod === 'get' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setActiveEndpoint(path)
                setActiveMethod('get')
              }}
            >
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded text-xs font-bold mr-2">GET</span>
              {pathItem.get.summary || path}
            </Button>
          )}
          {pathItem.post && (
            <Button
              variant={activeEndpoint === path && activeMethod === 'post' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setActiveEndpoint(path)
                setActiveMethod('post')
              }}
            >
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded text-xs font-bold mr-2">POST</span>
              {pathItem.post.summary || path}
            </Button>
          )}
          {pathItem.put && (
            <Button
              variant={activeEndpoint === path && activeMethod === 'put' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setActiveEndpoint(path)
                setActiveMethod('put')
              }}
            >
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 px-2 py-0.5 rounded text-xs font-bold mr-2">PUT</span>
              {pathItem.put.summary || path}
            </Button>
          )}
          {pathItem.delete && (
            <Button
              variant={activeEndpoint === path && activeMethod === 'delete' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setActiveEndpoint(path)
                setActiveMethod('delete')
              }}
            >
              <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 px-2 py-0.5 rounded text-xs font-bold mr-2">DELETE</span>
              {pathItem.delete.summary || path}
            </Button>
          )}
        </div>
      </div>
    ))
  }
  
  const renderEndpointDetails = () => {
    const pathItem = apiDoc.paths[activeEndpoint]
    if (!pathItem) return null
    
    const operation = pathItem[activeMethod as keyof typeof pathItem] as any
    if (!operation) return null
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">
            <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold mr-2 ${
              activeMethod === 'get' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
              activeMethod === 'post' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
              activeMethod === 'put' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}>
              {activeMethod.toUpperCase()}
            </span>
            {activeEndpoint}
          </h2>
          <p className="text-muted-foreground">{operation.description || operation.summary}</p>
        </div>
        
        {operation.parameters && operation.parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Parameters</h3>
            <div className="border rounded-md">
              <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50">
                <div className="font-medium">Name</div>
                <div className="font-medium">Location</div>
                <div className="font-medium">Type</div>
                <div className="font-medium">Required</div>
              </div>
              {operation.parameters.map((param: any) => (\

