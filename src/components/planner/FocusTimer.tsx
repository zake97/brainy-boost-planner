import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Coffee, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/planner-store";

type Mode = "focus" | "break";

interface Props {
  activeTask: Task | null;
  onComplete: (minutes: number) => void;
  onClear: () => void;
}

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
};

export function FocusTimer({ activeTask, onComplete, onClear }: Props) {
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  // seconds accumulated in focus mode since last log/reset
  const [focusElapsed, setFocusElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Flush any accumulated focus seconds as whole minutes to the log.
  // Returns the number of minutes flushed. Keeps leftover seconds < 60.
  function flushFocus(): number {
    let flushed = 0;
    setFocusElapsed((sec) => {
      const mins = Math.floor(sec / 60);
      if (mins > 0) {
        flushed = mins;
        onComplete(mins);
        return sec - mins * 60;
      }
      return sec;
    });
    return flushed;
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      // accumulate elapsed focus time
      if (mode === "focus") {
        setFocusElapsed((e) => {
          const next = e + 1;
          // auto-log every full minute so Today/All time update live
          if (next % 60 === 0) {
            onComplete(1);
            return 0;
          }
          return next;
        });
      }
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          setRunning(false);
          if (mode === "focus") {
            // any leftover seconds already logged above via the % 60 path
            setMode("break");
            return DURATIONS.break;
          } else {
            setMode("focus");
            return DURATIONS.focus;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  function toggleRun() {
    if (running) {
      // pausing — flush any partial minute so it's counted
      setRunning(false);
      flushFocus();
    } else {
      setRunning(true);
    }
  }

  function reset() {
    if (mode === "focus") flushFocus();
    setRunning(false);
    setRemaining(DURATIONS[mode]);
  }

  function switchMode(m: Mode) {
    if (mode === "focus") flushFocus();
    setMode(m);
    setRunning(false);
    setRemaining(DURATIONS[m]);
  }

  function handleClear() {
    if (mode === "focus") flushFocus();
    setRunning(false);
    onClear();
  }

  const total = DURATIONS[mode];
  const progress = 1 - remaining / total;
  const min = Math.floor(remaining / 60).toString().padStart(2, "0");
  const sec = (remaining % 60).toString().padStart(2, "0");

  // SVG ring
  const r = 92;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-paper)]",
      )}
    >
      <div className="absolute inset-0 -z-0 opacity-60" style={{ background: "var(--gradient-warm)" }} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Focus</p>
            <h3 className="font-display text-xl font-semibold">
              {activeTask ? activeTask.title : "Pick a task"}
            </h3>
            {activeTask && (
              <p className="text-xs text-muted-foreground">{activeTask.subject}</p>
            )}
          </div>
          <div className="flex rounded-full bg-background/70 p-1 text-xs">
            <button
              onClick={() => switchMode("focus")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 transition",
                mode === "focus" && "bg-primary text-primary-foreground",
              )}
            >
              <Brain className="size-3" /> Focus
            </button>
            <button
              onClick={() => switchMode("break")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 transition",
                mode === "break" && "bg-sage text-primary-foreground",
              )}
            >
              <Coffee className="size-3" /> Break
            </button>
          </div>
        </div>

        <div className="my-6 flex justify-center">
          <div className="relative size-56">
            <svg viewBox="0 0 200 200" className="size-full -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="oklch(0.88 0.02 70)"
                strokeWidth="6"
              />
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={mode === "focus" ? "var(--terracotta)" : "var(--sage)"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-6xl font-semibold tabular-nums tracking-tight">
                {min}:{sec}
              </span>
              <span className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-soft">
                {mode === "focus" ? "Deep work" : "Recharge"}
              </span>
            </div>
          </div>
        </div>

        {mode === "focus" && (
          <p className="mb-3 text-center text-xs text-ink-soft">
            Logging live · {focusElapsed}s toward the next minute
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          <Button
            size="lg"
            onClick={toggleRun}
            className="min-w-32"
          >
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="lg" variant="outline" onClick={reset}>
            <RotateCcw className="size-4" />
          </Button>
          {activeTask && (
            <Button size="lg" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
