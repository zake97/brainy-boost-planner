import { useEffect, useState, useCallback } from "react";

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  dueDate: string; // ISO date YYYY-MM-DD
  estimatedMin: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  studiedMin: number;
}

export interface Session {
  id: string;
  taskId: string | null;
  minutes: number;
  date: string; // YYYY-MM-DD
  ts: number;
}

interface PlannerState {
  tasks: Task[];
  sessions: Session[];
}

const KEY = "planner-state-v1";

const seed: PlannerState = {
  tasks: [],
  sessions: [],
};

function load(): PlannerState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as PlannerState;
  } catch {
    return seed;
  }
}

function save(state: PlannerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

const listeners = new Set<() => void>();
let state: PlannerState = seed;
let hydrated = false;

function setState(updater: (s: PlannerState) => PlannerState) {
  state = updater(state);
  save(state);
  listeners.forEach((l) => l());
}

export function usePlanner() {
  const [, force] = useState(0);

  useEffect(() => {
    if (!hydrated) {
      state = load();
      hydrated = true;
    }
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    cb();
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const addTask = useCallback((t: Omit<Task, "id" | "createdAt" | "completed" | "studiedMin">) => {
    setState((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          ...t,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          completed: false,
          studiedMin: 0,
        },
      ],
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t,
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const logSession = useCallback((taskId: string | null, minutes: number) => {
    const date = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      sessions: [
        ...s.sessions,
        { id: crypto.randomUUID(), taskId, minutes, date, ts: Date.now() },
      ],
      tasks: taskId
        ? s.tasks.map((t) => (t.id === taskId ? { ...t, studiedMin: t.studiedMin + minutes } : t))
        : s.tasks,
    }));
  }, []);

  return {
    tasks: state.tasks,
    sessions: state.sessions,
    addTask,
    toggleTask,
    deleteTask,
    logSession,
  };
}

export function priorityScore(t: Task): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(t.dueDate);
  const daysLeft = Math.max(0, (due.getTime() - today.getTime()) / 86400000);
  const pri = t.priority === "high" ? 3 : t.priority === "medium" ? 2 : 1;
  return pri * 10 - daysLeft;
}

export function computeStats(tasks: Task[], sessions: Session[]) {
  const today = new Date().toISOString().slice(0, 10);
  const minutesToday = sessions.filter((s) => s.date === today).reduce((a, s) => a + s.minutes, 0);
  const totalMinutes = sessions.reduce((a, s) => a + s.minutes, 0);
  const completed = tasks.filter((t) => t.completed).length;
  const rate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  // streak: consecutive days (ending today or yesterday) with a session
  const days = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // allow streak to start yesterday if today empty
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { minutesToday, totalMinutes, completionRate: rate, streak };
}
