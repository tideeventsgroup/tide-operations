// Shape of document_templates.structure_json (section 4.2/6.5). The schema-
// driven form renderer (Document Studio, OSSP editor) walks this to build
// the editing UI — adding a new document type means a new template row,
// not new editor code.

export type FieldType = "text" | "textarea" | "event_variable" | "table" | "knowledge_block_ref";

export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  variable?: string; // event_variable
  suffix?: string; // event_variable
  columns?: string[]; // table
  category?: string; // knowledge_block_ref
};

export type TemplateSection = {
  key: string;
  number: string;
  title: string;
  fields: TemplateField[];
};

export type TemplateStructure = {
  sections: TemplateSection[];
};

export type TableRow = Record<string, string>;

export type KnowledgeBlockRefValue = {
  knowledge_block_id: string | null;
};

export type DocumentContent = {
  [sectionKey: string]: {
    [fieldKey: string]: string | TableRow[] | KnowledgeBlockRefValue | undefined;
  };
};

export type EventVariables = Record<string, string>;

// Resolves event.* / venue.* variables referenced by event_variable fields.
export function buildEventVariables(event: {
  name: string;
  venue: string | null;
  start_date: string | null;
  end_date: string | null;
  expected_attendance: number | null;
  control_location: string | null;
  event_manager_name?: string | null;
}): EventVariables {
  return {
    "event.name": event.name,
    "venue.name": event.venue ?? "",
    "event.dates": event.start_date
      ? event.end_date && event.end_date !== event.start_date
        ? `${event.start_date} – ${event.end_date}`
        : event.start_date
      : "",
    "event.expected_attendance": event.expected_attendance?.toString() ?? "",
    "event.control": event.control_location ?? "",
    "event.manager": event.event_manager_name ?? "",
  };
}

export function computeCompletionPct(structure: TemplateStructure, content: DocumentContent): number {
  let total = 0;
  let filled = 0;

  for (const section of structure.sections) {
    for (const field of section.fields) {
      if (field.type === "event_variable") continue;
      if (!field.required) continue;
      total += 1;

      const value = content[section.key]?.[field.key];
      if (field.type === "table") {
        if (Array.isArray(value) && value.length > 0) filled += 1;
      } else if (field.type === "knowledge_block_ref") {
        if (value && typeof value === "object" && "knowledge_block_id" in value && value.knowledge_block_id) {
          filled += 1;
        }
      } else if (typeof value === "string" && value.trim() !== "") {
        filled += 1;
      }
    }
  }

  if (total === 0) return 100;
  return Math.round((filled / total) * 100);
}
