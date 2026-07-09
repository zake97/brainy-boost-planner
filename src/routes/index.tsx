import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { TaskForm } from "@/components/planner/TaskForm";
import { TaskList } from "@/components/planner/TaskList";
import { FocusTimer } from "@/components/planner/FocusTimer";
import { StudyTimer } from "@/components/planner/StudyTimer";
import { WeekView } from "@/components/planner/WeekView";
import { StatsBar } from "@/components/planner/StatsBar";
import { usePlanner, priorityScore, computeStats } from "@/lib/planner-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — A calmer way to study" },
      {
        name: "description",
        content:
          "Smart study planner with prioritized tasks, Pomodoro focus timer, and weekly insights.",
      },
      { property: "og:title", content: "Lumen — A calmer way to study" },
      {
        property: "og:description",
        content: "Plan, focus, and track your study sessions with a beautifully calm interface.",
      },
    ],
  }),
  component: Index,
});

type Tab = "today" | "upcoming" | "all" | "done";

function Index() {
  const { tasks, sessions, addTask, toggleTask, deleteTask, logSession } = usePlanner();
  const [tab, setTab] = useState<Tab>("today");
  const [activeFocusId, setActiveFocusId] = useState<string | null>(null);
  const [greetText, setGreetText] = useState("Welcome back");
  useEffect(() => setGreetText(greeting()), []);

  const stats = useMemo(() => computeStats(tasks, sessions), [tasks, sessions]);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let list = tasks;
    if (tab === "today") list = tasks.filter((t) => !t.completed && t.dueDate <= today);
    else if (tab === "upcoming") list = tasks.filter((t) => !t.completed && t.dueDate > today);
    else if (tab === "done") list = tasks.filter((t) => t.completed);
    else list = tasks;
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityScore(b) - priorityScore(a);
    });
  }, [tasks, tab]);

  const activeTask = activeFocusId ? tasks.find((t) => t.id === activeFocusId) ?? null : null;

  const counts = {
    today: tasks.filter(
      (t) => !t.completed && t.dueDate <= new Date().toISOString().slice(0, 10),
    ).length,
    upcoming: tasks.filter(
      (t) => !t.completed && t.dueDate > new Date().toISOString().slice(0, 10),
    ).length,
    all: tasks.filter((t) => !t.completed).length,
    done: tasks.filter((t) => t.completed).length,
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-ink-soft shadow-[var(--shadow-paper)]">
              <BookOpen className="size-3.5 text-primary" />
              <span>{greetText} — let's make it count</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight">
              Lumen<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 max-w-md text-ink-soft">
              A calmer way to plan, focus, and finish what matters today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-ink-soft">
            <Sparkles className="size-3.5 text-ochre" />
            <span>Auto-prioritized by urgency × importance</span>
          </div>
        </header>

        <div className="mb-8">
          <StatsBar {...stats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 rounded-full border border-border bg-card p-1 shadow-[var(--shadow-paper)]">
                {(["today", "upcoming", "all", "done"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm capitalize transition",
                      tab === t
                        ? "bg-ink text-paper"
                        : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {t}
                    <span className="ml-1.5 text-xs opacity-70">{counts[t]}</span>
                  </button>
                ))}
              </div>
            </div>

            <TaskList
              tasks={filtered}
              onToggle={toggleTask}
              onDelete={(id) => {
                if (activeFocusId === id) setActiveFocusId(null);
                deleteTask(id);
              }}
              onFocus={setActiveFocusId}
              activeFocusId={activeFocusId}
            />

            <WeekView tasks={tasks} />
          </section>

          {/* Right column */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
             <StudyTimer onLog={(min) => logSession(null, min)} />
            <FocusTimer
              activeTask={activeTask}
              onComplete={(min) => logSession(activeTask?.id ?? null, min)}
              onClear={() => setActiveFocusId(null)}
            />
            <TaskForm onAdd={addTask} />
          </aside>
        </div>

        <footer className="mt-14 border-t border-border/60 pt-6 text-center text-xs text-ink-soft">
          Built for focused minds. Your data lives only in this browser.
        </footer>
      </div>
    </main>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late night session";
}
