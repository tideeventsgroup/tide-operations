"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
    <div className={cn("space-y-3.5", !readOnly && "pb-24")}>
      {structure.sections.map((section) => (
        <Card key={section.key} className="gap-0 py-0">
          <div className="flex items-center gap-2.5 border-b px-5 py-3.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-tide-teal text-[11px] font-bold text-white">
              {section.number}
            </span>
            <h3 className="text-[14.5px] font-semibold text-tide-charcoal">{section.title}</h3>
          </div>
          <CardContent className="space-y-4 py-4 pl-[46px]">
            {section.fields.map((field) => {
              const value = content[section.key]?.[field.key];

              if (field.type === "event_variable") {
                const resolved = field.variable ? eventVariables[field.variable] : "";
                return (
                  <div key={field.key} className="space-y-1">
                    <div className="text-[11px] font-semibold tracking-wide text-tide-teal uppercase">{field.label}</div>
                    <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-tide-charcoal">
                      {resolved || "Not set"}
                      {field.suffix ?? ""}
                    </div>
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
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
                    <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {field.label}
                      {field.required && <span className="text-destructive"> *</span>}
                    </label>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            {columns.map((col) => (
                              <th key={col} className="px-2.5 py-2 text-left text-[11.5px] font-semibold text-tide-charcoal">
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
                                    size="icon-sm"
                                    aria-label="Remove row"
                                    onClick={() => updateField(section.key, field.key, rows.filter((_, i) => i !== rowIndex))}
                                  >
                                    <Trash2 className="size-3.5 text-muted-foreground" />
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
                        <Plus className="size-3.5" />
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
                    <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
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
                      <div className="rounded-r-md border-l-[3px] border-tide-teal bg-tide-teal/5 py-2 pr-3 pl-3">
                        <div className="mb-0.5 text-[10px] font-semibold tracking-wide text-tide-teal uppercase">
                          Knowledge Library
                        </div>
                        <p className="text-[12.5px] leading-relaxed text-tide-charcoal">{selected.content}</p>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
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
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 text-[12.5px] font-medium text-muted-foreground">Completion</span>
              <Progress value={completionPct} className="w-32" />
              <span className="w-9 shrink-0 text-[12.5px] font-semibold text-tide-charcoal tabular-nums">
                {completionPct}%
              </span>
            </div>
            <Button onClick={handleSave} disabled={pending}>
              <Save className="size-3.5" />
              {pending ? "Saving…" : "Save draft"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

