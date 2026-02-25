import { paymentQueue } from "../queue/paymentQueue";
import { getPaymentsSummary, purgePayments } from "../services/paymentService";

export async function handleCreatePayment(req: Request) {
  const body = (await req.json()) as { correlationId: string; amount: number };

  paymentQueue.add("process-payment", {
    correlationId: body.correlationId,
    amount: body.amount,
  });

  return new Response(null, { status: 202 });
}

export async function handleGetSummary(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  const summary = await getPaymentsSummary(from, to);
  return Response.json(summary);
}

export async function handlePurgePayments() {
  const result = await purgePayments();
  return Response.json(result);
}

export function handleHealth() {
  return Response.json({ status: "ok" });
}
