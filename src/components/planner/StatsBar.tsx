import { Flame, Target, Clock, TrendingUp } from "lucide-react";

interface Props {
  streak: number;
  minutesToday: number;
  totalMinutes: number;
  completionRate: number;
}

export function StatsBar({ streak, minutesToday, totalMinutes, completionRate }: Props) {
  const items = [
    { label: "Day streak", value: streak, icon: Flame, accent: "text-primary" },
    {
      label: "Today",
      value: minutesToday >= 60 ? `${(minutesToday / 60).toFixed(1)}h` : `${minutesToday}m`,
      icon: Clock,
      accent: "text-ochre",
    },
    {
      label: "All time",
      value: totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}m`,
      icon: TrendingUp,
      accent: "text-sage",
    },
    { label: "Completion", value: `${completionRate}%`, icon: Target, accent: "text-ink" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-paper)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-ink-soft">
              {it.label}
            </span>
            <it.icon className={`size-4 ${it.accent}`} />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{it.value}</p>
        </div>
      ))}
    </div>
  );
}
