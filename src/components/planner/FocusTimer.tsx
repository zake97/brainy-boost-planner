import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Coffee, Brain, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/planner-store";

type Mode = "focus" | "break";

interface Props {
  activeTask: Task | null;
  onComplete: (minutes: number) => void;
  onClear: () => void;
}

const BREAK_SEC = 5 * 60;
const DEFAULT_FOCUS_MIN = 25;
const MIN_FOCUS_MIN = 5;
const MAX_FOCUS_MIN = 8 * 60; // 8h ceiling, just to keep the ring/number sane

export function FocusTimer({ activeTask, onComplete, onClear }: Props) {
  // Manual focus length, used whenever there's no active task driving it.
  const [manualFocusMin, setManualFocusMin] = useState(DEFAULT_FOCUS_MIN);

  // The task's planned study time takes over the focus duration when one is selected.
  const focusDurationMin = activeTask
    ? Math.min(MAX_FOCUS_MIN, Math.max(MIN_FOCUS_MIN, activeTask.estimatedMin))
    : manualFocusMin;
  const focusDurationSec = focusDurationMin * 60;

  const [mode, setModeState] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(focusDurationSec);

  // Always call the freshest onComplete without needing to tear down
  // and restart the interval every render.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const intervalRef = useRef<number | null>(null);
  // Date.now() when the current running segment began (null while paused).
  const segmentStartRef = useRef<number | null>(null);
  // "remaining" value frozen at the start of the current segment.
  const segmentBaseRef = useRef(focusDurationSec);
  // Whole minutes already flushed to onComplete for the current focus block.
  const loggedMinutesRef = useRef(0);

  function durationFor(m: Mode) {
    return m === "focus" ? focusDurationSec : BREAK_SEC;
  }

  // Real-clock based, so it self-corrects even if the tab was throttled
  // in the background and ticks were skipped or delayed.
  function computeRemaining(): number {
    if (!running || segmentStartRef.current === null) return segmentBaseRef.current;
    const elapsed = Math.floor((Date.now() - segmentStartRef.current) / 1000);
    return Math.max(0, segmentBaseRef.current - elapsed);
  }

  function flushWholeMinutes(currentRemaining: number) {
    if (mode !== "focus") return;
    const focusElapsedSec = focusDurationSec - currentRemaining;
    const wholeMin = Math.floor(focusElapsedSec / 60);
    const delta = wholeMin - loggedMinutesRef.current;
    if (delta > 0) {
      loggedMinutesRef.current = wholeMin;
      onCompleteRef.current(delta);
    }
  }

  function finishSegment() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setRunning(false);
    const next: Mode = mode === "focus" ? "break" : "focus";
    setModeState(next);
    loggedMinutesRef.current = 0;
    segmentBaseRef.current = durationFor(next);
    segmentStartRef.current = null;
    setRemaining(durationFor(next));
  }

  function tick() {
    const r = computeRemaining();
    setRemaining(r);
    flushWholeMinutes(r);
    if (r <= 0) finishSegment();
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(tick, 1000);
    // Correct immediately in case time already passed (e.g. resuming
    // after the tab was backgrounded).
    tick();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  // Re-sync the instant the tab becomes visible again, so the numbers
  // never look "stuck" after switching away and back.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible" && running) tick();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  // Keep the idle focus countdown synced to the selected task's planned
  // time (e.g. picking a different task, or its estimate changing).
  useEffect(() => {
    if (running || mode !== "focus") return;
    segmentBaseRef.current = focusDurationSec;
    setRemaining(focusDurationSec);
  }, [focusDurationSec, mode, running]);

  function toggleRun() {
    if (running) {
      // pausing — freeze remaining time and flush any partial minute
      const r = computeRemaining();
      segmentBaseRef.current = r;
      segmentStartRef.current = null;
      setRemaining(r);
      flushWholeMinutes(r);
      setRunning(false);
    } else {
      segmentStartRef.current = Date.now();
      setRunning(true);
    }
  }

  function reset() {
    if (running) flushWholeMinutes(computeRemaining());
    setRunning(false);
    segmentStartRef.current = null;
    segmentBaseRef.current = durationFor(mode);
    loggedMinutesRef.current = 0;
    setRemaining(durationFor(mode));
  }

  function switchMode(m: Mode) {
    if (running && mode === "focus") flushWholeMinutes(computeRemaining());
    setModeState(m);
    setRunning(false);
    segmentStartRef.current = null;
    segmentBaseRef.current = durationFor(m);
    loggedMinutesRef.current = 0;
    setRemaining(durationFor(m));
  }

  function handleClear() {
    if (running && mode === "focus") flushWholeMinutes(computeRemaining());
    setRunning(false);
    onClear();
  }

  function adjustManualMinutes(delta: number) {
    if (running || activeTask) return;
    setManualFocusMin((m) => {
      const next = Math.min(MAX_FOCUS_MIN, Math.max(MIN_FOCUS_MIN, m + delta));
      return next;
    });
  }

  const total = durationFor(mode);
  const progress = 1 - remaining / total;

  // Support hour+minute display once a session is an hour or longer.
  const showHours = total >= 3600;
  const hh = Math.floor(remaining / 3600)
    .toString()
    .padStart(2, "0");
  const min = Math.floor((remaining % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const sec = (remaining % 60).toString().padStart(2, "0");

  const focusElapsedThisBlock = mode === "focus" ? focusDurationSec - remaining : 0;
  const partialSec = focusElapsedThisBlock - loggedMinutesRef.current * 60;

  // SVG ring
  const r = 92;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-paper)]",
      )}
    >
      <div
        className="absolute inset-0 -z-0 opacity-60"
        style={{ background: "var(--gradient-warm)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Focus</p>
            <h3 className="font-display text-xl font-semibold">
              {activeTask ? activeTask.title : "Pick a task"}
            </h3>
            {activeTask && <p className="text-xs text-muted-foreground">{activeTask.subject}</p>}
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

        {mode === "focus" && !activeTask && !running && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-xs text-ink-soft">Session length</span>
            <div className="flex items-center gap-1 rounded-full border border-border bg-background/70 p-1">
              <button
                onClick={() => adjustManualMinutes(-5)}
                className="flex size-6 items-center justify-center rounded-full text-ink-soft hover:bg-accent hover:text-primary"
                aria-label="Decrease focus length"
              >
                <Minus className="size-3" />
              </button>
              <span className="min-w-14 text-center text-xs font-medium tabular-nums">
                {manualFocusMin >= 60
                  ? `${Math.floor(manualFocusMin / 60)}h ${manualFocusMin % 60 ? (manualFocusMin % 60) + "m" : ""}`
                  : `${manualFocusMin}m`}
              </span>
              <button
                onClick={() => adjustManualMinutes(5)}
                className="flex size-6 items-center justify-center rounded-full text-ink-soft hover:bg-accent hover:text-primary"
                aria-label="Increase focus length"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>
        )}
        {mode === "focus" && activeTask && (
          <p className="mt-3 text-center text-xs text-ink-soft">
            Using this task's planned time ·{" "}
            {Math.floor(focusDurationMin / 60) > 0
              ? `${Math.floor(focusDurationMin / 60)}h ${focusDurationMin % 60}m`
              : `${focusDurationMin}m`}
          </p>
        )}

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
              <span
                className={cn(
                  "font-display font-semibold tabular-nums tracking-tight",
                  showHours ? "text-5xl" : "text-6xl",
                )}
              >
                {showHours ? `${hh}:${min}:${sec}` : `${min}:${sec}`}
              </span>
              <span className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-soft">
                {mode === "focus" ? "Deep work" : "Recharge"}
              </span>
            </div>
          </div>
        </div>

        {mode === "focus" && (
          <p className="mb-3 text-center text-xs text-ink-soft">
            Logging live · {loggedMinutesRef.current}m logged · {partialSec}s toward the next minute
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          <Button size="lg" onClick={toggleRun} className="min-w-32">
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
