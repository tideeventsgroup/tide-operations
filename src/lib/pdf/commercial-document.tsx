import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

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
  services?: Array<{ name: string; description: string }>;
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
  items?: Array<{ description: string; quantity: number; unitPrice: number; taxRate: number }>;
  payments?: Array<{ reference: string; date: string; method: string; externalReference?: string | null; amount: number }>;
  logoData: string;
  generatedAt: string;
};

const CHARCOAL = "#373536";
const INK = "#272526";
const TEAL = "#60B9C5";
const BORDER = "#D9DEDE";
const MUTED = "#696768";
const PALE = "#F3F7F7";
const TEAL_PALE = "#EDF8F9";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: INK, paddingTop: 28, paddingBottom: 56, backgroundColor: "#FFFFFF" },
  brandBar: { height: 76, marginTop: -28, backgroundColor: CHARCOAL, paddingHorizontal: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 140, height: 42, objectFit: "contain", objectPosition: "left center" },
  brandMeta: { textAlign: "right" },
  confidential: { color: "#B9B6B7", fontSize: 6.5, fontFamily: "Helvetica-Bold", letterSpacing: 1.1, textTransform: "uppercase" },
  brandName: { color: "#FFFFFF", fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 6 },
  cover: { paddingHorizontal: 40, paddingTop: 22, paddingBottom: 16 },
  identityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  documentType: { color: TEAL, fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.4, textTransform: "uppercase" },
  status: { color: CHARCOAL, backgroundColor: PALE, borderColor: BORDER, borderWidth: 1, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 8, fontFamily: "Helvetica-Bold", fontSize: 7, textTransform: "uppercase", letterSpacing: 0.7 },
  title: { color: INK, fontSize: 22, fontFamily: "Helvetica-Bold", lineHeight: 1.13, maxWidth: 455, letterSpacing: -0.3 },
  titleRule: { width: 44, height: 3, backgroundColor: TEAL, marginTop: 12 },
  coverSubtitle: { color: MUTED, fontSize: 9, lineHeight: 1.4, marginTop: 10, maxWidth: 445 },
  partyGrid: { marginTop: 16, flexDirection: "row", borderTopColor: BORDER, borderTopWidth: 1, borderBottomColor: BORDER, borderBottomWidth: 1, paddingVertical: 11 },
  partyColumn: { width: "50%", paddingRight: 18 },
  partyColumnRight: { width: "50%", borderLeftColor: BORDER, borderLeftWidth: 1, paddingLeft: 18 },
  eyebrow: { color: MUTED, fontSize: 6.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 },
  partyName: { fontSize: 11.5, fontFamily: "Helvetica-Bold", lineHeight: 1.28 },
  partyDetail: { color: MUTED, fontSize: 8, lineHeight: 1.4, marginTop: 4 },
  referenceGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  referenceItem: { width: "33.33%", marginBottom: 5, paddingRight: 10 },
  referenceLabel: { color: MUTED, fontSize: 6.2, fontFamily: "Helvetica-Bold", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 3 },
  referenceValue: { color: INK, fontSize: 8.2, fontFamily: "Helvetica-Bold" },
  body: { paddingHorizontal: 40 },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionIndex: { width: 20, height: 20, borderRadius: 10, backgroundColor: TEAL_PALE, color: TEAL, textAlign: "center", paddingTop: 5.5, fontSize: 7, fontFamily: "Helvetica-Bold", marginRight: 8 },
  sectionTitle: { color: INK, fontSize: 12, fontFamily: "Helvetica-Bold" },
  paragraph: { color: "#454344", fontSize: 9.2, lineHeight: 1.58 },
  callout: { backgroundColor: TEAL_PALE, borderLeftColor: TEAL, borderLeftWidth: 3, padding: 12 },
  serviceList: { borderTopColor: BORDER, borderTopWidth: 1 },
  serviceItem: { flexDirection: "row", borderBottomColor: BORDER, borderBottomWidth: 1, paddingVertical: 10 },
  serviceNumber: { width: 25, color: TEAL, fontSize: 8, fontFamily: "Helvetica-Bold", paddingTop: 1 },
  serviceBody: { flex: 1 },
  serviceName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  serviceDescription: { color: MUTED, fontSize: 8.5, lineHeight: 1.45 },
  amountBanner: { backgroundColor: CHARCOAL, paddingVertical: 11, paddingHorizontal: 14, marginTop: 2, marginBottom: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amountBannerLabel: { color: "#B9B6B7", fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase" },
  amountBannerValue: { color: "#FFFFFF", fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4 },
  amountBannerMeta: { color: "#D5D2D3", fontSize: 8, textAlign: "right", lineHeight: 1.5 },
  table: { borderTopColor: CHARCOAL, borderTopWidth: 1.4 },
  tableHeader: { flexDirection: "row", backgroundColor: PALE, borderBottomColor: BORDER, borderBottomWidth: 1, paddingVertical: 8, paddingHorizontal: 7 },
  tableHeaderText: { color: MUTED, fontSize: 6.3, fontFamily: "Helvetica-Bold", letterSpacing: 0.6, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 7, borderBottomColor: BORDER, borderBottomWidth: 1, minHeight: 31 },
  description: { width: "45%", paddingRight: 8 },
  quantity: { width: "9%", textAlign: "right" },
  unit: { width: "17%", textAlign: "right" },
  vat: { width: "10%", textAlign: "right" },
  lineTotal: { width: "19%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totals: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { color: MUTED },
  totalValue: { fontFamily: "Helvetica-Bold" },
  grandTotal: { marginTop: 5, paddingTop: 9, borderTopColor: CHARCOAL, borderTopWidth: 1.4, fontSize: 13 },
  paymentSummary: { flexDirection: "row", marginBottom: 22 },
  paymentMetric: { width: "50%", backgroundColor: PALE, borderColor: BORDER, borderWidth: 1, padding: 12 },
  paymentMetricRight: { width: "50%", backgroundColor: TEAL_PALE, borderColor: TEAL, borderWidth: 1, padding: 12 },
  paymentMetricValue: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 5 },
  acceptance: { borderColor: TEAL, borderWidth: 1, padding: 12, backgroundColor: TEAL_PALE, marginBottom: 20 },
  legal: { paddingHorizontal: 40, paddingTop: 12 },
  legalKicker: { color: TEAL, fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1.2, textTransform: "uppercase" },
  legalTitle: { color: INK, fontSize: 19, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 7 },
  legalIntro: { color: MUTED, fontSize: 8, lineHeight: 1.45, paddingBottom: 14, borderBottomColor: BORDER, borderBottomWidth: 1, marginBottom: 15 },
  legalHeading: { color: INK, fontSize: 8.7, fontFamily: "Helvetica-Bold", lineHeight: 1.35, marginTop: 8, marginBottom: 4 },
  legalParagraph: { color: "#4B494A", fontSize: 7.8, lineHeight: 1.48, marginBottom: 6 },
  paymentHistory: { marginTop: 4, marginBottom: 20 },
  paymentRow: { flexDirection: "row", borderBottomColor: BORDER, borderBottomWidth: 1, paddingVertical: 7 },
  footer: { position: "absolute", bottom: 18, left: 40, right: 40, borderTopColor: BORDER, borderTopWidth: 1, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { color: MUTED, fontSize: 6.2 },
  pageNumber: { color: CHARCOAL, fontSize: 6.5, fontFamily: "Helvetica-Bold" },
  runningHeader: { position: "absolute", top: 15, left: 40, right: 40, color: MUTED, fontSize: 6.2, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, textAlign: "right" },
  draftMark: { position: "absolute", top: 370, left: 125, color: "#F0F2F2", fontSize: 68, fontFamily: "Helvetica-Bold", transform: "rotate(-34deg)", letterSpacing: 8 },
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

function documentLabel(kind: CommercialPdfData["kind"]) {
  return kind === "quote" ? "Quotation" : humanise(kind);
}

function SectionHeading({ index, children }: { index: string; children: React.ReactNode }) {
  return <View style={styles.sectionHeader} wrap={false}><Text style={styles.sectionIndex}>{index}</Text><Text style={styles.sectionTitle}>{children}</Text></View>;
}

function Footer({ data }: { data: CommercialPdfData }) {
  return <View fixed style={styles.footer}>
    <Text style={styles.footerText}>TIDE EVENTS GROUP  |  {data.reference}  |  COMMERCIAL IN CONFIDENCE</Text>
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
  </View>;
}

function DocumentCover({ data }: { data: CommercialPdfData }) {
  const typeLabel = documentLabel(data.kind);
  const totalLabel = data.kind === "invoice" ? "Invoice total" : "Total including VAT";
  return <>
    <View style={styles.brandBar}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={data.logoData} style={styles.logo} />
      <View style={styles.brandMeta}><Text style={styles.confidential}>Commercial in confidence</Text><Text style={styles.brandName}>Tide Events Group Scotland</Text></View>
    </View>
    <View style={styles.cover}>
      <View style={styles.identityRow}><Text style={styles.documentType}>{typeLabel}</Text><Text style={styles.status}>{humanise(data.status)}</Text></View>
      <Text style={styles.title}>{data.title}</Text>
      <View style={styles.titleRule} />
      <Text style={styles.coverSubtitle}>{typeLabel} prepared by Tide Events Group for {data.clientName}{data.eventName ? ` in connection with ${data.eventName}` : ""}.</Text>

      <View style={styles.partyGrid}>
        <View style={styles.partyColumn}><Text style={styles.eyebrow}>Prepared for</Text><Text style={styles.partyName}>{data.clientName}</Text><Text style={styles.partyDetail}>Client ID: {data.clientReference}</Text></View>
        <View style={styles.partyColumnRight}><Text style={styles.eyebrow}>Event</Text><Text style={styles.partyName}>{data.eventName ?? "Not linked to an event"}</Text>{data.eventReference && <Text style={styles.partyDetail}>Event ID: {data.eventReference}</Text>}{data.venue && <Text style={styles.partyDetail}>{data.venue}</Text>}</View>
      </View>

      <View style={styles.referenceGrid}>
        <View style={styles.referenceItem}><Text style={styles.referenceLabel}>{typeLabel} ID</Text><Text style={styles.referenceValue}>{data.reference}</Text></View>
        {data.issueDate && <View style={styles.referenceItem}><Text style={styles.referenceLabel}>Issue date</Text><Text style={styles.referenceValue}>{date(data.issueDate)}</Text></View>}
        {data.validUntil && <View style={styles.referenceItem}><Text style={styles.referenceLabel}>Valid until</Text><Text style={styles.referenceValue}>{date(data.validUntil)}</Text></View>}
        {data.dueDate && <View style={styles.referenceItem}><Text style={styles.referenceLabel}>Payment due</Text><Text style={styles.referenceValue}>{date(data.dueDate)}</Text></View>}
      </View>

      {data.kind !== "proposal" && <View style={styles.amountBanner} wrap={false}>
        <View><Text style={styles.amountBannerLabel}>{totalLabel}</Text><Text style={styles.amountBannerValue}>{money(data.total, data.currency)}</Text></View>
        <Text style={styles.amountBannerMeta}>{data.kind === "invoice" ? `Balance due: ${money(data.balanceDue, data.currency)}\nDue: ${date(data.dueDate)}` : `Valid until\n${date(data.validUntil)}`}</Text>
      </View>}
    </View>
  </>;
}

function ItemsTable({ data }: { data: CommercialPdfData }) {
  const items = data.items ?? [];
  return <View style={styles.section}>
    <SectionHeading index="01">{data.kind === "invoice" ? "Charges" : "Services and pricing"}</SectionHeading>
    <View style={styles.table}>
      <View style={styles.tableHeader} wrap={false}>
        <Text style={[styles.tableHeaderText, styles.description]}>Description</Text><Text style={[styles.tableHeaderText, styles.quantity]}>Qty</Text><Text style={[styles.tableHeaderText, styles.unit]}>Unit price</Text><Text style={[styles.tableHeaderText, styles.vat]}>VAT</Text><Text style={[styles.tableHeaderText, styles.lineTotal]}>Total</Text>
      </View>
      {items.length ? items.map((item, index) => <View key={`${item.description}-${index}`} style={styles.tableRow} wrap={false}>
        <Text style={styles.description}>{item.description}</Text><Text style={styles.quantity}>{item.quantity}</Text><Text style={styles.unit}>{money(item.unitPrice, data.currency)}</Text><Text style={styles.vat}>{item.taxRate}%</Text><Text style={styles.lineTotal}>{money(item.quantity * item.unitPrice * (1 + item.taxRate / 100), data.currency)}</Text>
      </View>) : <View style={styles.tableRow}><Text style={[styles.description, { color: MUTED }]}>No line items have been added.</Text></View>}
    </View>
    <View style={styles.totalsWrap} wrap={false}><View style={styles.totals}>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{money(data.subtotal, data.currency)}</Text></View>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>VAT</Text><Text style={styles.totalValue}>{money(data.taxTotal, data.currency)}</Text></View>
      <View style={[styles.totalRow, styles.grandTotal]}><Text>Total</Text><Text style={styles.totalValue}>{money(data.total, data.currency)}</Text></View>
    </View></View>
  </View>;
}

function LegalText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n|\r?\n/).map((block) => block.trim()).filter(Boolean);
  return <>{blocks.map((block, index) => {
    const heading = /^(?:\d+(?:\.\d+)*[.)]?\s+|[A-Z][A-Z\s,&/()-]{4,}$)/.test(block);
    return <Text key={`${block.slice(0, 24)}-${index}`} style={heading ? styles.legalHeading : styles.legalParagraph}>{block}</Text>;
  })}</>;
}

