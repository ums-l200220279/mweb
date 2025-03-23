import { handleHealthCheck } from "@/lib/observability/health-checks"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return handleHealthCheck(req)
}

