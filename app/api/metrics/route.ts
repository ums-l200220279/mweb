/**
 * Metrics API untuk Memoright
 *
 * Endpoint untuk mengekspos metrik aplikasi dalam format Prometheus.
 *
 * @description Mengekspos metrik aplikasi dalam format Prometheus
 * @tags System
 * @response {200} Metrik berhasil diambil
 * @response {500} Gagal mengambil metrik
 */

import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { container } from "@/lib/architecture/dependency-injection"
import type { ObservabilityService } from "@/lib/monitoring/observability-service"

export async function GET(req: NextRequest) {
  try {
    // Dapatkan observability service
    const observabilityService = container.resolve<ObservabilityService>("observabilityService")

    // Dapatkan semua metrik
    const metrics = observabilityService.getAllMetrics()

    // Konversi ke format Prometheus
    const prometheusMetrics = convertToPrometheusFormat(metrics)

    // Kembalikan metrik
    return new NextResponse(prometheusMetrics, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    logger.error("Failed to get metrics", error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Failed to get metrics" }, { status: 500 })
  }
}

/**
 * Konversi metrik ke format Prometheus
 */
function convertToPrometheusFormat(metrics: any[]): string {
  let output = ""

  for (const metric of metrics) {
    // Tambahkan komentar untuk metrik
    output += `# HELP ${metric.name} ${metric.description}\n`
    output += `# TYPE ${metric.name} ${mapMetricTypeToPrometheus(metric.type)}\n`

    // Tambahkan nilai metrik
    for (const value of metric.values) {
      const labels = formatLabels(value.labels)
      output += `${metric.name}${labels} ${value.value}\n`
    }

    output += "\n"
  }

  return output
}

/**
 * Map tipe metrik ke tipe Prometheus
 */
function mapMetricTypeToPrometheus(type: string): string {
  switch (type) {
    case "counter":
      return "counter"
    case "gauge":
      return "gauge"
    case "histogram":
      return "histogram"
    default:
      return "untyped"
  }
}

/**
 * Format label untuk format Prometheus
 */
function formatLabels(labels?: Record<string, string>): string {
  if (!labels || Object.keys(labels).length === 0) {
    return ""
  }

  const labelPairs = Object.entries(labels).map(([key, value]) => `${key}="${escapeValue(value)}"`)
  return `{${labelPairs.join(",")}}`
}

/**
 * Escape nilai untuk format Prometheus
 */
function escapeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
}

