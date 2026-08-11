import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type CommercialPdfData = {
  kind: "proposal" | "quote" | "invoice";
  reference: string;
  title: string;
  status: string;
  clientName: string;
  clientReference: string;
  eventName?: string | null;
  eventReference?: string | null;
  venue?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  validUntil?: string | null;
  summary?: string | null;
  scope?: string | null;
  assumptions?: string | null;
  services?: Array<{
    name: string;
    description: string;
  }>;
  notes?: string | null;
  terms?: string | null;
  paymentTerms?: string | null;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  currency?: string;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  amountPaid?: number;
  balanceDue?: number;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
  payments?: Array<{
    reference: string;
    date: string;
    method: string;
    externalReference?: string | null;
    amount: number;
  }>;
  logoData: string;
  generatedAt: string;
};

const CHARCOAL = "#373536";
const TEAL = "#60B9C5";
const BORDER = "#DDE2E2";
const MUTED = "#676566";
const PALE = "#F3F7F7";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: CHARCOAL, paddingTop: 0, paddingBottom: 58, backgroundColor: "#FFFFFF" },
  hero: { backgroundColor: CHARCOAL, paddingTop: 30, paddingBottom: 27, paddingHorizontal: 38 },
  heroTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  logo: { width: 138, height: 43, objectFit: "contain", objectPosition: "left center" },
  documentType: { color: TEAL, fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 7 },
  title: { color: "#FFFFFF", fontSize: 23, fontFamily: "Helvetica-Bold", lineHeight: 1.16, maxWidth: 405 },
  status: { color: "#FFFFFF", borderColor: "#6D6A6B", borderWidth: 1, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 8, fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 0.7 },
  heroMeta: { marginTop: 21, paddingTop: 15, borderTopColor: "#555253", borderTopWidth: 1, flexDirection: "row", gap: 18 },
  heroMetaItem: { minWidth: 118 },
  heroMetaLabel: { color: "#AAA7A8", fontSize: 6.8, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
  heroMetaValue: { color: "#FFFFFF", fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  body: { paddingHorizontal: 38, paddingTop: 25 },
  clientBand: { flexDirection: "row", borderColor: BORDER, borderWidth: 1, borderRadius: 4, backgroundColor: PALE, padding: 14, marginBottom: 24 },
  clientPrimary: { width: "48%", paddingRight: 14 },
  clientSecondary: { width: "52%", borderLeftColor: BORDER, borderLeftWidth: 1, paddingLeft: 14 },
  eyebrow: { color: MUTED, fontSize: 6.8, fontFamily: "Helvetica-Bold", letterSpacing: 0.9, textTransform: "uppercase", marginBottom: 5 },
  clientName: { fontSize: 12, fontFamily: "Helvetica-Bold", lineHeight: 1.25 },
  detailRow: { flexDirection: "row", marginBottom: 4 },
  detailLabel: { width: 66, color: MUTED },
  detailValue: { flex: 1, fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 9, paddingBottom: 6, borderBottomColor: TEAL, borderBottomWidth: 1.5 },
  paragraph: { fontSize: 9.5, color: "#454344", lineHeight: 1.55 },
  callout: { backgroundColor: PALE, borderLeftColor: TEAL, borderLeftWidth: 3, padding: 12, marginTop: 7 },
  serviceList: { borderColor: BORDER, borderWidth: 1, borderRadius: 3, overflow: "hidden" },
  serviceItem: { paddingVertical: 10, paddingHorizontal: 11, borderBottomColor: BORDER, borderBottomWidth: 1 },
  serviceItemLast: { borderBottomWidth: 0 },
  serviceName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  serviceDescription: { color: MUTED, fontSize: 8.5, lineHeight: 1.45 },
  table: { borderColor: BORDER, borderWidth: 1, borderRadius: 3, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: CHARCOAL, paddingVertical: 8, paddingHorizontal: 8 },
  tableHeaderText: { color: "#FFFFFF", fontSize: 6.8, fontFamily: "Helvetica-Bold", letterSpacing: 0.5, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 8, borderBottomColor: BORDER, borderBottomWidth: 1, minHeight: 30 },
  tableRowLast: { borderBottomWidth: 0 },
  description: { width: "46%", paddingRight: 7 },
  quantity: { width: "10%", textAlign: "right" },
  unit: { width: "16%", textAlign: "right" },
  vat: { width: "10%", textAlign: "right" },
  lineTotal: { width: "18%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  totals: { marginLeft: "55%", marginTop: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { color: MUTED },
  totalValue: { fontFamily: "Helvetica-Bold" },
  grandTotal: { marginTop: 5, paddingTop: 8, borderTopColor: CHARCOAL, borderTopWidth: 1.5, fontSize: 13 },
  paymentSummary: { flexDirection: "row", gap: 8, marginBottom: 18 },
  paymentMetric: { flex: 1, backgroundColor: PALE, borderColor: BORDER, borderWidth: 1, borderRadius: 3, padding: 11 },
  paymentMetricValue: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 5 },
  acceptance: { borderColor: TEAL, borderWidth: 1, borderRadius: 4, padding: 12, backgroundColor: "#F2FAFB" },
  footer: { position: "absolute", bottom: 20, left: 38, right: 38, borderTopColor: BORDER, borderTopWidth: 1, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { color: MUTED, fontSize: 6.8 },
  pageNumber: { color: CHARCOAL, fontSize: 7, fontFamily: "Helvetica-Bold" },
  draftMark: { position: "absolute", top: 365, left: 115, color: "#EFF1F1", fontSize: 72, fontFamily: "Helvetica-Bold", transform: "rotate(-35deg)", letterSpacing: 8 },
});

function humanise(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}

function date(value?: string | null) {
  if (!value) return "Not set";
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function money(value: number | undefined, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(value ?? 0);
}

function Footer({ data }: { data: CommercialPdfData }) {
  return <View fixed style={styles.footer}>
    <Text style={styles.footerText}>TIDE EVENTS GROUP  |  {data.reference}  |  Generated {data.generatedAt}</Text>
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
  </View>;
}

function ItemsTable({ data }: { data: CommercialPdfData }) {
  const items = data.items ?? [];
  return <View style={styles.section} wrap={false}>
    <Text style={styles.sectionTitle}>{data.kind === "invoice" ? "Charges" : "Services and pricing"}</Text>
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.description]}>Description</Text><Text style={[styles.tableHeaderText, styles.quantity]}>Qty</Text><Text style={[styles.tableHeaderText, styles.unit]}>Unit price</Text><Text style={[styles.tableHeaderText, styles.vat]}>VAT</Text><Text style={[styles.tableHeaderText, styles.lineTotal]}>Line total</Text>
      </View>
      {items.map((item, index) => <View key={`${item.description}-${index}`} style={[styles.tableRow, index === items.length - 1 ? styles.tableRowLast : {}]}>
        <Text style={styles.description}>{item.description}</Text><Text style={styles.quantity}>{item.quantity}</Text><Text style={styles.unit}>{money(item.unitPrice, data.currency)}</Text><Text style={styles.vat}>{item.taxRate}%</Text><Text style={styles.lineTotal}>{money(item.quantity * item.unitPrice * (1 + item.taxRate / 100), data.currency)}</Text>
      </View>)}
    </View>
    <View style={styles.totals}>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{money(data.subtotal, data.currency)}</Text></View>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>VAT</Text><Text style={styles.totalValue}>{money(data.taxTotal, data.currency)}</Text></View>
      <View style={[styles.totalRow, styles.grandTotal]}><Text>Total</Text><Text style={styles.totalValue}>{money(data.total, data.currency)}</Text></View>
    </View>
  </View>;
}

