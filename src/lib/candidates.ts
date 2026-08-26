import {
  decode,
  utilization,
  type Assignment,
  type Conflicts,
  type Dataset,
  type Individual,
  type Lesson,
} from "./ga";

export type Candidate = {
  id: string;
  rank: number;
  individual: Individual;
  rows: Assignment[];
  conflicts: Conflicts;
  fitnessPct: number;
  softScore: number;
  avgRoomUtil: number;
  avgTeacherUtil: number;
  util: ReturnType<typeof utilization>;
};

const sig = (ind: Individual) => ind.genes.map((g) => `${g.slot}.${g.room}`).join("|");

export function topCandidates(
  d: Dataset,
  lessons: Lesson[],
  population: Individual[],
  n = 5,
): Candidate[] {
  const seen = new Set<string>();
  const unique: Individual[] = [];
  for (const ind of [...population].sort((a, b) => b.fitness - a.fitness)) {
    const s = sig(ind);
    if (seen.has(s)) continue;
    seen.add(s);
    unique.push(ind);
    if (unique.length >= n) break;
  }

  const bestFitness = unique[0]?.fitness ?? 1;

  return unique.map((individual, i) => {
    const rows = decode(d, lessons, individual);
    const util = utilization(d, rows);
    const c = individual.conflicts;
    const avg = (xs: number[]) =>
      xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
    return {
      id: `cand-${i}-${sig(individual).length}-${individual.fitness.toFixed(8)}`,
      rank: i + 1,
      individual,
      rows,
      conflicts: c,
      fitnessPct: (individual.fitness / bestFitness) * 100,
      softScore: c.labMismatch + c.capacity + c.teacherOverload + c.gaps,
      avgRoomUtil: avg(util.rooms.map((r) => r.pct)),
      avgTeacherUtil: avg(util.teachers.map((t) => t.pct)),
      util,
    };
  });
}
