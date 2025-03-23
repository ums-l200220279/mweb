import fs from "fs/promises"
import path from "path"
import { glob } from "glob"

// Define performance thresholds
const PERFORMANCE_THRESHOLDS = {
  latency: {
    p50: 100, // 50th percentile latency in ms
    p95: 300, // 95th percentile latency in ms
    p99: 500, // 99th percentile latency in ms
  },
  throughput: {
    min: 100, // Minimum requests per second
  },
  errorRate: {
    max: 0.01, // Maximum 1% error rate
  },
  successRate: {
    min: 0.99, // Minimum 99% success rate
  },
}

// Define test result types
type TestResult = {
  name: string
  url: string
  method: string
  timestamp: string
  requests: {
    total: number
    average: number
    p99: number
    sent: number
  }
  latency: {
    average: number
    p50: number
    p95: number
    p99: number
  }
  throughput: {
    average: number
    min: number
  }
  errors: number
  timeouts: number
  non2xx: number
  "2xx": number
  "4xx": number
  "5xx": number
}

type AnalysisResult = {
  testName: string
  url: string
  method: string
  timestamp: string
  metrics: {
    name: string
    value: number
    threshold: number
    status: "pass" | "warn" | "fail"
    unit: string
  }[]
  overallStatus: "pass" | "warn" | "fail"
  recommendations: string[]
}

async function findLatestTestResults(): Promise<string> {
  const resultsDir = path.join(process.cwd(), "load-test-results")
  const files = await glob("load-test-*.json", { cwd: resultsDir })

  if (files.length === 0) {
    throw new Error("No test results found")
  }

  // Sort files by timestamp (newest first)
  files.sort().reverse()

  return path.join(resultsDir, files[0])
}

async function analyzeTestResults(filePath: string): Promise<AnalysisResult[]> {
  // Read and parse the test results
  const fileContent = await fs.readFile(filePath, "utf-8")
  const testResults: TestResult[] = JSON.parse(fileContent)

  const analysisResults: AnalysisResult[] = []

  for (const result of testResults) {
    const totalRequests = result.requests.total
    const successfulRequests = result["2xx"] || 0
    const errorRequests = (result["4xx"] || 0) + (result["5xx"] || 0) + (result.errors || 0) + (result.timeouts || 0)
    const errorRate = errorRequests / totalRequests
    const successRate = successfulRequests / totalRequests

    const metrics = [
      {
        name: "Latency (p50)",
        value: result.latency.p50,
        threshold: PERFORMANCE_THRESHOLDS.latency.p50,
        status:
          result.latency.p50 <= PERFORMANCE_THRESHOLDS.latency.p50
            ? "pass"
            : result.latency.p50 <= PERFORMANCE_THRESHOLDS.latency.p50 * 1.5
              ? "warn"
              : "fail",
        unit: "ms",
      },
      {
        name: "Latency (p95)",
        value: result.latency.p95,
        threshold: PERFORMANCE_THRESHOLDS.latency.p95,
        status:
          result.latency.p95 <= PERFORMANCE_THRESHOLDS.latency.p95
            ? "pass"
            : result.latency.p95 <= PERFORMANCE_THRESHOLDS.latency.p95 * 1.5
              ? "warn"
              : "fail",
        unit: "ms",
      },
      {
        name: "Latency (p99)",
        value: result.latency.p99,
        threshold: PERFORMANCE_THRESHOLDS.latency.p99,
        status:
          result.latency.p99 <= PERFORMANCE_THRESHOLDS.latency.p99
            ? "pass"
            : result.latency.p99 <= PERFORMANCE_THRESHOLDS.latency.p99 * 1.5
              ? "warn"
              : "fail",
        unit: "ms",
      },
      {
        name: "Throughput",
        value: result.requests.average,
        threshold: PERFORMANCE_THRESHOLDS.throughput.min,
        status:
          result.requests.average >= PERFORMANCE_THRESHOLDS.throughput.min
            ? "pass"
            : result.requests.average >= PERFORMANCE_THRESHOLDS.throughput.min * 0.8
              ? "warn"
              : "fail",
        unit: "req/s",
      },
      {
        name: "Error Rate",
        value: errorRate,
        threshold: PERFORMANCE_THRESHOLDS.errorRate.max,
        status:
          errorRate <= PERFORMANCE_THRESHOLDS.errorRate.max
            ? "pass"
            : errorRate <= PERFORMANCE_THRESHOLDS.errorRate.max * 2
              ? "warn"
              : "fail",
        unit: "%",
      },
      {
        name: "Success Rate",
        value: successRate,
        threshold: PERFORMANCE_THRESHOLDS.successRate.min,
        status:
          successRate >= PERFORMANCE_THRESHOLDS.successRate.min
            ? "pass"
            : successRate >= PERFORMANCE_THRESHOLDS.successRate.min * 0.95
              ? "warn"
              : "fail",
        unit: "%",
      },
    ]

    // Determine overall status
    const hasFailures = metrics.some((m) => m.status === "fail")
    const hasWarnings = metrics.some((m) => m.status === "warn")
    const overallStatus = hasFailures ? "fail" : hasWarnings ? "warn" : "pass"

    // Generate recommendations
    const recommendations: string[] = []

    if (result.latency.p99 > PERFORMANCE_THRESHOLDS.latency.p99) {
      recommendations.push("High p99 latency detected. Consider optimizing database queries or implementing caching.")
    }

    if (result.latency.average > PERFORMANCE_THRESHOLDS.latency.p50 * 1.5) {
      recommendations.push(
        "Average latency is significantly higher than median (p50). Check for outliers or slow operations.",
      )
    }

    if (errorRate > PERFORMANCE_THRESHOLDS.errorRate.max) {
      recommendations.push(
        `High error rate (${(errorRate * 100).toFixed(2)}%). Investigate error responses and fix underlying issues.`,
      )
    }

    if (result.requests.average < PERFORMANCE_THRESHOLDS.throughput.min) {
      recommendations.push("Low throughput detected. Consider scaling horizontally or optimizing request handling.")
    }

    if (result.timeouts > 0) {
      recommendations.push(
        `${result.timeouts} request timeouts detected. Check for long-running operations or increase timeout settings.`,
      )
    }

    analysisResults.push({
      testName: result.name,
      url: result.url,
      method: result.method,
      timestamp: result.timestamp,
      metrics,
      overallStatus,
      recommendations,
    })
  }

  return analysisResults
}

