import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { CommercialDocument, type CommercialPdfData } from "@/lib/pdf/commercial-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function number(value: number | string | null | undefined) { return Number(value ?? 0); }
function logoData(bytes: Buffer) { return `data:image/png;base64,${bytes.toString("base64")}`; }
function filename(reference: string) { return `${reference.replace(/[^A-Za-z0-9._-]/g, "-")}.pdf`; }

export async function GET(request: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind: requestedKind, id } = await params;
  if (!(["proposal", "quote", "invoice"] as const).includes(requestedKind as "proposal" | "quote" | "invoice")) {
    return new Response("Unsupported document type", { status: 404 });
  }
  const kind = requestedKind as CommercialPdfData["kind"];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorised", { status: 401 });

  const logo = logoData(await readFile(path.join(process.cwd(), "public/brand/tide-logo-dark-bg.png")));
  const generatedAt = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
  let pdfData: CommercialPdfData | null = null;

  if (kind === "quote") {
    const { data } = await supabase.from("quotes").select("*, organisations(name, client_reference), events(name, event_reference, venue), quote_items(*)").eq("id", id).maybeSingle();
    if (data) {
      const org = data.organisations as { name: string; client_reference: string } | null;
      const event = data.events as { name: string; event_reference: string; venue: string | null } | null;
      pdfData = { kind, reference: data.quote_reference, title: data.title, status: data.status, clientName: org?.name ?? "Client", clientReference: org?.client_reference ?? "Not assigned", eventName: event?.name, eventReference: event?.event_reference, venue: event?.venue, issueDate: data.issue_date, validUntil: data.valid_until, notes: data.notes, terms: data.terms, acceptedBy: data.accepted_by_name, acceptedAt: data.accepted_at, currency: data.currency, subtotal: number(data.subtotal), taxTotal: number(data.tax_total), total: number(data.total), items: data.quote_items.sort((a, b) => a.position - b.position).map((item) => ({ description: item.description, quantity: number(item.quantity), unitPrice: number(item.unit_price), taxRate: number(item.tax_rate) })), logoData: logo, generatedAt };
    }
  } else if (kind === "proposal") {
    const { data } = await supabase.from("proposals").select("*, organisations(name, client_reference), events(name, event_reference, venue), proposal_services(*)").eq("id", id).maybeSingle();
    if (data) {
      const org = data.organisations as { name: string; client_reference: string } | null;
      const event = data.events as { name: string; event_reference: string; venue: string | null } | null;
      pdfData = { kind, reference: data.proposal_reference, title: data.title, status: data.status, clientName: org?.name ?? "Client", clientReference: org?.client_reference ?? "Not assigned", eventName: event?.name, eventReference: event?.event_reference, venue: event?.venue, validUntil: data.valid_until, summary: data.summary, scope: data.scope, assumptions: data.assumptions, terms: data.terms, services: data.proposal_services.sort((a, b) => a.position - b.position).map((service) => ({ name: service.service_name, description: service.description })), acceptedBy: data.accepted_by_name, acceptedAt: data.accepted_at, logoData: logo, generatedAt };
    }
  } else {
    const { data } = await supabase.from("invoices").select("*, organisations(name, client_reference), events(name, event_reference, venue), invoice_items(*), payments(*)").eq("id", id).maybeSingle();
    if (data) {
      const org = data.organisations as { name: string; client_reference: string } | null;
      const event = data.events as { name: string; event_reference: string; venue: string | null } | null;
      pdfData = { kind, reference: data.invoice_reference, title: data.title, status: data.status, clientName: org?.name ?? "Client", clientReference: org?.client_reference ?? "Not assigned", eventName: event?.name, eventReference: event?.event_reference, venue: event?.venue, issueDate: data.issue_date, dueDate: data.due_date, notes: data.notes, paymentTerms: data.payment_terms, currency: data.currency, subtotal: number(data.subtotal), taxTotal: number(data.tax_total), total: number(data.total), amountPaid: number(data.amount_paid), balanceDue: number(data.balance_due), items: data.invoice_items.sort((a, b) => a.position - b.position).map((item) => ({ description: item.description, quantity: number(item.quantity), unitPrice: number(item.unit_price), taxRate: number(item.tax_rate) })), payments: data.payments.sort((a, b) => b.paid_on.localeCompare(a.paid_on)).map((payment) => ({ reference: payment.payment_reference, date: payment.paid_on, method: payment.method, externalReference: payment.external_reference, amount: number(payment.amount) })), logoData: logo, generatedAt };
    }
  }

  if (!pdfData) return new Response("Document not found", { status: 404 });
  const buffer = await renderToBuffer(CommercialDocument({ data: pdfData }));
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  return new Response(new Uint8Array(buffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="${filename(pdfData.reference)}"`, "Cache-Control": "private, no-store" } });
}
