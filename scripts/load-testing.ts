import autocannon from "autocannon"
import fs from "fs/promises"
import path from "path"

type LoadTestConfig = {
  name: string
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: string
  duration: number
  connections: number
  pipelining: number
  workers?: number
}

type LoadTestResult = {
  name: string
  url: string
  method: string
  timestamp: string
  duration: number
  connections: number
  pipelining: number
  workers: number
  requests: {
    total: number
    average: number
    mean: number
    stddev: number
    min: number
    max: number
    p50: number
    p75: number
    p90: number
    p99: number
    p999: number
    p9999: number
    sent: number
  }
  latency: {
    average: number
    mean: number
    stddev: number
    min: number
    max: number
    p50: number
    p75: number
    p90: number
    p99: number
    p999: number
    p9999: number
  }
  throughput: {
    average: number
    mean: number
    stddev: number
    min: number
    max: number
    total: number
  }
  errors: number
  timeouts: number
  mismatches: number
  non2xx: number
  resets: number
  "1xx": number
  "2xx": number
  "3xx": number
  "4xx": number
  "5xx": number
}

async function runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
  console.log(`Starting load test: ${config.name}`)
  console.log(`URL: ${config.url}`)
  console.log(`Method: ${config.method}`)
  console.log(`Duration: ${config.duration}s`)
  console.log(`Connections: ${config.connections}`)

  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: config.url,
      method: config.method,
      headers: config.headers || {},
      body: config.body,
      duration: config.duration,
      connections: config.connections,
      pipelining: config.pipelining || 1,
      workers: config.workers || 1,
      setupClient: (client) => {
        // Add any client setup logic here
        client.on("error", (error) => {
          console.error(`Client error: ${error.message}`)
        })
      },
    })

    // Track progress
    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: true,
      renderLatencyTable: true,
    })

    instance.on("done", (results) => {
      const testResult: LoadTestResult = {
        name: config.name,
        url: config.url,
        method: config.method,
        timestamp: new Date().toISOString(),
        duration: config.duration,
        connections: config.connections,
        pipelining: config.pipelining || 1,
        workers: config.workers || 1,
        ...results,
      }

      resolve(testResult)
    })

    instance.on("error", (error) => {
      console.error(`Test error: ${error.message}`)
      reject(error)
    })
  })
}

async function saveTestResults(results: LoadTestResult[]): Promise<void> {
  const resultsDir = path.join(process.cwd(), "load-test-results")
  await fs.mkdir(resultsDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filePath = path.join(resultsDir, `load-test-${timestamp}.json`)

  await fs.writeFile(filePath, JSON.stringify(results, null, 2))
  console.log(`Results saved to ${filePath}`)
}

async function main() {
  const baseUrl = process.env.LOAD_TEST_BASE_URL || "http://localhost:3000"

  // Define test scenarios
  const testConfigs: LoadTestConfig[] = [
    {
      name: "Home Page",
      url: `${baseUrl}/`,
      method: "GET",
      duration: 30,
      connections: 50,
      pipelining: 1,
    },
    {
      name: "API - Game List",
      url: `${baseUrl}/api/games`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      duration: 30,
      connections: 100,
      pipelining: 10,
    },
    {
      name: "API - User Profile",
      url: `${baseUrl}/api/user/profile`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LOAD_TEST_AUTH_TOKEN}`,
      },
      duration: 30,
      connections: 50,
      pipelining: 1,
    },
    {
      name: "API - Game Session Creation",
      url: `${baseUrl}/api/games/sessions`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LOAD_TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        gameId: "memory-matrix",
        difficulty: "medium",
      }),
      duration: 30,
      connections: 20,
      pipelining: 1,
    },
  ]

  const results: LoadTestResult[] = []

  for (const config of testConfigs) {
    try {
      const result = await runLoadTest(config)
      results.push(result)

      // Add a small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to run test "${config.name}":`, error)
    }
  }

  await saveTestResults(results)

  // Generate summary
  console.log("\n=== Load Test Summary ===")
  for (const result of results) {
    console.log(`\n${result.name} (${result.method} ${result.url}):`)
    console.log(`  Requests/sec: ${result.requests.average.toFixed(2)}`)
    console.log(`  Latency (avg): ${result.latency.average.toFixed(2)}ms`)
    console.log(`  Latency (p99): ${result.latency.p99.toFixed(2)}ms`)
    console.log(`  HTTP Errors: ${result.non2xx || 0}`)
    console.log(`  Timeouts: ${result.timeouts || 0}`)
  }
}

// Run the load tests
main().catch((error) => {
  console.error("Load test failed:", error)
  process.exit(1)
})

