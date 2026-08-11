export function formatMoney(value: number | string | null | undefined, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export function formatBusinessDate(value: string | null | undefined) {
  return value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

export const opportunityStages = ["lead", "qualified", "proposal", "negotiation", "won", "lost"] as const;
export const proposalStatuses = ["draft", "sent", "viewed", "accepted", "declined", "expired"] as const;
export const quoteStatuses = ["draft", "sent", "accepted", "declined", "expired", "superseded"] as const;
export const invoiceStatuses = ["draft", "sent", "part_paid", "paid", "overdue", "void"] as const;

export function humanise(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}
