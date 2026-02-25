import { Worker } from "bullmq";
import CircuitBreaker from "opossum";
import { Agent, Pool, request } from "undici";
import { redis, redisConnection } from "../config/redis";
import type { PaymentPayload } from "../types";

const PAYMENT_PROCESSOR_DEFAULT_URL =
  process.env.PAYMENT_PROCESSOR_DEFAULT_URL || "http://localhost:8001"
const PAYMENT_PROCESSOR_FALLBACK_URL =
  process.env.PAYMENT_PROCESSOR_FALLBACK_URL || "http://localhost:8002"

const dispatcher = new Agent({
  connectTimeout: 5_000,
  factory(origin, opts) {
    return new Pool(origin, {
      ...opts,
      connections: 10,
      allowH2: true,
      keepAliveTimeout: 30_000,
    })
  },
})

async function sendToProcessor(
  url: string,
  payload: PaymentPayload,
  processorName: "default" | "fallback"
) {
  const requestedAt = new Date().toISOString()

  const response = await request(`${url}/payments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, requestedAt }),
    dispatcher,
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`[${processorName}] HTTP ${response.statusCode}`);
  }

  const timestamp = new Date(requestedAt).getTime()

  await redis
    .multi()
    .incr(`payments:${processorName}:totalRequests`)
    .incrbyfloat(`payments:${processorName}:totalAmount`, payload.amount)
    .zadd(`payments:${processorName}:timestamps`, timestamp, JSON.stringify(payload))
    .exec()
}

async function sendToDefault(payload: PaymentPayload) {
  await sendToProcessor(PAYMENT_PROCESSOR_DEFAULT_URL, payload, "default")
}

async function sendToFallback(payload: PaymentPayload) {
  await sendToProcessor(PAYMENT_PROCESSOR_FALLBACK_URL, payload, "fallback")
}

const cb = new CircuitBreaker(sendToDefault, {
  timeout: 500,
  errorThresholdPercentage: 40,
  resetTimeout: 1000,
});

cb.fallback(sendToFallback);

const worker = new Worker("payments", async (job) => {
  const { correlationId, amount } = job.data as PaymentPayload;
  await cb.fire({ correlationId, amount });
}, { connection: redisConnection, concurrency: 10 });

export default worker;
