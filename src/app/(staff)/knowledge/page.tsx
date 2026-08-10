import { createClient } from "@/lib/supabase/server";
import { createKnowledgeBlock, archiveKnowledgeBlock } from "@/lib/actions/knowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tide-charcoal">Knowledge Library</h1>
        <p className="text-sm text-muted-foreground">
          Reusable, version-controlled operational text. Documents reference a block by id and
          version rather than copying it — update once, it flows to every document that links it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New knowledge block</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createKnowledgeBlock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={5} required />
            </div>
            <Button type="submit">Add block</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y p-0">
          {blocks?.length ? (
            blocks.map((b) => (
              <div key={b.id} className="space-y-1 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-tide-charcoal">{b.title}</span>
                    <Badge variant="outline">{b.category}</Badge>
                    <Badge variant="outline" className={b.approval_status === "approved" ? "bg-emerald-100 text-emerald-800" : ""}>
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
                <p className="text-muted-foreground">{b.content}</p>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-muted-foreground">No knowledge blocks yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
