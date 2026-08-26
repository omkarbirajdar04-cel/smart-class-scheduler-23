import { Plus, Trash2, RotateCcw } from "lucide-react";
import type { Dataset } from "@/lib/ga";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Props = {
  data: Dataset;
  onChange: (d: Dataset) => void;
  onReset: () => void;
};

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel rounded-lg p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {action}
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

const rowCls =
  "grid items-center gap-2 rounded-md border border-border/60 bg-surface-2/50 p-2 text-sm";

export function SetupPanel({ data, onChange, onReset }: Props) {
  const set = (patch: Partial<Dataset>) => onChange({ ...data, ...patch });
  const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section
        title="Teachers"
        hint="Faculty and their daily teaching cap"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              set({
                teachers: [
                  ...data.teachers,
                  { id: uid("t"), name: "New Faculty", dept: "General", maxPerDay: 4 },
                ],
              })
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        }
      >
        {data.teachers.map((t, i) => (
          <div key={t.id} className={rowCls} style={{ gridTemplateColumns: "1fr 1fr 4.5rem 2rem" }}>
            <Input
              value={t.name}
              onChange={(e) => {
                const teachers = [...data.teachers];
                teachers[i] = { ...t, name: e.target.value };
                set({ teachers });
              }}
            />
            <Input
              value={t.dept}
              onChange={(e) => {
                const teachers = [...data.teachers];
                teachers[i] = { ...t, dept: e.target.value };
                set({ teachers });
              }}
            />
            <Input
              type="number"
              min={1}
              max={8}
              className="num"
              value={t.maxPerDay}
              onChange={(e) => {
                const teachers = [...data.teachers];
                teachers[i] = { ...t, maxPerDay: Number(e.target.value) || 1 };
                set({ teachers });
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${t.name}`}
              onClick={() => set({ teachers: data.teachers.filter((x) => x.id !== t.id) })}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </Section>

      <Section
        title="Classrooms"
        hint="Capacity and room type (lab subjects need a Lab)"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              set({
                rooms: [
                  ...data.rooms,
                  { id: uid("r"), name: "New Room", capacity: 50, kind: "Lecture" },
                ],
              })
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        }
      >
        {data.rooms.map((r, i) => (
          <div key={r.id} className={rowCls} style={{ gridTemplateColumns: "1fr 4.5rem 1fr 2rem" }}>
            <Input
              value={r.name}
              onChange={(e) => {
                const rooms = [...data.rooms];
                rooms[i] = { ...r, name: e.target.value };
                set({ rooms });
              }}
            />
            <Input
              type="number"
              className="num"
              value={r.capacity}
              onChange={(e) => {
                const rooms = [...data.rooms];
                rooms[i] = { ...r, capacity: Number(e.target.value) || 0 };
                set({ rooms });
              }}
            />
            <Select
              value={r.kind}
              onValueChange={(v) => {
                const rooms = [...data.rooms];
                rooms[i] = { ...r, kind: v as "Lecture" | "Lab" };
                set({ rooms });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lecture">Lecture</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${r.name}`}
              onClick={() => set({ rooms: data.rooms.filter((x) => x.id !== r.id) })}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </Section>

      <Section
        title="Subjects"
        hint="Weekly sessions, assigned teacher, lab requirement"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              set({
                subjects: [
                  ...data.subjects,
                  {
                    id: uid("s"),
                    name: "New Subject",
                    code: "XX000",
                    teacherId: data.teachers[0]?.id ?? "",
                    perWeek: 3,
                    needsLab: false,
                  },
                ],
              })
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        }
      >
        {data.subjects.map((s, i) => (
          <div
            key={s.id}
            className={rowCls}
            style={{ gridTemplateColumns: "1.4fr 5rem 1.2fr 3.5rem 3rem 2rem" }}
          >
            <Input
              value={s.name}
              onChange={(e) => {
                const subjects = [...data.subjects];
                subjects[i] = { ...s, name: e.target.value };
                set({ subjects });
              }}
            />
            <Input
              className="num"
              value={s.code}
              onChange={(e) => {
                const subjects = [...data.subjects];
                subjects[i] = { ...s, code: e.target.value };
                set({ subjects });
              }}
            />
            <Select
              value={s.teacherId}
              onValueChange={(v) => {
                const subjects = [...data.subjects];
                subjects[i] = { ...s, teacherId: v };
                set({ subjects });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={8}
              className="num"
              value={s.perWeek}
              onChange={(e) => {
                const subjects = [...data.subjects];
                subjects[i] = { ...s, perWeek: Number(e.target.value) || 1 };
                set({ subjects });
              }}
            />
            <div className="flex items-center justify-center" title="Requires lab room">
              <Switch
                checked={s.needsLab}
                onCheckedChange={(v) => {
                  const subjects = [...data.subjects];
                  subjects[i] = { ...s, needsLab: v };
                  set({ subjects });
                }}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${s.name}`}
              onClick={() => set({ subjects: data.subjects.filter((x) => x.id !== s.id) })}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </Section>

      <div className="space-y-4">
        <Section
          title="Classes"
          hint="Student batches, strength and enrolled subjects"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                set({
                  classes: [
                    ...data.classes,
                    {
                      id: uid("c"),
                      name: "NEW-1A",
                      size: 40,
                      subjectIds: data.subjects.slice(0, 3).map((s) => s.id),
                    },
                  ],
                })
              }
            >
              <Plus className="size-4" /> Add
            </Button>
          }
        >
          {data.classes.map((c, i) => (
            <div key={c.id} className="rounded-md border border-border/60 bg-surface-2/50 p-2">
              <div
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: "1fr 4.5rem 2rem" }}
              >
                <Input
                  value={c.name}
                  onChange={(e) => {
                    const classes = [...data.classes];
                    classes[i] = { ...c, name: e.target.value };
                    set({ classes });
                  }}
                />
                <Input
                  type="number"
                  className="num"
                  value={c.size}
                  onChange={(e) => {
                    const classes = [...data.classes];
                    classes[i] = { ...c, size: Number(e.target.value) || 0 };
                    set({ classes });
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => set({ classes: data.classes.filter((x) => x.id !== c.id) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.subjects.map((s) => {
                  const on = c.subjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        const classes = [...data.classes];
                        classes[i] = {
                          ...c,
                          subjectIds: on
                            ? c.subjectIds.filter((x) => x !== s.id)
                            : [...c.subjectIds, s.id],
                        };
                        set({ classes });
                      }}
                      className={`num rounded border px-2 py-0.5 text-xs transition-colors ${
                        on
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {s.code}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Section>

        <Section
          title="Time grid & GA parameters"
          hint="Working days, periods per day and evolution settings"
          action={
            <Button size="sm" variant="ghost" onClick={onReset}>
              <RotateCcw className="size-4" /> Reset sample
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Working days</Label>
              <Input
                value={data.config.days.join(", ")}
                onChange={(e) =>
                  set({
                    config: {
                      ...data.config,
                      days: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Periods per day</Label>
              <Input
                value={data.config.periods.join(", ")}
                onChange={(e) =>
                  set({
                    config: {
                      ...data.config,
                      periods: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </div>
          </div>

          {(
            [
              ["Population size", "populationSize", 20, 200, 10],
              ["Generations", "generations", 20, 400, 10],
              ["Elitism (kept per gen)", "elitism", 1, 12, 1],
            ] as const
          ).map(([label, key, min, max, step]) => (
            <div key={key} className="pt-1">
              <div className="flex justify-between text-xs">
                <Label className="text-muted-foreground">{label}</Label>
                <span className="num text-primary">{data.config[key]}</span>
              </div>
              <Slider
                className="mt-2"
                min={min}
                max={max}
                step={step}
                value={[data.config[key]]}
                onValueChange={([v]) => set({ config: { ...data.config, [key]: v ?? min } })}
              />
            </div>
          ))}
          <div className="pt-1">
            <div className="flex justify-between text-xs">
              <Label className="text-muted-foreground">Mutation rate</Label>
              <span className="num text-primary">
                {(data.config.mutationRate * 100).toFixed(1)}%
              </span>
            </div>
            <Slider
              className="mt-2"
              min={0.005}
              max={0.3}
              step={0.005}
              value={[data.config.mutationRate]}
              onValueChange={([v]) =>
                set({ config: { ...data.config, mutationRate: v ?? 0.05 } })
              }
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
