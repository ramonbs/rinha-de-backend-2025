import { redis } from "../config/redis";

async function getProcessorSummary(processor: string, from: string, to: string) {
  const fromTs = new Date(from).getTime();
  const toTs = new Date(to).getTime();
  const fromScore = isNaN(fromTs) ? "-inf" : fromTs;
  const toScore = isNaN(toTs) ? "+inf" : toTs;

  const entries = await redis.zrangebyscore(`payments:${processor}:timestamps`, fromScore, toScore);

  let totalAmount = 0;
  let totalRequests = 0;

  for (const entry of entries) {
    const data = JSON.parse(entry);
    totalAmount += data.amount;
    totalRequests++;
  }

  return { totalAmount: Number(totalAmount.toFixed(2)), totalRequests };
}

export async function getPaymentsSummary(from: string, to: string) {
  const [defaultSummary, fallbackSummary] = await Promise.all([
    getProcessorSummary("default", from, to),
    getProcessorSummary("fallback", from, to),
  ]);

  return { default: defaultSummary, fallback: fallbackSummary };
}

export async function purgePayments() {
  const keys = await redis.keys("payments:*");
  if (keys.length > 0) await redis.del(...keys);
  return { status: "purged" };
}
