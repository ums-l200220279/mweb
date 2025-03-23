import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { validateRequest } from "@/app/api/validate"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db"
import { container } from "@/lib/architecture/dependency-injection"
import type { FeatureFlagService } from "@/lib/feature-flags/feature-flag-service"

// Schema untuk feature flag
const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  conditions: z
    .object({
      userIds: z.array(z.string()).optional(),
      userRoles: z.array(z.string()).optional(),
      percentage: z.number().min(0).max(100).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      environments: z.array(z.string()).optional(),
    })
    .optional(),
})

/**
 * Mendapatkan semua feature flags
 * GET /api/feature-flags
 */
export async function GET(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions)

    // Hanya admin yang dapat melihat semua feature flags
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Dapatkan feature flags dari database
    const featureFlags = await db.featureFlag.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(featureFlags)
  } catch (error) {
    logger.error("Error getting feature flags", error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Membuat feature flag baru
 * POST /api/feature-flags
 */
export async function POST(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions);
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions);
    
    // Hanya admin yang dapat membuat feature flag
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validasi request body
    const validation = await validateRequest(req, featureFlagSchema);
    
    if (!validation.success) {
      return validation.error;
    }
    
    const { id, name, description, enabled, conditions } = validation.data;
    
    // Periksa apakah ID sudah digunakan
    const existingFlag = await db.featureFlag.findUnique({
      where: { id },
    });
    
    if (existingFlag) {
      return NextResponse.json(
        { error: 'Feature flag with this ID already exists' },
        { status: 400 }
      );
    }
    
    // Buat feature flag baru
    const featureFlag = await db.featureFlag.create({
      data: {
        id,
        name,
        description: description || '',
        enabled,
        conditions: conditions || {},
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });
    
    // Refresh feature flag service
    const featureFlagService = container.resolve<FeatureFlagService>('featureFlagService');
    await featureFlagService.initialize();
    
    return NextResponse.json(featureFlag, { status: 201 });
  } catch (error) {
    logger.error(
      'Error creating feature flag',
      error instanceof Error ? error : new Error(String(error))
    );
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

/**
 * Memperbarui feature flag
 * PUT /api/feature-flags/:id
 */
export async function PUT(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions);
    
    // Hanya admin yang dapat memperbarui feature flag
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Dapatkan ID dari URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feature flag ID is required' },
        { status: 400 }
      );
    }
    
    // Validasi request body
    const validation = await validateRequest(req, featureFlagSchema.omit({ id: true }));
    
    if (!validation.success) {
      return validation.error;
    }
    
    const { name, description, enabled, conditions } = validation.data;
    
    // Periksa apakah feature flag ada
    const existingFlag = await db.featureFlag.findUnique({
      where: { id },
    });
    
    if (!existingFlag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      );
    }
    
    // Perbarui feature flag
    const featureFlag = await db.featureFlag.update({
      where: { id },
      data: {
        name,
        description: description || '',
        enabled,
        conditions: conditions || {},
        updatedBy: session.user.id,
        updatedAt: new Date(),
      },
    });
    
    // Refresh feature flag service
    const featureFlagService = container.resolve<FeatureFlagService>('featureFlagService');
    await featureFlagService.initialize();
    
    return NextResponse.json(featureFlag);
  } catch (error) {
    logger.error(
      'Error updating feature flag',
      error instanceof Error ? error : new Error(String(error))
    );
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Menghapus feature flag
 * DELETE /api/feature-flags/:id
 */
export async function DELETE(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions);
    
    // Hanya admin yang dapat menghapus feature flag
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Dapatkan ID dari URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feature flag ID is required' },
        { status: 400 }
      );
    }
    
    // Periksa apakah feature flag ada
    const existingFlag = await db.featureFlag.findUnique({
      where: { id },
    });
    
    if (!existingFlag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      );
    }
    
    // Hapus feature flag
    await db.featureFlag.delete({
      where: { id },
    });
    
    // Refresh feature flag service
    const featureFlagService = container.resolve<FeatureFlagService>('featureFlagService');
    await featureFlagService.initialize();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      'Error deleting feature flag',
      error instanceof Error ? error : new Error(String(error))
    );
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

