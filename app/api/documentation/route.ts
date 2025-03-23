/**
 * API Documentation untuk Memoright
 *
 * Endpoint untuk menghasilkan dan menampilkan dokumentasi API.
 *
 * @description Menghasilkan dan menampilkan dokumentasi API
 * @tags System
 * @response {200} Dokumentasi berhasil diambil
 * @response {500} Gagal mengambil dokumentasi
 */

import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import path from "path"
import { ApiDocumentationGenerator } from "@/lib/documentation/api-documentation-generator"

export async function GET(req: NextRequest) {
  try {
    // Buat generator dokumentasi
    const generator = new ApiDocumentationGenerator({
      title: "Memoright API",
      version: process.env.APP_VERSION || "1.0.0",
      description: "API untuk aplikasi Memoright",
      servers: [
        {
          url: process.env.API_BASE_URL || "https://api.memoright.com",
          description: "Production API Server",
        },
        {
          url: "https://staging-api.memoright.com",
          description: "Staging API Server",
        },
        {
          url: "http://localhost:3000",
          description: "Development API Server",
        },
      ],
      apiRoutesDir: path.join(process.cwd(), "app", "api"),
    })

    // Generate dokumentasi
    const documentation = await generator.generate()

    // Kembalikan dokumentasi
    return NextResponse.json(documentation)
  } catch (error) {
    logger.error("Failed to generate API documentation", error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Failed to generate API documentation" }, { status: 500 })
  }
}

