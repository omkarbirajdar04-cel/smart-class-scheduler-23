import { Crown, Check } from "lucide-react";
import type { Candidate } from "@/lib/candidates";

export function CandidateCompare({
  candidates,
  selected,
  onSelect,
}: {
  candidates: Candidate[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="panel rounded-lg p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Top 5 candidates</h3>
        <p className="text-xs text-muted-foreground">
          Best individuals from the final population — pick one to inspect its grid.
        </p>
      </div>

      {/* Card view (small screens) */}
      <div className="grid gap-2 md:hidden">
        {candidates.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onSelect(i)}
            className={`rounded-md border p-3 text-left transition-colors ${
              selected === i ? "border-primary bg-primary/10" : "border-border bg-surface-2/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold">
                #{c.rank} {c.rank === 1 && <Crown className="inline size-3.5 text-accent" />}
              </span>
              <span className="num text-sm text-primary">{c.fitnessPct.toFixed(1)}%</span>
            </div>
            <div className="num mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>Conflicts: {c.conflicts.total}</span>
              <span>Soft: {c.softScore}</span>
              <span>Teacher: {c.conflicts.teacher}</span>
              <span>Room: {c.conflicts.room}</span>
              <span>Class: {c.conflicts.classClash}</span>
              <span>Util: {c.avgRoomUtil}% / {c.avgTeacherUtil}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Table view */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-wide text-muted-foreground uppercase">
              <th className="p-2">Rank</th>
              <th className="p-2">Fitness</th>
              <th className="p-2">Hard conflicts</th>
              <th className="p-2">Teacher</th>
              <th className="p-2">Room</th>
              <th className="p-2">Class</th>
              <th className="p-2">Soft penalty</th>
              <th className="p-2">Room util</th>
              <th className="p-2">Teacher util</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => onSelect(i)}
                className={`cursor-pointer border-t border-border transition-colors ${
                  selected === i ? "bg-primary/10" : "hover:bg-surface-2/60"
                }`}
              >
                <td className="p-2">
                  <span className="flex items-center gap-1.5 font-display font-semibold">
                    #{c.rank}
                    {c.rank === 1 && (
                      <span className="inline-flex items-center gap-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        <Crown className="size-3" /> Recommended
                      </span>
                    )}
                  </span>
                </td>
                <td className="num p-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, c.fitnessPct)}%` }}
                      />
                    </div>
                    <span className="text-primary">{c.fitnessPct.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="num p-2">
                  <span
                    className={
                      c.conflicts.total === 0 ? "text-success" : "font-semibold text-destructive"
                    }
                  >
                    {c.conflicts.total}
                  </span>
                </td>
                <td className="num p-2">{c.conflicts.teacher}</td>
                <td className="num p-2">{c.conflicts.room}</td>
                <td className="num p-2">{c.conflicts.classClash}</td>
                <td className="num p-2 text-muted-foreground">{c.softScore}</td>
                <td className="num p-2">{c.avgRoomUtil}%</td>
                <td className="num p-2">{c.avgTeacherUtil}%</td>
                <td className="p-2 text-right">
                  {selected === i ? (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <Check className="size-3.5" /> Viewing
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Inspect</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
