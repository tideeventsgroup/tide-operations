"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type OpportunityStage = Database["public"]["Enums"]["opportunity_stage"];
type ProposalStatus = Database["public"]["Enums"]["proposal_status"];
type QuoteStatus = Database["public"]["Enums"]["quote_status"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type PaymentMethod = Database["public"]["Enums"]["payment_method"];

const requiredText = z.string().trim().min(1).max(500);
const optionalText = (value: FormDataEntryValue | null) => {
  const parsed = typeof value === "string" ? value.trim() : "";
  return parsed || null;
};
const optionalDate = (value: FormDataEntryValue | null) => {
  const parsed = optionalText(value);
  return parsed && /^\d{4}-\d{2}-\d{2}$/.test(parsed) ? parsed : null;
};
const money = (value: FormDataEntryValue | null) => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error("Enter a valid amount");
  return Math.round(parsed * 100) / 100;
};

async function managerClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !["admin", "manager"].includes(profile.staff_role ?? "")) {
    throw new Error("Manager access is required");
  }
  return { supabase, user };
}

async function getDefaultTerms(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("commercial_terms_templates").select("body").eq("active", true).eq("is_default", true).limit(1).maybeSingle();
  return data?.body ?? null;
}

function refreshCommercial(entityPath?: string, eventId?: string | null, organisationId?: string | null) {
  revalidatePath("/business");
  if (entityPath) revalidatePath(entityPath);
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/portal/${eventId}`);
  }
  if (organisationId) revalidatePath(`/clients/${organisationId}`);
}

export async function createOpportunity(formData: FormData) {
  const { supabase, user } = await managerClient();
  const organisationId = requiredText.parse(formData.get("organisation_id"));
  const { data, error } = await supabase.from("business_opportunities").insert({
    organisation_id: organisationId,
    event_id: optionalText(formData.get("event_id")),
    name: requiredText.parse(formData.get("name")),
    source: optionalText(formData.get("source")),
    estimated_value: money(formData.get("estimated_value")),
    probability: Math.min(100, Math.max(0, Number(formData.get("probability") || 25))),
    expected_close_date: optionalDate(formData.get("expected_close_date")),
    owner_id: user.id,
    notes: optionalText(formData.get("notes")),
    created_by: user.id,
  }).select("id, event_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(undefined, data.event_id, organisationId);
  redirect(`/business/opportunities/${data.id}`);
}

export async function updateOpportunity(formData: FormData) {
  const { supabase } = await managerClient();
  const id = requiredText.parse(formData.get("id"));
  const stage = requiredText.parse(formData.get("stage")) as OpportunityStage;
  const { data, error } = await supabase.from("business_opportunities").update({
    stage,
    estimated_value: money(formData.get("estimated_value")),
    probability: Math.min(100, Math.max(0, Number(formData.get("probability") || 0))),
    expected_close_date: optionalDate(formData.get("expected_close_date")),
    notes: optionalText(formData.get("notes")),
    lost_reason: stage === "lost" ? optionalText(formData.get("lost_reason")) : null,
  }).eq("id", id).select("event_id, organisation_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/opportunities/${id}`, data.event_id, data.organisation_id);
}

