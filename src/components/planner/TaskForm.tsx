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
  const [estimatedMin, setEstimatedMin] = useState(45);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
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
    setEstimatedMin(45);
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
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-background/60"
          />
          <Input
            type="number"
            min={5}
            step={5}
            value={estimatedMin}
            onChange={(e) => setEstimatedMin(Number(e.target.value))}
            className="bg-background/60"
            placeholder="Minutes"
          />
        </div>
        <Button type="submit" className="h-11 mt-1">
          <Plus className="size-4" /> Add to plan
        </Button>
      </div>
    </form>
  );
}
