import { useEffect, useRef, useState } from "react";
import { Play, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onLog: (minutes: number) => void;
}

export function StudyTimer({ onLog }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startTsRef.current = Date.now() - elapsedSec * 1000;
    intervalRef.current = window.setInterval(() => {
      if (startTsRef.current) {
        setElapsedSec(Math.floor((Date.now() - startTsRef.current) / 1000));
      }
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function start() {
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    const minutes = Math.round(elapsedSec / 60);
    if (minutes > 0) {
      onLog(minutes);
    }
    setElapsedSec(0);
  }

  const h = Math.floor(elapsedSec / 3600).toString().padStart(2, "0");
  const m = Math.floor((elapsedSec % 3600) / 60).toString().padStart(2, "0");
  const s = (elapsedSec % 60).toString().padStart(2, "0");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-paper)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Study session</p>
          <h3 className="font-display text-xl font-semibold">
            {running ? "In progress" : "Not started"}
          </h3>
        </div>
        <Timer className={cn("size-5", running ? "text-sage" : "text-ink-soft")} />
      </div>

      <div className="my-6 flex justify-center">
        <span
          className={cn(
            "font-display text-5xl font-semibold tabular-nums tracking-tight",
            running && "text-sage",
          )}
        >
          {h}:{m}:{s}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        {!running ? (
          <Button size="lg" onClick={start} className="min-w-40">
            <Play className="size-4" />
            Start studying
          </Button>
        ) : (
          <Button size="lg" variant="destructive" onClick={stop} className="min-w-40">
            <Square className="size-4" />
            Stop &amp; log time
          </Button>
        )}
      </div>

      {!running && elapsedSec === 0 && (
        <p className="mt-3 text-center text-xs text-ink-soft">
          Tracks toward your Today &amp; All time totals above.
        </p>
      )}
    </div>
  );
}
