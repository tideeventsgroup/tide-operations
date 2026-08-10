import { buildEventVariables, type DocumentContent, type TableRow, type TemplateStructure } from "@/lib/document-schema";

type LockedBrandElements = {
  margins_mm?: { top: number; right: number; bottom: number; left: number };
  colours?: { charcoal?: string; teal?: string; white?: string };
  typeface?: string;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  needs_updates: "Needs Updates",
  approved: "Approved",
  issued: "Issued",
  archived: "Archived",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders a document's content_json against its template structure_json into
 * a single branded HTML page for Chromium to print as a PDF (section 6.8).
 * Locked brand elements (logo position, margins, colours, typeface) come
 * from document_templates.locked_brand_elements and are never author-editable.
 *
 * Page margins are applied via Puppeteer's `margin` option (see launch-browser
 * call site), not @page CSS here — that leaves room for Puppeteer's native
 * header/footer templates, which are the only thing Chromium actually repeats
 * on every printed page (a CSS `position: fixed` footer does not).
 */
export function renderDocumentHtml(params: {
  templateName: string;
  outputFormat: string;
  structure: TemplateStructure;
  content: DocumentContent;
  lockedBrandElements: LockedBrandElements;
  reference: string | null;
  title: string;
  status: string;
  versionNumber: number;
  ownerName: string;
  event: {
    name: string;
    venue: string | null;
    start_date: string | null;
    end_date: string | null;
    expected_attendance: number | null;
    control_location: string | null;
  };
  knowledgeBlockContentById: Record<string, { title: string; content: string }>;
}) {
  const {
    templateName,
    structure,
    content,
    lockedBrandElements,
    reference,
    title,
    status,
    versionNumber,
    ownerName,
    event,
    knowledgeBlockContentById,
  } = params;

  const charcoal = lockedBrandElements.colours?.charcoal ?? "#373536";
  const teal = lockedBrandElements.colours?.teal ?? "#60B9C5";
  const typeface = lockedBrandElements.typeface ?? "Arial";
  const eventVariables = buildEventVariables(event);
  const statusLabel = STATUS_LABELS[status] ?? status;
  const showWatermark = status !== "issued";

  const sectionsHtml = structure.sections
    .map((section) => {
      const fieldsHtml = section.fields
        .map((field) => {
          const value = content[section.key]?.[field.key];

          if (field.type === "event_variable") {
            const resolved = field.variable ? eventVariables[field.variable] : "";
            return fieldBlock(field.label, escapeHtml((resolved || "Not set") + (field.suffix ?? "")), true);
          }

          if (field.type === "table") {
            const rows = (value as TableRow[] | undefined) ?? [];
            const columns = field.columns ?? [];
            if (rows.length === 0) return fieldBlock(field.label, emptyValue());
            const head = columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
            const body = rows
              .map(
                (row) =>
                  `<tr>${columns
                    .map((_, i) => `<td>${escapeHtml(row[`c${i}`] ?? "")}</td>`)
                    .join("")}</tr>`,
              )
              .join("");
            return fieldBlock(
              field.label,
              `<table class="doc-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
            );
          }

          if (field.type === "knowledge_block_ref") {
            const refId = (value as { knowledge_block_id: string | null } | undefined)?.knowledge_block_id;
            const block = refId ? knowledgeBlockContentById[refId] : null;
            return fieldBlock(
              field.label,
              block
                ? `<div class="kb-ref"><span class="kb-ref-tag">Knowledge Library</span><p>${escapeHtml(block.content)}</p></div>`
                : emptyValue(),
            );
          }

          const text = typeof value === "string" ? value : "";
          return fieldBlock(field.label, text ? `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>` : emptyValue());
        })
        .join("");

      return `
        <section class="doc-section">
          <div class="doc-section-head">
            <span class="doc-section-num">${escapeHtml(section.number)}</span>
            <h2>${escapeHtml(section.title)}</h2>
          </div>
          <div class="doc-section-body">
            ${fieldsHtml}
          </div>
        </section>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    font-family: ${typeface}, Helvetica, sans-serif;
    color: ${charcoal};
    font-size: 10pt;
    line-height: 1.55;
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  ${showWatermark ? `
  .watermark {
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-32deg);
    font-size: 88pt;
    font-weight: 800;
    color: ${charcoal};
    opacity: 0.045;
    letter-spacing: 6px;
    white-space: nowrap;
    z-index: -1;
  }` : ""}

  .brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 4px;
  }
  .brand-mark { display: flex; align-items: center; gap: 9px; }
  .brand-wordmark { font-size: 15pt; font-weight: 800; color: ${charcoal}; letter-spacing: 0.5px; }
  .brand-sub { font-size: 7pt; color: #8a8888; letter-spacing: 2px; text-transform: uppercase; margin-top: 1px; }
  .status-pill {
    display: inline-block;
    padding: 3px 11px;
    border-radius: 999px;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    background: ${statusPillBackground(status, teal)};
    color: ${statusPillColor(status, charcoal)};
  }

  .title-band {
    border-top: 3px solid ${teal};
    padding-top: 14px;
    margin-bottom: 14px;
  }
  h1.doc-title { font-size: 19pt; margin: 0 0 3px; color: ${charcoal}; font-weight: 800; letter-spacing: -0.2px; }
  .doc-subtitle { margin: 0; color: #6b6a6b; font-size: 9.5pt; }

  .control-block {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: 1px solid #e2e2e2;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 22px;
    background: #fafafa;
  }
  .control-cell {
    padding: 8px 12px;
    border-right: 1px solid #e2e2e2;
    border-bottom: 1px solid #e2e2e2;
  }
  .control-cell:nth-child(3n) { border-right: none; }
  .control-cell:nth-last-child(-n+3) { border-bottom: none; }
  .control-label {
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #9a9898;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .control-value { font-size: 9pt; font-weight: 600; color: ${charcoal}; }

  .doc-section { margin-bottom: 15px; page-break-inside: avoid; }
  .doc-section-head {
    display: flex;
    align-items: center;
    gap: 9px;
    border-bottom: 1.5px solid ${teal};
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  .doc-section-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: ${teal};
    color: #ffffff;
    font-size: 9pt;
    font-weight: 800;
    flex-shrink: 0;
  }
  .doc-section-head h2 { font-size: 11.5pt; margin: 0; color: ${charcoal}; font-weight: 700; }
  .doc-section-body { padding-left: 29px; }

  .field-block { margin-bottom: 9px; }
  .field-block:last-child { margin-bottom: 0; }
  .field-label {
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${teal};
    font-weight: 700;
    margin-bottom: 2px;
  }
  .field-value p { margin: 0; }
  .field-empty { color: #b3b1b1; font-style: italic; font-size: 9.5pt; }

  .kb-ref { border-left: 2.5px solid ${teal}; padding: 2px 0 2px 10px; }
  .kb-ref-tag {
    display: inline-block;
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    color: ${teal};
    margin-bottom: 2px;
  }
  .kb-ref p { margin: 0; }

  .doc-table { width: 100%; border-collapse: collapse; font-size: 9pt; border-radius: 4px; overflow: hidden; }
  .doc-table th, .doc-table td {
    border-bottom: 1px solid #eaeaea;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  .doc-table th {
    background: ${charcoal};
    color: #ffffff;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: 700;
    border-bottom: none;
  }
  .doc-table tbody tr:nth-child(even) { background: #f7f7f7; }
</style>
</head>
<body>
  ${showWatermark ? `<div class="watermark">${escapeHtml(statusLabel.toUpperCase())}</div>` : ""}

  <div class="brand-row">
    <div class="brand-mark">
      ${brandMarkSvg(teal)}
      <div>
        <div class="brand-wordmark">TIDE</div>
        <div class="brand-sub">Events Group Scotland</div>
      </div>
    </div>
    <span class="status-pill">${escapeHtml(statusLabel)}</span>
  </div>

  <div class="title-band">
    <h1 class="doc-title">${escapeHtml(title)}</h1>
    <p class="doc-subtitle">${escapeHtml(templateName)} &middot; ${escapeHtml(event.name)}</p>
  </div>

  <div class="control-block">
    <div class="control-cell"><div class="control-label">Reference</div><div class="control-value">${escapeHtml(reference ?? "Unreferenced")}</div></div>
    <div class="control-cell"><div class="control-label">Version</div><div class="control-value">${versionNumber}</div></div>
    <div class="control-cell"><div class="control-label">Owner</div><div class="control-value">${escapeHtml(ownerName)}</div></div>
    <div class="control-cell"><div class="control-label">Event</div><div class="control-value">${escapeHtml(event.name)}</div></div>
    <div class="control-cell"><div class="control-label">Event Dates</div><div class="control-value">${escapeHtml(eventVariables["event.dates"] || "—")}</div></div>
    <div class="control-cell"><div class="control-label">Venue</div><div class="control-value">${escapeHtml(event.venue ?? "—")}</div></div>
  </div>

  ${sectionsHtml}
</body>
</html>`;
}

/**
 * Puppeteer's page.pdf({ headerTemplate, footerTemplate }) is the only thing
 * Chromium actually repeats on every printed page — a CSS `position: fixed`
 * element in the main document does not. These run in an isolated context:
 * inline styles only, explicit font-size required, and the special classes
 * below (`pageNumber`, `totalPages`) are substituted by Chromium itself.
 */
export function buildPdfFooterTemplate(params: {
  reference: string | null;
  versionNumber: number;
}) {
  const ref = escapeHtml(params.reference ?? "Unreferenced");
  return `
    <div style="width:100%; font-family:Arial,Helvetica,sans-serif; font-size:7.5px; color:#9a9898; padding:0 18mm; display:flex; justify-content:space-between; align-items:center;">
      <span>${ref} &middot; v${params.versionNumber} &middot; CONTROLLED DOCUMENT — uncontrolled if printed or saved outside this system</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;
}

export function buildPdfHeaderTemplate(params: { title: string; teal: string }) {
  const title = escapeHtml(params.title);
  return `
    <div style="width:100%; font-family:Arial,Helvetica,sans-serif; font-size:7.5px; color:#9a9898; padding:0 18mm 4px; border-bottom:0.75px solid ${params.teal}; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:700; color:#373536;">TIDE</span>
      <span>${title}</span>
    </div>
  `;
}

function fieldBlock(label: string, valueHtml: string, muted = false) {
  return `<div class="field-block${muted ? " field-muted" : ""}"><div class="field-label">${escapeHtml(label)}</div><div class="field-value">${valueHtml}</div></div>`;
}

function emptyValue() {
  return `<span class="field-empty">Not provided</span>`;
}

function statusPillBackground(status: string, teal: string) {
  switch (status) {
    case "issued":
      return "#dcf5e6";
    case "approved":
      return "#dbeeff";
    case "needs_updates":
      return "#fde3e0";
    case "in_review":
      return "#fdf0d5";
    case "archived":
      return "#ececec";
    default:
      return `${teal}22`;
  }
}

function statusPillColor(status: string, charcoal: string) {
  switch (status) {
    case "issued":
      return "#1b7a43";
    case "approved":
      return "#1a5ba6";
    case "needs_updates":
      return "#b3401f";
    case "in_review":
      return "#93690b";
    case "archived":
      return "#666565";
    default:
      return charcoal;
  }
}

function brandMarkSvg(teal: string) {
  return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="26" height="26" rx="6" fill="${teal}"/>
    <path d="M5 15.5c1.8 0 1.8-2.5 3.6-2.5s1.8 2.5 3.6 2.5 1.8-2.5 3.6-2.5 1.8 2.5 3.6 2.5" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M5 10.5c1.8 0 1.8-2.5 3.6-2.5s1.8 2.5 3.6 2.5 1.8-2.5 3.6-2.5 1.8 2.5 3.6 2.5" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
  </svg>`;
}
