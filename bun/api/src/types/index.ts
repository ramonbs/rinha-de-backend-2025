type PaymentPayload = {
  correlationId: string
  amount: number
}

type PaymentSummaryQuery = {
  from?: string
  to?: string
}

type PaymentSummary = {
  totalRequests: number
  totalAmount: number
}

export type {
    PaymentPayload,
    PaymentSummary,
    PaymentSummaryQuery
}
