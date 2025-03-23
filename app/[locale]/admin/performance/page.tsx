"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"
import { LineChart, PieChart } from "@/components/charts"
import { Loader2 } from "lucide-react"

type TimeRange = "1h" | "24h" | "7d" | "30d" | "custom"
type MetricType = "latency" | "throughput" | "errors" | "memory" | "cpu"

type MetricData = {
  timestamp: string
  value: number
}

type ErrorDistribution = {
  type: string
  count: number
  percentage: number
}

type PerformanceData = {
  latency: {
    p50: MetricData[]
    p95: MetricData[]
    p99: MetricData[]
  }
  throughput: {
    requests: MetricData[]
    successRate: MetricData[]
  }
  errors: {
    count: MetricData[]
    distribution: ErrorDistribution[]
  }
  resources: {
    memory: MetricData[]
    cpu: MetricData[]
    disk: MetricData[]
  }
}

export default function PerformanceDashboard() {
  const { formatMessage } = useI18n()
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("all")
  const [endpoints, setEndpoints] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPerformanceData()
  }, [timeRange, selectedEndpoint])

  const fetchPerformanceData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch endpoints if not already loaded
      if (endpoints.length === 0) {
        const endpointsResponse = await fetch("/api/admin/performance/endpoints")
        if (!endpointsResponse.ok) {
          throw new Error("Failed to fetch endpoints")
        }
        const endpointsData = await endpointsResponse.json()
        setEndpoints(["all", ...endpointsData])
      }

      // Fetch performance data
      const response = await fetch(`/api/admin/performance/metrics?timeRange=${timeRange}&endpoint=${selectedEndpoint}`)

      if (!response.ok) {
        throw new Error("Failed to fetch performance data")
      }

      const data = await response.json()
      setPerformanceData(data)
    } catch (err) {
      console.error("Error fetching performance data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchPerformanceData()
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange)
  }

  const handleEndpointChange = (value: string) => {
    setSelectedEndpoint(value)
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{formatMessage("admin.performance.errorTitle")}</CardTitle>
            <CardDescription>{formatMessage("admin.performance.errorDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
            <Button onClick={handleRefresh} className="mt-4">
              {formatMessage("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{formatMessage("admin.performance.title")}</h1>
          <p className="text-gray-500">{formatMessage("admin.performance.description")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedEndpoint} onValueChange={handleEndpointChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={formatMessage("admin.performance.selectEndpoint")} />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map((endpoint) => (
                <SelectItem key={endpoint} value={endpoint}>
                  {endpoint === "all" ? formatMessage("admin.performance.allEndpoints") : endpoint}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={formatMessage("admin.performance.selectTimeRange")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">{formatMessage("admin.performance.lastHour")}</SelectItem>
              <SelectItem value="24h">{formatMessage("admin.performance.last24Hours")}</SelectItem>
              <SelectItem value="7d">{formatMessage("admin.performance.last7Days")}</SelectItem>
              <SelectItem value="30d">{formatMessage("admin.performance.last30Days")}</SelectItem>
              <SelectItem value="custom">{formatMessage("admin.performance.custom")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : formatMessage("common.refresh")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{formatMessage("admin.performance.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="latency">{formatMessage("admin.performance.tabs.latency")}</TabsTrigger>
          <TabsTrigger value="throughput">{formatMessage("admin.performance.tabs.throughput")}</TabsTrigger>
          <TabsTrigger value="errors">{formatMessage("admin.performance.tabs.errors")}</TabsTrigger>
          <TabsTrigger value="resources">{formatMessage("admin.performance.tabs.resources")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {formatMessage("admin.performance.metrics.avgLatency")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {performanceData?.latency.p50.length
                      ? `${performanceData.latency.p50[performanceData.latency.p50.length - 1].value.toFixed(2)} ms`
                      : "N/A"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {formatMessage("admin.performance.metrics.throughput")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {performanceData?.throughput.requests.length
                      ? `${performanceData.throughput.requests[performanceData.throughput.requests.length - 1].value.toFixed(2)} req/s`
                      : "N/A"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {formatMessage("admin.performance.metrics.errorRate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {performanceData?.errors.count.length && performanceData?.throughput.requests.length
                      ? `${(
                          (performanceData.errors.count[performanceData.errors.count.length - 1].value /
                            performanceData.throughput.requests[performanceData.throughput.requests.length - 1].value) *
                            100
                        ).toFixed(2)}%`
                      : "0.00%"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {formatMessage("admin.performance.metrics.cpuUsage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {performanceData?.resources.cpu.length
                      ? `${performanceData.resources.cpu[performanceData.resources.cpu.length - 1].value.toFixed(2)}%`
                      : "N/A"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.latencyOverTime")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.latency || { p50: [], p95: [], p99: [] }}
                    height={300}
                    yAxisLabel="ms"
                    series={["p50", "p95", "p99"]}
                    colors={["#3b82f6", "#f59e0b", "#ef4444"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.throughputOverTime")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.throughput || { requests: [], successRate: [] }}
                    height={300}
                    yAxisLabel="req/s"
                    series={["requests"]}
                    colors={["#10b981"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="latency" className="space-y-4">
          {/* Latency tab content */}
          <Card>
            <CardHeader>
              <CardTitle>{formatMessage("admin.performance.charts.latencyDistribution")}</CardTitle>
              <CardDescription>{formatMessage("admin.performance.charts.latencyDistributionDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <LineChart
                  data={performanceData?.latency || { p50: [], p95: [], p99: [] }}
                  height={400}
                  yAxisLabel="ms"
                  series={["p50", "p95", "p99"]}
                  colors={["#3b82f6", "#f59e0b", "#ef4444"]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput" className="space-y-4">
          {/* Throughput tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.requestRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.throughput || { requests: [], successRate: [] }}
                    height={300}
                    yAxisLabel="req/s"
                    series={["requests"]}
                    colors={["#10b981"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.successRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.throughput || { requests: [], successRate: [] }}
                    height={300}
                    yAxisLabel="%"
                    series={["successRate"]}
                    colors={["#3b82f6"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {/* Errors tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.errorRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.errors || { count: [], distribution: [] }}
                    height={300}
                    yAxisLabel="count"
                    series={["count"]}
                    colors={["#ef4444"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.errorDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : performanceData?.errors.distribution.length ? (
                  <PieChart
                    data={performanceData.errors.distribution.map((item) => ({
                      name: item.type,
                      value: item.count,
                    }))}
                    height={300}
                    colors={["#ef4444", "#f59e0b", "#3b82f6", "#a855f7", "#ec4899"]}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[300px] text-gray-500">
                    {formatMessage("admin.performance.noErrorData")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {/* Resources tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.cpuUsage")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.resources || { memory: [], cpu: [], disk: [] }}
                    height={300}
                    yAxisLabel="%"
                    series={["cpu"]}
                    colors={["#ef4444"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{formatMessage("admin.performance.charts.memoryUsage")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <LineChart
                    data={performanceData?.resources || { memory: [], cpu: [], disk: [] }}
                    height={300}
                    yAxisLabel="MB"
                    series={["memory"]}
                    colors={["#3b82f6"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{formatMessage("admin.performance.charts.diskUsage")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <LineChart
                  data={performanceData?.resources || { memory: [], cpu: [], disk: [] }}
                  height={300}
                  yAxisLabel="%"
                  series={["disk"]}
                  colors={["#10b981"]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

