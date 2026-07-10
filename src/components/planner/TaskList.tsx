import { Check, Trash2, Play, Flame } from "lucide-react";
import type { Task } from "@/lib/planner-store";
import { cn, formatMinutes } from "@/lib/utils";

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  activeFocusId: string | null;
}

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-primary/10 text-primary border-primary/30",
  medium: "bg-ochre/15 text-ink border-ochre/40",
  low: "bg-sage/15 text-ink border-sage/40",
};

function formatDue(date: string) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${-diff}d overdue`;
  if (diff < 7) return `In ${diff}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TaskList({ tasks, onToggle, onDelete, onFocus, activeFocusId }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
        <p className="font-display text-2xl text-ink-soft">A clean slate.</p>
        <p className="mt-2 text-sm text-muted-foreground">Add your first task to start planning.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => {
        const overdue = !t.completed && new Date(t.dueDate) < new Date(new Date().toDateString());
        const active = activeFocusId === t.id;
        return (
          <li
            key={t.id}
            className={cn(
              "group flex items-center gap-3 rounded-xl border bg-card p-3 pr-2 transition",
              "shadow-[var(--shadow-paper)] hover:shadow-[var(--shadow-lift)]",
              active && "border-primary ring-2 ring-primary/20",
              t.completed && "opacity-60",
            )}
          >
            <button
              onClick={() => onToggle(t.id)}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md border transition",
                t.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border hover:border-primary",
              )}
              aria-label="Toggle complete"
            >
              {t.completed && <Check className="size-4" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={cn("truncate font-medium", t.completed && "line-through")}>
                  {t.title}
                </p>
                {overdue && <Flame className="size-3.5 text-destructive shrink-0" />}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{t.subject}</span>
                <span>·</span>
                <span>{formatMinutes(t.estimatedMin)}</span>
                <span>·</span>
                <span className={cn(overdue && "text-destructive font-medium")}>
                  {formatDue(t.dueDate)}
                </span>
              </div>
            </div>

            <span
              className={cn(
                "hidden sm:inline-block rounded-full border px-2 py-0.5 text-xs capitalize",
                priorityStyles[t.priority],
              )}
            >
              {t.priority}
            </span>

            {!t.completed && (
              <button
                onClick={() => onFocus(t.id)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-accent hover:text-primary",
                  active && "bg-primary/10 text-primary",
                )}
                aria-label="Focus"
              >
                <Play className="size-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(t.id)}
              className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
