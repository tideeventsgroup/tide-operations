"use client";

import { updateTaskStatus } from "@/lib/actions/tasks";

const COLUMNS = [
  { status: "to_do", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "in_review", label: "In review" },
  { status: "complete", label: "Complete" },
] as const;

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: string }) {
  return (
    <form action={updateTaskStatus}>
      <input type="hidden" name="id" value={taskId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-7 rounded-md border border-input bg-background px-1 text-xs"
      >
        {COLUMNS.map((c) => (
          <option key={c.status} value={c.status}>
            {c.label}
          </option>
        ))}
      </select>
    </form>
  );
}
