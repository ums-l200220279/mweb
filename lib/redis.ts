import { Redis } from "@upstash/redis"

// Create Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

export { redis }

