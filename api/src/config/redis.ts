import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis:6379";
const [host, port] = REDIS_URL.split(":");

export const redisConnection = {
  host,
  port: Number(port) || 6379,
};

export const redis = new Redis({
  ...redisConnection,
  maxRetriesPerRequest: null,
});