function TermsSection({ data }: { data: CommercialPdfData }) {
  const combined = [data.paymentTerms, data.terms, data.notes].filter(Boolean).join("\n\n");
  if (!combined) return null;
  return <View style={styles.legal} break={data.kind === "quote" && (data.items?.length ?? 0) <= 4}>
    <Text style={styles.legalKicker}>{documentLabel(data.kind)} | {data.reference}</Text>
    <Text style={styles.legalTitle}>{data.kind === "invoice" ? "Payment terms and conditions" : "Terms and conditions"}</Text>
    <Text style={styles.legalIntro}>This {documentLabel(data.kind).toLowerCase()} and these terms form one commercial record to retain for your files. Quote the permanent reference above in all correspondence.</Text>
    <LegalText text={combined} />
  </View>;
}

export function CommercialDocument({ data }: { data: CommercialPdfData }) {
  const typeLabel = documentLabel(data.kind);
  return <Document title={`${data.reference} - ${data.title}`} author="Tide Events Group" subject={`${typeLabel} for ${data.clientName}`} creator="Tide Business and Operations System">
    <Page size="A4" style={styles.page}>
      {data.status === "draft" && <Text fixed style={styles.draftMark}>DRAFT</Text>}
      <Text fixed style={styles.runningHeader} render={({ pageNumber }) => pageNumber > 1 ? `${typeLabel.toUpperCase()}  |  ${data.reference}` : ""} />
      <DocumentCover data={data} />
      <View style={styles.body}>
        {data.kind === "proposal" ? <>
          {data.summary && <View style={styles.section}><SectionHeading index="01">Executive summary</SectionHeading><Text style={styles.paragraph}>{data.summary}</Text></View>}
          {(data.services?.length ?? 0) > 0 && <View style={styles.section}>
            <SectionHeading index="02">Included Tide services</SectionHeading>
            <View style={styles.serviceList}>{data.services?.map((service, index) => <View key={`${service.name}-${index}`} style={styles.serviceItem} wrap={false}><Text style={styles.serviceNumber}>{String(index + 1).padStart(2, "0")}</Text><View style={styles.serviceBody}><Text style={styles.serviceName}>{service.name}</Text><Text style={styles.serviceDescription}>{service.description}</Text></View></View>)}</View>
          </View>}
          {data.scope && <View style={styles.section}><SectionHeading index="03">Proposed scope</SectionHeading><Text style={styles.paragraph}>{data.scope}</Text></View>}
          {data.assumptions && <View style={styles.section} wrap={false}><SectionHeading index="04">Assumptions and exclusions</SectionHeading><View style={styles.callout}><Text style={styles.paragraph}>{data.assumptions}</Text></View></View>}
        </> : <ItemsTable data={data} />}

        {data.kind === "invoice" && <View style={styles.paymentSummary} wrap={false}>
          <View style={styles.paymentMetric}><Text style={styles.eyebrow}>Payments received</Text><Text style={styles.paymentMetricValue}>{money(data.amountPaid, data.currency)}</Text></View>
          <View style={styles.paymentMetricRight}><Text style={styles.eyebrow}>Balance now due</Text><Text style={styles.paymentMetricValue}>{money(data.balanceDue, data.currency)}</Text></View>
        </View>}

        {data.acceptedBy && <View style={styles.acceptance} wrap={false}><Text style={styles.eyebrow}>Client acceptance recorded</Text><Text style={{ fontFamily: "Helvetica-Bold" }}>{data.acceptedBy}{data.acceptedAt ? ` - ${date(data.acceptedAt)}` : ""}</Text></View>}

        {data.kind === "invoice" && (data.payments?.length ?? 0) > 0 && <View style={styles.paymentHistory}>
          <SectionHeading index="02">Payment history</SectionHeading>
          {data.payments?.map((payment) => <View key={payment.reference} style={styles.paymentRow} wrap={false}><Text style={{ width: 100, fontFamily: "Helvetica-Bold" }}>{payment.reference}</Text><Text style={{ width: 82 }}>{date(payment.date)}</Text><Text style={{ flex: 1 }}>{humanise(payment.method)}{payment.externalReference ? ` - ${payment.externalReference}` : ""}</Text><Text style={{ width: 75, textAlign: "right", fontFamily: "Helvetica-Bold" }}>{money(payment.amount, data.currency)}</Text></View>)}
        </View>}
      </View>
      <TermsSection data={data} />
      <Footer data={data} />
    </Page>
  </Document>;
}
