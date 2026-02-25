import {
  handleCreatePayment,
  handleGetSummary,
  handlePurgePayments,
  handleHealth,
} from "../controllers/paymentController";

export async function router(req: Request): Promise<Response | null> {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/payments") {
    return handleCreatePayment(req);
  }

  if (req.method === "GET" && url.pathname === "/payments-summary") {
    return handleGetSummary(req);
  }

  if (req.method === "POST" && url.pathname === "/purge-payments") {
    return handlePurgePayments();
  }

  if (req.method === "GET" && url.pathname === "/health") {
    return handleHealth();
  }

  return null;
}
