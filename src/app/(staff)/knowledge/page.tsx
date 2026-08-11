import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createKnowledgeBlock, archiveKnowledgeBlock } from "@/lib/actions/knowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const CATEGORIES = [
  "Command & Communication",
  "Crowd Management",
  "Welfare",
  "Emergency Procedures",
];

export default async function KnowledgeLibraryPage() {
  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from("knowledge_blocks")
    .select("*")
    .order("category")
    .order("title");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Knowledge Library"
        description="Reusable, version-controlled operational text. Documents reference a block by id and version rather than copying it — update once, it flows to every document that links it."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">New knowledge block</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createKnowledgeBlock} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={4} required className="text-sm" />
            </div>
            <Button type="submit" size="sm">
              Add block
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardContent className="divide-y p-0">
          {blocks?.length ? (
            blocks.map((b) => (
              <div key={b.id} className="space-y-1 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-tide-charcoal">{b.title}</span>
                    <Badge variant="outline" className="text-[11px]">{b.category}</Badge>
                    <Badge
                      variant="outline"
                      className={
                        b.approval_status === "approved"
                          ? "bg-success-bg text-[11px] text-success"
                          : "text-[11px]"
                      }
                    >
                      {b.approval_status}
                    </Badge>
                  </div>
                  {b.approval_status === "approved" && (
                    <form action={archiveKnowledgeBlock}>
                      <input type="hidden" name="id" value={b.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Supersede
                      </Button>
                    </form>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{b.content}</p>
              </div>
            ))
          ) : (
            <EmptyState icon={BookOpen} title="No knowledge blocks yet" className="border-none py-10" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