async function generateReport(analysisResults: AnalysisResult[]): Promise<void> {
  const reportDir = path.join(process.cwd(), "load-test-results", "reports")
  await fs.mkdir(reportDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const reportPath = path.join(reportDir, `performance-report-${timestamp}.md`)

  let reportContent = `# Performance Test Report\n\n`
  reportContent += `Generated: ${new Date().toISOString()}\n\n`

  // Add summary
  const overallStatus = analysisResults.some((r) => r.overallStatus === "fail")
    ? "❌ FAIL"
    : analysisResults.some((r) => r.overallStatus === "warn")
      ? "⚠️ WARNING"
      : "✅ PASS"

  reportContent += `## Summary\n\n`
  reportContent += `Overall Status: ${overallStatus}\n\n`

  // Add test results
  reportContent += `## Test Results\n\n`

  for (const result of analysisResults) {
    const statusEmoji = result.overallStatus === "fail" ? "❌" : result.overallStatus === "warn" ? "⚠️" : "✅"

    reportContent += `### ${statusEmoji} ${result.testName} (${result.method} ${result.url})\n\n`
    reportContent += `Timestamp: ${result.timestamp}\n\n`

    // Add metrics table
    reportContent += `| Metric | Value | Threshold | Status |\n`
    reportContent += `| ------ | ----- | --------- | ------ |\n`

    for (const metric of result.metrics) {
      const statusEmoji = metric.status === "fail" ? "❌" : metric.status === "warn" ? "⚠️" : "✅"

      const formattedValue = metric.name.includes("Rate")
        ? `${(metric.value * 100).toFixed(2)}%`
        : `${metric.value.toFixed(2)} ${metric.unit}`

      const formattedThreshold = metric.name.includes("Rate")
        ? `${(metric.threshold * 100).toFixed(2)}%`
        : `${metric.threshold} ${metric.unit}`

      reportContent += `| ${metric.name} | ${formattedValue} | ${formattedThreshold} | ${statusEmoji} |\n`
    }

    reportContent += `\n`

    // Add recommendations
    if (result.recommendations.length > 0) {
      reportContent += `#### Recommendations\n\n`

      for (const recommendation of result.recommendations) {
        reportContent += `- ${recommendation}\n`
      }

      reportContent += `\n`
    }
  }

  // Write report to file
  await fs.writeFile(reportPath, reportContent)
  console.log(`Performance report generated: ${reportPath}`)

  // If CI environment, output report to console
  if (process.env.CI === "true") {
    console.log("\n" + reportContent)
  }
}

async function main() {
  try {
    console.log("Analyzing load test results...")

    // Find the latest test results
    const resultsPath = process.env.RESULTS_PATH || (await findLatestTestResults())
    console.log(`Using test results from: ${resultsPath}`)

    // Analyze the results
    const analysisResults = await analyzeTestResults(resultsPath)

    // Generate a report
    await generateReport(analysisResults)

    // Determine exit code based on overall status
    const hasFailures = analysisResults.some((r) => r.overallStatus === "fail")

    if (hasFailures) {
      console.error("❌ Performance test analysis failed. See report for details.")
      process.exit(1)
    } else {
      console.log("✅ Performance test analysis completed successfully.")
      process.exit(0)
    }
  } catch (error) {
    console.error("Error analyzing test results:", error)
    process.exit(1)
  }
}

// Run the analysis
main()

