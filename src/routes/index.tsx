import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Dna, Play, RefreshCcw, Sliders, Table2, TrendingUp, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetupPanel } from "@/components/tt/SetupPanel";
import { Pipeline, STAGES, type StageKey } from "@/components/tt/Pipeline";
import { TimetableGrid, UtilBars } from "@/components/tt/TimetableGrid";
import { CandidateCompare } from "@/components/tt/Candidates";
import { topCandidates, type Candidate } from "@/lib/candidates";
import { clone, sampleDataset } from "@/lib/sample-data";
import {
  buildLessons,
  initialPopulation,
  reseed,
  stepGeneration,
  type Dataset,
  type GenerationStat,
  type Individual,
} from "@/lib/ga";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart College Timetable Generator — Genetic Algorithm Demo" },
      {
        name: "description",
        content:
          "Interactive prototype that builds conflict-free college timetables with a genetic algorithm: live population, fitness, crossover and mutation, plus top-5 candidate comparison.",
      },
      { property: "og:title", content: "Smart College Timetable Generator" },
      {
        property: "og:description",
        content:
          "Watch a genetic algorithm evolve college timetables in real time, then compare the top 5 schedules by conflicts and utilization.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Stat({
  label,
  value,
  tone = "default",
  sub,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "bad";
  sub?: string;
}) {
  const color =
    tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-primary";
  return (
    <div className="panel rounded-lg p-3">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={`num mt-1 text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Index() {
  const [data, setData] = useState<Dataset>(() => clone(sampleDataset));
  const [tab, setTab] = useState("setup");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey | null>(null);
  const [history, setHistory] = useState<GenerationStat[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState(0);
  const [viewClass, setViewClass] = useState<string>(sampleDataset.classes[0]!.id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lessons = useMemo(() => buildLessons(data), [data]);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const run = useCallback(() => {
    if (lessons.length === 0 || data.rooms.length === 0) return;
    if (timer.current) clearTimeout(timer.current);

    setRunning(true);
    setTab("evolve");
    setHistory([]);
    setCandidates([]);
    reseed(Date.now() % 100000);

    let population: Individual[] = initialPopulation(data, lessons);
    setStage("population");
    let gen = 0;
    const total = data.config.generations;
    const stats: GenerationStat[] = [];

    const tick = () => {
      const chunk = total > 150 ? 3 : 2;
      for (let i = 0; i < chunk && gen < total; i++) {
        gen++;
        const res = stepGeneration(data, lessons, population, gen);
        population = res.population;
        stats.push(res.stat);
      }
      setHistory([...stats]);
      const cycle = STAGES[((gen % 5) + 1) % STAGES.length]!.key;
      setStage(gen >= total ? "generation" : cycle);

      if (gen < total) {
        timer.current = setTimeout(tick, 24);
      } else {
        const cands = topCandidates(data, lessons, population, 5);
        setCandidates(cands);
        setSelected(0);
        setRunning(false);
        setStage("generation");
        setViewClass((c) => (data.classes.some((x) => x.id === c) ? c : (data.classes[0]?.id ?? "")));
        timer.current = setTimeout(() => setTab("results"), 500);
      }
    };
    timer.current = setTimeout(tick, 350);
  }, [data, lessons]);

  const current = candidates[selected];
  const last = history[history.length - 1];
  const chartData = history.map((h) => ({
    gen: h.gen,
    best: Number((h.best * 1000).toFixed(3)),
    avg: Number((h.avg * 1000).toFixed(3)),
    conflicts: h.hardConflicts,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="num flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
              <Dna className="size-4" /> Genetic algorithm · scheduling prototype
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight font-bold sm:text-5xl">
              Smart College Timetable Generator
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Define your subjects, faculty, rooms and periods, then watch a genetic algorithm
              evolve thousands of candidate timetables — scoring each on teacher, room and class
              clashes until a conflict-free week emerges.
            </p>
          </div>
          <Button size="lg" onClick={run} disabled={running} className="font-display">
            {running ? (
              <>
                <RefreshCcw className="size-4 animate-spin" /> Evolving…
              </>
            ) : (
              <>
                <Play className="size-4" /> Generate timetable
              </>
            )}
          </Button>
        </div>

        <dl className="num mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ["Classes", data.classes.length],
            ["Subjects", data.subjects.length],
            ["Teachers", data.teachers.length],
            ["Rooms", data.rooms.length],
            ["Slots/week", data.config.days.length * data.config.periods.length],
            ["Lessons to place", lessons.length],
          ].map(([l, v]) => (
            <div key={String(l)} className="panel rounded-md px-3 py-2">
              <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">{l}</dt>
              <dd className="text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="setup">
            <Sliders className="size-4" /> Inputs
          </TabsTrigger>
          <TabsTrigger value="evolve">
            <TrendingUp className="size-4" /> Evolution
          </TabsTrigger>
          <TabsTrigger value="results">
            <Table2 className="size-4" /> Timetable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <SetupPanel
            data={data}
            onChange={setData}
            onReset={() => setData(clone(sampleDataset))}
          />
        </TabsContent>

        <TabsContent value="evolve" className="space-y-4">
          <Pipeline active={stage} running={running} stat={last ?? undefined} />

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="panel rounded-lg p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  Fitness over generations
                </h3>
                <span className="num text-xs text-muted-foreground">
                  gen {last?.gen ?? 0}/{data.config.generations}
                </span>
              </div>
              <div className="h-64">
                {history.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="gen"
                        stroke="var(--muted-foreground)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                      <RTooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="best"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={false}
                        name="Best ×1000"
                      />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        stroke="var(--chart-2)"
                        strokeWidth={1.5}
                        dot={false}
                        name="Average ×1000"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Press “Generate timetable” to start evolving.
                  </div>
                )}
              </div>
            </div>

            <div className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Stat
                label="Best fitness"
                value={last ? (last.best * 1000).toFixed(2) : "—"}
                sub="1 / (1 + weighted penalty), ×1000"
              />
              <Stat
                label="Hard conflicts (best)"
                value={last ? last.hardConflicts : "—"}
                tone={last ? (last.hardConflicts === 0 ? "good" : "bad") : "default"}
                sub="teacher + room + class double-bookings"
              />
              <Stat
                label="Population"
                value={data.config.populationSize}
                sub={`elitism ${data.config.elitism} · mutation ${(data.config.mutationRate * 100).toFixed(1)}%`}
              />
              <Stat
                label="Search space"
                value={`${data.config.days.length * data.config.periods.length * data.rooms.length}^${lessons.length}`}
                sub="slot × room combinations per lesson"
              />
            </div>
          </div>

          {candidates.length > 0 && (
            <CandidateCompare
              candidates={candidates}
              selected={selected}
              onSelect={(i) => setSelected(i)}
            />
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {!current ? (
            <div className="panel flex flex-col items-center gap-3 rounded-lg p-12 text-center">
              <CircleAlert className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No timetable yet — run the generator to produce candidates.
              </p>
              <Button onClick={run} disabled={running}>
                <Play className="size-4" /> Generate timetable
              </Button>
            </div>
          ) : (
            <>
              <CandidateCompare
                candidates={candidates}
                selected={selected}
                onSelect={(i) => setSelected(i)}
              />

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label={`Candidate #${current.rank} fitness`}
                  value={`${current.fitnessPct.toFixed(1)}%`}
                  sub={current.rank === 1 ? "Recommended best option" : "Relative to best"}
                />
                <Stat
                  label="Hard conflicts"
                  value={current.conflicts.total}
                  tone={current.conflicts.total === 0 ? "good" : "bad"}
                  sub={`T ${current.conflicts.teacher} · R ${current.conflicts.room} · C ${current.conflicts.classClash}`}
                />
                <Stat
                  label="Soft penalties"
                  value={current.softScore}
                  sub="lab mismatch, capacity, overload, gaps"
                />
                <Stat
                  label="Avg utilization"
                  value={`${current.avgRoomUtil}% / ${current.avgTeacherUtil}%`}
                  sub="rooms / teachers"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-wide text-muted-foreground uppercase">
                  Class view
                </span>
                {data.classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setViewClass(c.id)}
                    className={`num rounded-md border px-3 py-1 text-xs transition-colors ${
                      viewClass === c.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <TimetableGrid data={data} rows={current.rows} classId={viewClass} />

              <div className="grid gap-4 md:grid-cols-2">
                <UtilBars title="Classroom utilization" items={current.util.rooms} />
                <UtilBars title="Teacher load" items={current.util.teachers} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        Self-contained demo — the genetic algorithm runs entirely in your browser. Fitness ={" "}
        <span className="num">1 / (1 + Σ weighted penalties)</span>, where teacher, room and class
        clashes are weighted 12× and soft preferences (lab rooms, capacity, daily load, idle gaps)
        weigh 1–6×.
      </footer>
    </main>
  );
}
