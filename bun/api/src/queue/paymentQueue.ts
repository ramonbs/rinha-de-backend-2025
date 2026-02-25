import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const paymentQueue = new Queue("payments", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 1,
  },
});
