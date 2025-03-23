"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceStatus, type ServiceHealth } from "@/lib/integrations/service-registry"
import { useToast } from "@/hooks/use-toast"

export default function IntegrationsPage() {
  const { formatMessage } = useI18n()
  const router = useRouter()
  const { toast } = useToast()

  const [services, setServices] = useState<ServiceHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async (refresh = false) => {
    try {
      setRefreshing(refresh)
      const response = await fetch(`/api/integrations/status${refresh ? "?refresh=true" : ""}`)

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      toast({
        title: formatMessage("errors.fetchFailed"),
        description: formatMessage("errors.tryAgain"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchServices(true)
  }

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ONLINE:
        return "bg-green-500"
      case ServiceStatus.DEGRADED:
        return "bg-yellow-500"
      case ServiceStatus.OFFLINE:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ONLINE:
        return <Badge className="bg-green-500">Online</Badge>
      case ServiceStatus.DEGRADED:
        return <Badge className="bg-yellow-500">Degraded</Badge>
      case ServiceStatus.OFFLINE:
        return <Badge className="bg-red-500">Offline</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  const filteredServices =
    activeTab === "all" ? services : services.filter((service) => service.status === activeTab.toUpperCase())

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{formatMessage("admin.integrations.title")}</h1>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? formatMessage("common.refreshing") : formatMessage("common.refresh")}
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{formatMessage("admin.integrations.all")}</TabsTrigger>
          <TabsTrigger value="online">{formatMessage("admin.integrations.online")}</TabsTrigger>
          <TabsTrigger value="degraded">{formatMessage("admin.integrations.degraded")}</TabsTrigger>
          <TabsTrigger value="offline">{formatMessage("admin.integrations.offline")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-8">
              <p>{formatMessage("common.loading")}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <p>{formatMessage("admin.integrations.noServices")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>ID: {service.id}</CardDescription>
                      </div>
                      {getStatusBadge(service.status as ServiceStatus)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{formatMessage("admin.integrations.latency")}</span>
                        <span>{service.latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{formatMessage("admin.integrations.lastChecked")}</span>
                        <span>{new Date(service.lastChecked).toLocaleString()}</span>
                      </div>
                      {service.message && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">{formatMessage("admin.integrations.message")}:</p>
                          <p className="mt-1">{service.message}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => fetchServices(true)}>
                      {formatMessage("admin.integrations.checkNow")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

