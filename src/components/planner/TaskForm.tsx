import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority } from "@/lib/planner-store";
import { formatMinutes } from "@/lib/utils";

interface Props {
  onAdd: (data: {
    title: string;
    subject: string;
    priority: Priority;
    dueDate: string;
    estimatedMin: number;
  }) => void;
}

export function TaskForm({ onAdd }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(today);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(45);

  const estimatedMin = hours * 60 + minutes;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (estimatedMin <= 0) return;
    onAdd({
      title: title.trim(),
      subject: subject.trim() || "General",
      priority,
      dueDate,
      estimatedMin,
    });
    setTitle("");
    setSubject("");
    setPriority("medium");
    setDueDate(today);
    setHours(0);
    setMinutes(45);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-card p-5 shadow-[var(--shadow-paper)] border border-border/60"
    >
      <h3 className="font-display text-xl font-semibold mb-4">Add a task</h3>
      <div className="grid gap-3">
        <Input
          placeholder="What do you need to study?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 bg-background/60"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Subject (e.g. Calculus)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background/60"
          />
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger className="bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low priority</SelectItem>
              <SelectItem value="medium">Medium priority</SelectItem>
              <SelectItem value="high">High priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-background/60"
        />
        <div>
          <label className="mb-1.5 block text-xs text-ink-soft">
            How long do you want to study?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type="number"
                min={0}
                step={1}
                value={hours}
                onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
                className="bg-background/60 pr-10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                hr
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={59}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                className="bg-background/60 pr-10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                min
              </span>
            </div>
          </div>
          {estimatedMin > 0 && (
            <p className="mt-1 text-xs text-ink-soft">
              Focus timer will run for {formatMinutes(estimatedMin)} on this task.
            </p>
          )}
        </div>
        <Button type="submit" className="h-11 mt-1">
          <Plus className="size-4" /> Add to plan
        </Button>
      </div>
    </form>
  );
}
