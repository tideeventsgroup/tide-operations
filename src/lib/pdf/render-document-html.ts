import { buildEventVariables, type DocumentContent, type TableRow, type TemplateStructure } from "@/lib/document-schema";

type LockedBrandElements = {
  margins_mm?: { top: number; right: number; bottom: number; left: number };
  colours?: { charcoal?: string; teal?: string; white?: string };
  typeface?: string;
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
  const margins = lockedBrandElements.margins_mm ?? { top: 20, right: 18, bottom: 20, left: 18 };
  const eventVariables = buildEventVariables(event);
  const generatedAt = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });

  const sectionsHtml = structure.sections
    .map((section) => {
      const fieldsHtml = section.fields
        .map((field) => {
          const value = content[section.key]?.[field.key];

          if (field.type === "event_variable") {
            const resolved = field.variable ? eventVariables[field.variable] : "";
            return fieldBlock(field.label, escapeHtml((resolved || "Not set") + (field.suffix ?? "")));
          }

          if (field.type === "table") {
            const rows = (value as TableRow[] | undefined) ?? [];
            const columns = field.columns ?? [];
            if (rows.length === 0) return fieldBlock(field.label, "<em>Not provided</em>");
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
              block ? `<p>${escapeHtml(block.content)}</p>` : "<em>Not provided</em>",
            );
          }

          const text = typeof value === "string" ? value : "";
          return fieldBlock(field.label, text ? `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>` : "<em>Not provided</em>");
        })
        .join("");

      return `
        <section class="doc-section">
          <h2>${escapeHtml(section.number)}. ${escapeHtml(section.title)}</h2>
          ${fieldsHtml}
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
  @page { margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm; }
  * { box-sizing: border-box; }
  body {
    font-family: ${typeface}, Helvetica, sans-serif;
    color: ${charcoal};
    font-size: 10.5pt;
    line-height: 1.5;
    margin: 0;
  }
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid ${teal};
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .logo-mark {
    font-size: 20pt;
    font-weight: 700;
    color: ${teal};
    letter-spacing: 1px;
  }
  .logo-sub {
    font-size: 8pt;
    color: ${charcoal};
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .doc-meta { text-align: right; font-size: 8.5pt; color: ${charcoal}; }
  .doc-meta div { margin-bottom: 2px; }
  h1.doc-title { font-size: 16pt; margin: 0 0 4px; color: ${charcoal}; }
  .doc-section { margin-bottom: 16px; page-break-inside: avoid; }
  .doc-section h2 {
    font-size: 11.5pt;
    color: #fff;
    background: ${charcoal};
    padding: 4px 8px;
    margin: 0 0 8px;
  }
  .field-block { margin-bottom: 8px; }
  .field-label {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${teal};
    font-weight: 700;
    margin-bottom: 2px;
  }
  .field-value p { margin: 0; }
  .doc-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  .doc-table th, .doc-table td {
    border: 1px solid #ccc;
    padding: 4px 6px;
    text-align: left;
    vertical-align: top;
  }
  .doc-table th { background: #f0f0f0; }
  .doc-footer {
    position: fixed;
    bottom: -${margins.bottom - 6}mm;
    left: 0;
    right: 0;
    font-size: 7.5pt;
    color: #888;
    border-top: 1px solid #ddd;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>
  <div class="doc-header">
    <div>
      <div class="logo-mark">TIDE</div>
      <div class="logo-sub">Events Group Scotland</div>
    </div>
    <div class="doc-meta">
      <div><strong>${escapeHtml(reference ?? "Unreferenced")}</strong></div>
      <div>Version ${versionNumber}</div>
      <div>Status: ${escapeHtml(status.replace("_", " "))}</div>
      <div>Owner: ${escapeHtml(ownerName)}</div>
    </div>
  </div>

  <h1 class="doc-title">${escapeHtml(title)}</h1>
  <p style="margin:0 0 18px;color:#666;font-size:9pt;">${escapeHtml(templateName)} — ${escapeHtml(event.name)}</p>

  ${sectionsHtml}

  <div class="doc-footer">
    <span>CONTROLLED DOCUMENT — Tide Events Group Scotland. Uncontrolled if printed or saved outside this system.</span>
    <span>Generated ${escapeHtml(generatedAt)}</span>
  </div>
</body>
</html>`;
}

function fieldBlock(label: string, valueHtml: string) {
  return `<div class="field-block"><div class="field-label">${escapeHtml(label)}</div><div class="field-value">${valueHtml}</div></div>`;
}
