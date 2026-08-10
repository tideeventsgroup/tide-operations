"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveDocumentContent } from "@/lib/actions/documents";
import {
  buildEventVariables,
  computeCompletionPct,
  type DocumentContent,
  type TableRow,
  type TemplateStructure,
} from "@/lib/document-schema";

type KnowledgeBlockOption = { id: string; title: string; category: string; content: string };

export function DocumentEditor({
  documentId,
  versionId,
  structure,
  initialContent,
  event,
  knowledgeBlocks,
  readOnly,
}: {
  documentId: string;
  versionId: string;
  structure: TemplateStructure;
  initialContent: DocumentContent;
  event: {
    name: string;
    venue: string | null;
    start_date: string | null;
    end_date: string | null;
    expected_attendance: number | null;
    control_location: string | null;
  };
  knowledgeBlocks: KnowledgeBlockOption[];
  readOnly: boolean;
}) {
  const [content, setContent] = useState<DocumentContent>(initialContent);
  const [pending, startTransition] = useTransition();
  const eventVariables = buildEventVariables(event);
  const completionPct = computeCompletionPct(structure, content);

  function updateField(sectionKey: string, fieldKey: string, value: string | TableRow[] | { knowledge_block_id: string | null }) {
    setContent((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [fieldKey]: value },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("document_id", documentId);
      formData.set("version_id", versionId);
      formData.set("content_json", JSON.stringify(content));
      formData.set("completion_pct", String(computeCompletionPct(structure, content)));
      try {
        await saveDocumentContent(formData);
        toast.success("Draft saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-4 pb-24">
      {structure.sections.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <CardTitle className="text-base">
              {section.number}. {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => {
              const value = content[section.key]?.[field.key];

              if (field.type === "event_variable") {
                const resolved = field.variable ? eventVariables[field.variable] : "";
                return (
                  <div key={field.key} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">{field.label}</div>
                    <div className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-tide-charcoal">
                      {resolved || "Not set"}
                      {field.suffix ?? ""}
                    </div>
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive"> *</span>}
                    </label>
                    <Textarea
                      rows={4}
                      disabled={readOnly}
                      value={(value as string) ?? ""}
                      onChange={(e) => updateField(section.key, field.key, e.target.value)}
                    />
                  </div>
                );
              }

              if (field.type === "table") {
                const rows = (value as TableRow[] | undefined) ?? [];
                const columns = field.columns ?? [];
                return (
                  <div key={field.key} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive"> *</span>}
                    </label>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/40">
                            {columns.map((col) => (
                              <th key={col} className="px-2 py-1.5 text-left font-medium text-tide-charcoal">
                                {col}
                              </th>
                            ))}
                            <th className="w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b last:border-0">
                              {columns.map((col, colIndex) => (
                                <td key={col} className="p-1">
                                  <Input
                                    disabled={readOnly}
                                    value={row[`c${colIndex}`] ?? ""}
                                    onChange={(e) => {
                                      const next = rows.map((r, i) =>
                                        i === rowIndex ? { ...r, [`c${colIndex}`]: e.target.value } : r,
                                      );
                                      updateField(section.key, field.key, next);
                                    }}
                                    className="h-8"
                                  />
                                </td>
                              ))}
                              <td>
                                {!readOnly && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateField(section.key, field.key, rows.filter((_, i) => i !== rowIndex))}
                                  >
                                    ×
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateField(section.key, field.key, [...rows, {}])}
                      >
                        Add row
                      </Button>
                    )}
                  </div>
                );
              }

              if (field.type === "knowledge_block_ref") {
                const refValue = (value as { knowledge_block_id: string | null } | undefined)?.knowledge_block_id ?? "";
                const options = knowledgeBlocks.filter((k) => k.category === field.category);
                const selected = options.find((o) => o.id === refValue);
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive"> *</span>}
                    </label>
                    <select
                      disabled={readOnly}
                      value={refValue}
                      onChange={(e) => updateField(section.key, field.key, { knowledge_block_id: e.target.value || null })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">No linked knowledge block</option>
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.title}
                        </option>
                      ))}
                    </select>
                    {selected && (
                      <p className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        {selected.content}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </label>
                  <Input
                    disabled={readOnly}
                    value={(value as string) ?? ""}
                    onChange={(e) => updateField(section.key, field.key, e.target.value)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {!readOnly && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white/95 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Completion</span>
              <Badge variant="outline">{completionPct}%</Badge>
            </div>
            <Button onClick={handleSave} disabled={pending}>
              {pending ? "Saving…" : "Save draft"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