export async function createProposal(formData: FormData) {
  const { supabase, user } = await managerClient();
  const defaultTerms = await getDefaultTerms(supabase);
  const organisationId = requiredText.parse(formData.get("organisation_id"));
  const { data, error } = await supabase.from("proposals").insert({
    organisation_id: organisationId,
    event_id: optionalText(formData.get("event_id")),
    opportunity_id: optionalText(formData.get("opportunity_id")),
    quote_id: optionalText(formData.get("quote_id")),
    document_id: optionalText(formData.get("document_id")),
    title: requiredText.parse(formData.get("title")),
    summary: optionalText(formData.get("summary")),
    scope: optionalText(formData.get("scope")),
    assumptions: optionalText(formData.get("assumptions")),
    terms: optionalText(formData.get("terms")) ?? defaultTerms,
    valid_until: optionalDate(formData.get("valid_until")),
    created_by: user.id,
  }).select("id, event_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(undefined, data.event_id, organisationId);
  redirect(`/business/proposals/${data.id}`);
}

export async function updateProposal(formData: FormData) {
  const { supabase } = await managerClient();
  const id = requiredText.parse(formData.get("id"));
  const status = requiredText.parse(formData.get("status")) as ProposalStatus;
  const { data, error } = await supabase.from("proposals").update({
    status,
    client_visible: formData.get("client_visible") === "on",
    summary: optionalText(formData.get("summary")),
    scope: optionalText(formData.get("scope")),
    assumptions: optionalText(formData.get("assumptions")),
    terms: optionalText(formData.get("terms")),
    valid_until: optionalDate(formData.get("valid_until")),
    sent_at: status === "sent" ? new Date().toISOString() : undefined,
    accepted_at: status === "accepted" ? new Date().toISOString() : undefined,
    accepted_by_name: optionalText(formData.get("accepted_by_name")),
  }).eq("id", id).select("event_id, organisation_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/proposals/${id}`, data.event_id, data.organisation_id);
}

export async function createQuote(formData: FormData) {
  const { supabase, user } = await managerClient();
  const defaultTerms = await getDefaultTerms(supabase);
  const organisationId = requiredText.parse(formData.get("organisation_id"));
  const { data, error } = await supabase.from("quotes").insert({
    organisation_id: organisationId,
    event_id: optionalText(formData.get("event_id")),
    opportunity_id: optionalText(formData.get("opportunity_id")),
    title: requiredText.parse(formData.get("title")),
    issue_date: optionalDate(formData.get("issue_date")) ?? new Date().toISOString().slice(0, 10),
    valid_until: optionalDate(formData.get("valid_until")),
    notes: optionalText(formData.get("notes")),
    terms: optionalText(formData.get("terms")) ?? defaultTerms,
    created_by: user.id,
  }).select("id, event_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(undefined, data.event_id, organisationId);
  redirect(`/business/quotes/${data.id}`);
}

export async function updateQuote(formData: FormData) {
  const { supabase } = await managerClient();
  const id = requiredText.parse(formData.get("id"));
  const status = requiredText.parse(formData.get("status")) as QuoteStatus;
  const { data, error } = await supabase.from("quotes").update({
    status,
    client_visible: formData.get("client_visible") === "on",
    valid_until: optionalDate(formData.get("valid_until")),
    notes: optionalText(formData.get("notes")),
    terms: optionalText(formData.get("terms")),
    accepted_at: status === "accepted" ? new Date().toISOString() : undefined,
    accepted_by_name: optionalText(formData.get("accepted_by_name")),
  }).eq("id", id).select("event_id, organisation_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/quotes/${id}`, data.event_id, data.organisation_id);
}

export async function addQuoteItem(formData: FormData) {
  const { supabase } = await managerClient();
  const quoteId = requiredText.parse(formData.get("quote_id"));
  const { error } = await supabase.from("quote_items").insert({
    quote_id: quoteId,
    description: requiredText.parse(formData.get("description")),
    quantity: money(formData.get("quantity")),
    unit_price: money(formData.get("unit_price")),
    tax_rate: money(formData.get("tax_rate")),
    position: Number(formData.get("position") || 0),
  });
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/quotes/${quoteId}`);
}

export async function deleteQuoteItem(formData: FormData) {
  const { supabase } = await managerClient();
  const quoteId = requiredText.parse(formData.get("quote_id"));
  const itemId = requiredText.parse(formData.get("item_id"));
  const { error } = await supabase.from("quote_items").delete().eq("id", itemId).eq("quote_id", quoteId);
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/quotes/${quoteId}`);
}

export async function createInvoice(formData: FormData) {
  const { supabase, user } = await managerClient();
  const defaultTerms = await getDefaultTerms(supabase);
  const organisationId = requiredText.parse(formData.get("organisation_id"));
  const { data, error } = await supabase.from("invoices").insert({
    organisation_id: organisationId,
    event_id: optionalText(formData.get("event_id")),
    quote_id: optionalText(formData.get("quote_id")),
    title: requiredText.parse(formData.get("title")),
    issue_date: optionalDate(formData.get("issue_date")) ?? new Date().toISOString().slice(0, 10),
    due_date: optionalDate(formData.get("due_date")),
    notes: optionalText(formData.get("notes")),
    payment_terms: optionalText(formData.get("payment_terms")) ?? defaultTerms,
    created_by: user.id,
  }).select("id, event_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(undefined, data.event_id, organisationId);
  redirect(`/business/invoices/${data.id}`);
}

export async function createInvoiceFromQuote(formData: FormData) {
  const { supabase, user } = await managerClient();
  const defaultTerms = await getDefaultTerms(supabase);
  const quoteId = requiredText.parse(formData.get("quote_id"));
  const { data: quote, error: quoteError } = await supabase.from("quotes").select("*, quote_items(*)").eq("id", quoteId).single();
  if (quoteError) throw new Error(quoteError.message);
  const { data: invoice, error } = await supabase.from("invoices").insert({
    organisation_id: quote.organisation_id,
    event_id: quote.event_id,
    quote_id: quote.id,
    title: quote.title,
    issue_date: new Date().toISOString().slice(0, 10),
    payment_terms: defaultTerms,
    created_by: user.id,
  }).select("id").single();
  if (error) throw new Error(error.message);
  if (quote.quote_items.length) {
    const { error: itemError } = await supabase.from("invoice_items").insert(quote.quote_items.map((item) => ({
      invoice_id: invoice.id,
      position: item.position,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
    })));
    if (itemError) throw new Error(itemError.message);
  }
  refreshCommercial(`/business/quotes/${quoteId}`, quote.event_id, quote.organisation_id);
  redirect(`/business/invoices/${invoice.id}`);
}

export async function updateInvoice(formData: FormData) {
  const { supabase } = await managerClient();
  const id = requiredText.parse(formData.get("id"));
  const status = requiredText.parse(formData.get("status")) as InvoiceStatus;
  const { data, error } = await supabase.from("invoices").update({
    status,
    client_visible: formData.get("client_visible") === "on",
    due_date: optionalDate(formData.get("due_date")),
    notes: optionalText(formData.get("notes")),
    payment_terms: optionalText(formData.get("payment_terms")),
    sent_at: status === "sent" ? new Date().toISOString() : undefined,
  }).eq("id", id).select("event_id, organisation_id").single();
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/invoices/${id}`, data.event_id, data.organisation_id);
}

export async function addInvoiceItem(formData: FormData) {
  const { supabase } = await managerClient();
  const invoiceId = requiredText.parse(formData.get("invoice_id"));
  const { error } = await supabase.from("invoice_items").insert({
    invoice_id: invoiceId,
    description: requiredText.parse(formData.get("description")),
    quantity: money(formData.get("quantity")),
    unit_price: money(formData.get("unit_price")),
    tax_rate: money(formData.get("tax_rate")),
    position: Number(formData.get("position") || 0),
  });
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/invoices/${invoiceId}`);
}

export async function deleteInvoiceItem(formData: FormData) {
  const { supabase } = await managerClient();
  const invoiceId = requiredText.parse(formData.get("invoice_id"));
  const itemId = requiredText.parse(formData.get("item_id"));
  const { error } = await supabase.from("invoice_items").delete().eq("id", itemId).eq("invoice_id", invoiceId);
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/invoices/${invoiceId}`);
}

export async function recordPayment(formData: FormData) {
  const { supabase, user } = await managerClient();
  const invoiceId = requiredText.parse(formData.get("invoice_id"));
  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount: money(formData.get("amount")),
    paid_on: optionalDate(formData.get("paid_on")) ?? new Date().toISOString().slice(0, 10),
    method: requiredText.parse(formData.get("method")) as PaymentMethod,
    external_reference: optionalText(formData.get("external_reference")),
    notes: optionalText(formData.get("notes")),
    recorded_by: user.id,
  });
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/invoices/${invoiceId}`);
}

export async function addQuoteService(formData: FormData) {
  const { supabase } = await managerClient();
  const quoteId = requiredText.parse(formData.get("quote_id"));
  const serviceId = requiredText.parse(formData.get("service_id"));
  const { data: service, error: serviceError } = await supabase.from("business_services").select("*").eq("id", serviceId).eq("active", true).single();
  if (serviceError) throw new Error(serviceError.message);
  const { count } = await supabase.from("quote_items").select("id", { count: "exact", head: true }).eq("quote_id", quoteId);
  const { error } = await supabase.from("quote_items").insert({ quote_id: quoteId, description: `${service.name} - ${service.description}`, quantity: 1, unit_price: service.default_unit_price, tax_rate: service.tax_rate, position: (count ?? 0) + 1 });
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/quotes/${quoteId}`);
}

export async function addInvoiceService(formData: FormData) {
  const { supabase } = await managerClient();
  const invoiceId = requiredText.parse(formData.get("invoice_id"));
  const serviceId = requiredText.parse(formData.get("service_id"));
  const { data: service, error: serviceError } = await supabase.from("business_services").select("*").eq("id", serviceId).eq("active", true).single();
  if (serviceError) throw new Error(serviceError.message);
  const { count } = await supabase.from("invoice_items").select("id", { count: "exact", head: true }).eq("invoice_id", invoiceId);
  const { error } = await supabase.from("invoice_items").insert({ invoice_id: invoiceId, description: `${service.name} - ${service.description}`, quantity: 1, unit_price: service.default_unit_price, tax_rate: service.tax_rate, position: (count ?? 0) + 1 });
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/invoices/${invoiceId}`);
}

export async function addProposalService(formData: FormData) {
  const { supabase } = await managerClient();
  const proposalId = requiredText.parse(formData.get("proposal_id"));
  const serviceId = requiredText.parse(formData.get("service_id"));
  const { data: service, error: serviceError } = await supabase.from("business_services").select("*").eq("id", serviceId).eq("active", true).single();
  if (serviceError) throw new Error(serviceError.message);
  const { count } = await supabase.from("proposal_services").select("id", { count: "exact", head: true }).eq("proposal_id", proposalId);
  const { error } = await supabase.from("proposal_services").insert({ proposal_id: proposalId, service_id: service.id, service_name: service.name, description: service.description, position: (count ?? 0) + 1 });
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/proposals/${proposalId}`);
}

export async function deleteProposalService(formData: FormData) {
  const { supabase } = await managerClient();
  const proposalId = requiredText.parse(formData.get("proposal_id"));
  const itemId = requiredText.parse(formData.get("item_id"));
  const { error } = await supabase.from("proposal_services").delete().eq("id", itemId).eq("proposal_id", proposalId);
  if (error) throw new Error(error.message);
  refreshCommercial(`/business/proposals/${proposalId}`);
}

export async function createBusinessService(formData: FormData) {
  const { supabase, user } = await managerClient();
  const { error } = await supabase.from("business_services").insert({ code: requiredText.parse(formData.get("code")).toUpperCase().replace(/[^A-Z0-9-]/g, ""), name: requiredText.parse(formData.get("name")), category: requiredText.parse(formData.get("category")), description: requiredText.parse(formData.get("description")), unit_label: requiredText.parse(formData.get("unit_label")), default_unit_price: money(formData.get("default_unit_price")), tax_rate: money(formData.get("tax_rate")), created_by: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/business/library");
}

export async function updateBusinessService(formData: FormData) {
  const { supabase } = await managerClient();
  const id = requiredText.parse(formData.get("id"));
  const { error } = await supabase.from("business_services").update({ name: requiredText.parse(formData.get("name")), category: requiredText.parse(formData.get("category")), description: requiredText.parse(formData.get("description")), unit_label: requiredText.parse(formData.get("unit_label")), default_unit_price: money(formData.get("default_unit_price")), tax_rate: money(formData.get("tax_rate")), active: formData.get("active") === "on" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/business/library");
}

export async function updateTermsTemplate(formData: FormData) {
  const { supabase } = await managerClient();
  const id = requiredText.parse(formData.get("id"));
  const { error } = await supabase.from("commercial_terms_templates").update({ body: z.string().trim().min(100).parse(formData.get("body")) }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/business/library");
}

export async function acceptClientQuote(formData: FormData) {
  const supabase = await createClient();
  const quoteId = requiredText.parse(formData.get("quote_id"));
  const eventId = requiredText.parse(formData.get("event_id"));
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");
  const { error } = await supabase.rpc("accept_client_quote", { p_quote_id: quoteId });
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/${eventId}`);
}

export async function acceptClientProposal(formData: FormData) {
  const supabase = await createClient();
  const proposalId = requiredText.parse(formData.get("proposal_id"));
  const eventId = requiredText.parse(formData.get("event_id"));
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");
  const { error } = await supabase.rpc("accept_client_proposal", { p_proposal_id: proposalId });
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/${eventId}`);
}
