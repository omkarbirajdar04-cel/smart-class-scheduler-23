import { Dna, Gauge, Filter, Shuffle, Sparkles, Layers } from "lucide-react";
import type { GenerationStat } from "@/lib/ga";

export type StageKey =
  | "population"
  | "fitness"
  | "selection"
  | "crossover"
  | "mutation"
  | "generation";

export const STAGES: {
  key: StageKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
}[] = [
  {
    key: "population",
    label: "Initial Population",
    icon: Layers,
    blurb: "Random but valid-shaped timetables seed the gene pool.",
  },
  {
    key: "fitness",
    label: "Fitness",
    icon: Gauge,
    blurb: "Each timetable is scored: hard clashes cost the most.",
  },
  {
    key: "selection",
    label: "Selection",
    icon: Filter,
    blurb: "Tournament selection favours higher-scoring parents.",
  },
  {
    key: "crossover",
    label: "Crossover",
    icon: Shuffle,
    blurb: "Two-point crossover swaps slot/room blocks between parents.",
  },
  {
    key: "mutation",
    label: "Mutation",
    icon: Sparkles,
    blurb: "Random slot or room nudges keep diversity alive.",
  },
  {
    key: "generation",
    label: "New Generation",
    icon: Dna,
    blurb: "Elites survive; the improved population loops back.",
  },
];

export function Pipeline({
  active,
  running,
  stat,
}: {
  active: StageKey | null;
  running: boolean;
  stat?: GenerationStat;
}) {
  return (
    <div className="panel rounded-lg p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase">GA pipeline</h3>
        <span className="num text-xs text-muted-foreground">
          {running ? "evolving…" : "idle"}
          {stat ? ` · gen ${stat.gen}` : ""}
        </span>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((s, i) => {
          const on = active === s.key;
          const Icon = s.icon;
          return (
            <li
              key={s.key}
              className={`relative rounded-md border p-3 transition-all duration-300 ${
                on
                  ? "-translate-y-0.5 border-primary bg-primary/12 shadow-[0_0_0_1px_var(--primary),0_8px_28px_-16px_var(--primary)]"
                  : "border-border bg-surface-2/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`num text-[10px] ${on ? "text-primary" : "text-muted-foreground"}`}
                >
                  0{i + 1}
                </span>
                <Icon className={`size-4 ${on ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <p className="mt-1.5 font-display text-sm leading-tight font-semibold">{s.label}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.blurb}</p>
              {on && (
                <span className="absolute inset-x-3 bottom-1 h-px animate-pulse bg-primary" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
