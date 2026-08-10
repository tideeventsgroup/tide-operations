import { createClient } from "@/lib/supabase/server";
import { createTask, deleteTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusSelect } from "@/components/task-status-select";

const COLUMNS = [
  { status: "to_do", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "in_review", label: "In review" },
  { status: "complete", label: "Complete" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-800",
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tide-charcoal">Tasks</h1>
        <p className="text-sm text-muted-foreground">Portfolio-wide planning work and document-related actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New task</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTask} className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Title</label>
              <Input name="title" required className="w-56" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Event</label>
              <select name="event_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Portfolio-level</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Owner</label>
              <select name="owner_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Unassigned</option>
                {staffDirectory?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Priority</label>
              <select name="priority" defaultValue="medium" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Due date</label>
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
          <div key={col.status} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-tide-charcoal">{col.label}</h2>
              <span className="text-xs text-muted-foreground">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((task) => {
                const event = task.events as { name: string } | null;
                const owner = task.user_profiles as { full_name: string; email: string } | null;
                return (
                  <Card key={task.id} className="gap-2 py-3">
                    <CardContent className="space-y-2 px-3">
                      <div className="text-sm font-medium text-tide-charcoal">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {event?.name ?? "Portfolio"}
                        {owner ? ` · ${owner.full_name || owner.email}` : ""}
                        {task.due_date ? ` · ${task.due_date}` : ""}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={PRIORITY_STYLES[task.priority]}>
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <TaskStatusSelect taskId={task.id} status={task.status} />
                          <form action={deleteTask}>
                            <input type="hidden" name="id" value={task.id} />
                            <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              ×
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {col.items.length === 0 && (
                <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                  Nothing here.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
