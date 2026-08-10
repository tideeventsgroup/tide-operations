import { ListPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createTask, deleteTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TaskStatusSelect } from "@/components/task-status-select";
import { initials, cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const COLUMNS = [
  { status: "to_do", label: "To do", dot: "bg-muted-foreground/50" },
  { status: "in_progress", label: "In progress", dot: "bg-tide-teal" },
  { status: "in_review", label: "In review", dot: "bg-warning" },
  { status: "complete", label: "Complete", dot: "bg-success" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info-bg text-info",
  high: "bg-warning-bg text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

export default async function TasksPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: events }, { data: staffDirectory }] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, status, priority, due_date, event_id, owner_id, events(name), user_profiles!tasks_owner_id_fkey(full_name, email)",
      )
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("events").select("id, name").order("name"),
    supabase.from("user_profiles").select("id, full_name, email").eq("account_type", "staff"),
  ]);

  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: tasks?.filter((t) => t.status === col.status) ?? [],
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Tasks" description="Portfolio-wide planning work and document-related actions." />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <ListPlus className="size-4 text-tide-teal" />
            New task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTask} className="flex flex-wrap items-end gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input name="title" required className="w-56" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Event</label>
              <select name="event_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Portfolio-level</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Owner</label>
              <select name="owner_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Unassigned</option>
                {staffDirectory?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select name="priority" defaultValue="medium" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Due date</label>
              <Input name="due_date" type="date" />
            </div>
            <Button type="submit" size="sm">
              Add task
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {grouped.map((col) => (
          <div key={col.status} className="min-w-0">
            <div className="mb-2.5 flex items-center gap-2 px-0.5">
              <span className={cn("size-2 shrink-0 rounded-full", col.dot)} />
              <h2 className="text-[13px] font-semibold text-tide-charcoal">{col.label}</h2>
              <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                {col.items.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.items.map((task) => {
                const event = task.events as { name: string } | null;
                const owner = task.user_profiles as { full_name: string; email: string } | null;
                return (
                  <Card key={task.id} className="gap-2.5 py-3 transition-shadow duration-150 hover:shadow-md">
                    <CardContent className="space-y-2.5 px-3.5">
                      <div className="text-[13.5px] leading-snug font-medium text-tide-charcoal">{task.title}</div>
                      <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                        {owner && (
                          <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-tide-teal/15 text-[8.5px] font-bold text-tide-teal">
                            {initials(owner.full_name || owner.email)}
                          </span>
                        )}
                        <span className="truncate">
                          {event?.name ?? "Portfolio"}
                          {task.due_date ? ` · ${task.due_date}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={cn("text-[10.5px]", PRIORITY_STYLES[task.priority])}>
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          <TaskStatusSelect taskId={task.id} status={task.status} />
                          <form action={deleteTask}>
                            <input type="hidden" name="id" value={task.id} />
                            <Button type="submit" size="icon-sm" variant="ghost" aria-label="Delete task">
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {col.items.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-[12px] text-muted-foreground/70">
                  Nothing here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
