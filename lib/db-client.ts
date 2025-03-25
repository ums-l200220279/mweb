import { PrismaClient } from "@prisma/client"
import { logger } from "@/lib/logger"

// Extend PrismaClient with query logging
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now()
          const result = await query(args)
          const end = performance.now()
          const duration = end - start

          // Log slow queries (over 100ms)
          if (duration > 100) {
            logger.warn(`Slow query detected: ${model}.${operation}`, {
              model,
              operation,
              duration: `${duration.toFixed(2)}ms`,
              args: JSON.stringify(args),
            })
          }

          return result
        },
      },
    },
  })
}

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: ReturnType<typeof prismaClientSingleton> }

const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Log query events
prisma.$on("query", (e: any) => {
  logger.debug("Prisma Query", {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
  })
})

// Log error events
prisma.$on("error", (e: any) => {
  logger.error("Prisma Error", {
    message: e.message,
    target: e.target,
  })
})

// Add to global in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

