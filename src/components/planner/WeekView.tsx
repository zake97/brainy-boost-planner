import type { Task } from "@/lib/planner-store";
import { cn } from "@/lib/utils";

interface Props {
  tasks: Task[];
}

export function WeekView({ tasks }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // start on Monday
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dayTasks = tasks.filter((t) => t.dueDate === iso);
    const total = dayTasks.reduce((a, t) => a + t.estimatedMin, 0);
    return { date: d, iso, tasks: dayTasks, total };
  });

  const max = Math.max(60, ...days.map((d) => d.total));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-paper)]">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-xl font-semibold">This week</h3>
        <p className="text-xs text-muted-foreground">
          {monday.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const isToday = d.iso === new Date().toISOString().slice(0, 10);
          const heightPct = (d.total / max) * 100;
          return (
            <div key={d.iso} className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-ink-soft">
                {d.date.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full font-display text-sm font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-ink",
                )}
              >
                {d.date.getDate()}
              </div>
              <div className="relative h-20 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 transition-all",
                    isToday ? "bg-primary/70" : "bg-ink/40",
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] text-ink-soft tabular-nums">
                {d.total > 0 ? `${d.total}m` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