export function CommercialDocument({ data }: { data: CommercialPdfData }) {
  const typeLabel = data.kind === "quote" ? "Quotation" : humanise(data.kind);
  return <Document title={`${data.reference} - ${data.title}`} author="Tide Events Group" subject={`${typeLabel} for ${data.clientName}`} creator="Tide Business & Operations System">
    <Page size="A4" style={styles.page}>
      {data.status === "draft" && <Text fixed style={styles.draftMark}>DRAFT</Text>}
      <View style={styles.hero}>
        {/* React PDF's Image is not an HTML image and does not support alt. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <View style={styles.heroTop}><Image src={data.logoData} style={styles.logo} /><Text style={styles.status}>{humanise(data.status)}</Text></View>
        <View style={{ marginTop: 22 }}><Text style={styles.documentType}>{typeLabel}</Text><Text style={styles.title}>{data.title}</Text></View>
        <View style={styles.heroMeta}>
          <View style={styles.heroMetaItem}><Text style={styles.heroMetaLabel}>{typeLabel} ID</Text><Text style={styles.heroMetaValue}>{data.reference}</Text></View>
          <View style={styles.heroMetaItem}><Text style={styles.heroMetaLabel}>Client ID</Text><Text style={styles.heroMetaValue}>{data.clientReference}</Text></View>
          {data.eventReference && <View style={styles.heroMetaItem}><Text style={styles.heroMetaLabel}>Event ID</Text><Text style={styles.heroMetaValue}>{data.eventReference}</Text></View>}
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.clientBand}>
          <View style={styles.clientPrimary}><Text style={styles.eyebrow}>Prepared for</Text><Text style={styles.clientName}>{data.clientName}</Text>{data.eventName && <Text style={{ marginTop: 4, color: MUTED }}>{data.eventName}{data.venue ? ` - ${data.venue}` : ""}</Text>}</View>
          <View style={styles.clientSecondary}>
            {data.issueDate && <View style={styles.detailRow}><Text style={styles.detailLabel}>Issue date</Text><Text style={styles.detailValue}>{date(data.issueDate)}</Text></View>}
            {data.validUntil && <View style={styles.detailRow}><Text style={styles.detailLabel}>Valid until</Text><Text style={styles.detailValue}>{date(data.validUntil)}</Text></View>}
            {data.dueDate && <View style={styles.detailRow}><Text style={styles.detailLabel}>Due date</Text><Text style={styles.detailValue}>{date(data.dueDate)}</Text></View>}
          </View>
        </View>

        {data.kind === "proposal" ? <>
          {data.summary && <View style={styles.section}><Text style={styles.sectionTitle}>Executive summary</Text><Text style={styles.paragraph}>{data.summary}</Text></View>}
          {(data.services?.length ?? 0) > 0 && <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included Tide services</Text>
            <View style={styles.serviceList}>{data.services?.map((service, index) => <View key={`${service.name}-${index}`} style={[styles.serviceItem, index === (data.services?.length ?? 0) - 1 ? styles.serviceItemLast : {}]} wrap={false}>
              <Text style={styles.serviceName}>{service.name}</Text><Text style={styles.serviceDescription}>{service.description}</Text>
            </View>)}</View>
          </View>}
          {data.scope && <View style={styles.section}><Text style={styles.sectionTitle}>Proposed scope</Text><Text style={styles.paragraph}>{data.scope}</Text></View>}
          {data.assumptions && <View style={styles.section}><Text style={styles.sectionTitle}>Assumptions and exclusions</Text><View style={styles.callout}><Text style={styles.paragraph}>{data.assumptions}</Text></View></View>}
        </> : <ItemsTable data={data} />}

        {data.kind === "invoice" && <View style={styles.paymentSummary} wrap={false}>
          <View style={styles.paymentMetric}><Text style={styles.eyebrow}>Paid</Text><Text style={styles.paymentMetricValue}>{money(data.amountPaid, data.currency)}</Text></View>
          <View style={styles.paymentMetric}><Text style={styles.eyebrow}>Balance due</Text><Text style={styles.paymentMetricValue}>{money(data.balanceDue, data.currency)}</Text></View>
        </View>}

        {(data.notes || data.terms || data.paymentTerms) && <View style={styles.section}><Text style={styles.sectionTitle}>{data.kind === "invoice" ? "Payment terms and conditions" : "Terms and conditions"}</Text>{data.paymentTerms && <Text style={styles.paragraph}>{data.paymentTerms}</Text>}{data.terms && <Text style={styles.paragraph}>{data.terms}</Text>}{data.notes && <Text style={[styles.paragraph, { marginTop: 7 }]}>{data.notes}</Text>}</View>}

        {data.acceptedBy && <View style={styles.acceptance} wrap={false}><Text style={styles.eyebrow}>Acceptance recorded</Text><Text style={{ fontFamily: "Helvetica-Bold" }}>{data.acceptedBy}{data.acceptedAt ? ` - ${date(data.acceptedAt)}` : ""}</Text></View>}

        {data.kind === "invoice" && (data.payments?.length ?? 0) > 0 && <View style={[styles.section, { marginTop: 20 }]}><Text style={styles.sectionTitle}>Payment history</Text>{data.payments?.map((payment) => <View key={payment.reference} style={[styles.detailRow, { paddingVertical: 3 }]}><Text style={{ width: 110, fontFamily: "Helvetica-Bold" }}>{payment.reference}</Text><Text style={{ width: 90 }}>{date(payment.date)}</Text><Text style={{ flex: 1 }}>{humanise(payment.method)}{payment.externalReference ? ` - ${payment.externalReference}` : ""}</Text><Text style={{ width: 80, textAlign: "right", fontFamily: "Helvetica-Bold" }}>{money(payment.amount, data.currency)}</Text></View>)}</View>}
      </View>
      <Footer data={data} />
    </Page>
  </Document>;
}
