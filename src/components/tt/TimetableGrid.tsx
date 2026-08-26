import { AlertTriangle } from "lucide-react";
import type { Assignment, Dataset } from "@/lib/ga";

const TONES = [
  "border-chart-1/50 bg-chart-1/12",
  "border-chart-2/50 bg-chart-2/12",
  "border-chart-3/50 bg-chart-3/12",
  "border-chart-4/50 bg-chart-4/12",
  "border-chart-5/50 bg-chart-5/12",
];

export function TimetableGrid({
  data,
  rows,
  classId,
}: {
  data: Dataset;
  rows: Assignment[];
  classId: string;
}) {
  const P = data.config.periods.length;
  const cells = rows.filter((r) => r.lesson.classId === classId);

  return (
    <div className="panel overflow-x-auto rounded-lg">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-24 border-b border-border p-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Day
            </th>
            {data.config.periods.map((p) => (
              <th
                key={p}
                className="num border-b border-l border-border p-2 text-xs font-medium text-muted-foreground"
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.config.days.map((day, di) => (
            <tr key={day}>
              <th className="border-b border-border p-2 text-left font-display text-sm">{day}</th>
              {data.config.periods.map((_, pi) => {
                const slot = di * P + pi;
                const here = cells.filter((c) => c.slot === slot);
                return (
                  <td
                    key={pi}
                    className="border-b border-l border-border p-1 align-top"
                    style={{ minWidth: 128 }}
                  >
                    <div className="space-y-1">
                      {here.map((a) => {
                        const subj = data.subjects.find((s) => s.id === a.lesson.subjectId)!;
                        const teacher = data.teachers.find((t) => t.id === a.lesson.teacherId)!;
                        const room = data.rooms.find((r) => r.id === a.roomId)!;
                        const tone =
                          TONES[data.subjects.findIndex((s) => s.id === subj.id) % TONES.length];
                        return (
                          <div
                            key={a.lesson.key}
                            className={`rounded border p-1.5 leading-tight ${
                              a.conflicted
                                ? "border-destructive bg-destructive/20"
                                : `${tone} border`
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {a.conflicted && (
                                <AlertTriangle className="size-3 shrink-0 text-destructive" />
                              )}
                              <span className="text-xs font-semibold">{subj.code}</span>
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {subj.name}
                            </div>
                            <div className="num mt-0.5 text-[10px] text-muted-foreground">
                              {teacher.name.split(" ").slice(-1)[0]} · {room.name}
                            </div>
                          </div>
                        );
                      })}
                      {here.length === 0 && (
                        <div className="py-3 text-center text-[10px] text-muted-foreground/40">
                          free
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UtilBars({
  title,
  items,
}: {
  title: string;
  items: { id: string; name: string; used: number; total: number; pct: number }[];
}) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">{title}</h3>
      <div className="space-y-2.5">
        {items.map((i) => (
          <div key={i.id}>
            <div className="flex justify-between text-xs">
              <span>{i.name}</span>
              <span className="num text-muted-foreground">
                {i.used}/{i.total} · {i.pct}%
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  i.pct > 85 ? "bg-destructive" : i.pct > 60 ? "bg-warning" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, i.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
