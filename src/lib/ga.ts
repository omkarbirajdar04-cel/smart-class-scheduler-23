// Genetic-algorithm timetable engine (pure, deterministic-ish, browser-safe)

export type Teacher = { id: string; name: string; dept: string; maxPerDay: number };
export type Room = { id: string; name: string; capacity: number; kind: "Lecture" | "Lab" };
export type Subject = {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  perWeek: number;
  needsLab: boolean;
};
export type ClassGroup = { id: string; name: string; size: number; subjectIds: string[] };

export type Config = {
  days: string[];
  periods: string[];
  populationSize: number;
  generations: number;
  mutationRate: number;
  elitism: number;
};

export type Dataset = {
  teachers: Teacher[];
  rooms: Room[];
  subjects: Subject[];
  classes: ClassGroup[];
  config: Config;
};

/** One scheduled lesson requirement */
export type Lesson = {
  key: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  index: number;
};

/** gene = slot index + room index */
export type Gene = { slot: number; room: number };
export type Chromosome = Gene[];

export type Conflicts = {
  teacher: number;
  room: number;
  classClash: number;
  labMismatch: number;
  capacity: number;
  teacherOverload: number;
  gaps: number;
  total: number;
};

export type Individual = {
  genes: Chromosome;
  fitness: number;
  conflicts: Conflicts;
};

export type GenerationStat = {
  gen: number;
  best: number;
  avg: number;
  worst: number;
  hardConflicts: number;
};

export const HARD_WEIGHTS = {
  teacher: 12,
  room: 12,
  classClash: 12,
  labMismatch: 6,
  capacity: 4,
  teacherOverload: 3,
  gaps: 1,
};

let seed = 987654321;
export function reseed(s = 987654321) {
  seed = s;
}
function rnd() {
  // mulberry32
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (n: number) => Math.floor(rnd() * n);

export function buildLessons(d: Dataset): Lesson[] {
  const out: Lesson[] = [];
  for (const c of d.classes) {
    for (const sid of c.subjectIds) {
      const s = d.subjects.find((x) => x.id === sid);
      if (!s) continue;
      for (let i = 0; i < s.perWeek; i++) {
        out.push({
          key: `${c.id}:${s.id}:${i}`,
          classId: c.id,
          subjectId: s.id,
          teacherId: s.teacherId,
          index: i,
        });
      }
    }
  }
  return out;
}

export function slotCount(d: Dataset) {
  return d.config.days.length * d.config.periods.length;
}

export function evaluate(d: Dataset, lessons: Lesson[], genes: Chromosome): Individual {
  const conflicts: Conflicts = {
    teacher: 0,
    room: 0,
    classClash: 0,
    labMismatch: 0,
    capacity: 0,
    teacherOverload: 0,
    gaps: 0,
    total: 0,
  };
  const teacherSlot = new Map<string, number>();
  const roomSlot = new Map<string, number>();
  const classSlot = new Map<string, number>();
  const teacherDay = new Map<string, number>();
  const classDaySlots = new Map<string, number[]>();
  const P = d.config.periods.length;

  lessons.forEach((l, i) => {
    const g = genes[i]!;
    const room = d.rooms[g.room % d.rooms.length]!;
    const subj = d.subjects.find((s) => s.id === l.subjectId)!;
    const group = d.classes.find((c) => c.id === l.classId)!;
    const day = Math.floor(g.slot / P);

    const tk = `${l.teacherId}#${g.slot}`;
    const rk = `${room.id}#${g.slot}`;
    const ck = `${l.classId}#${g.slot}`;
    const tdk = `${l.teacherId}#${day}`;

    if ((teacherSlot.get(tk) ?? 0) > 0) conflicts.teacher++;
    teacherSlot.set(tk, (teacherSlot.get(tk) ?? 0) + 1);
    if ((roomSlot.get(rk) ?? 0) > 0) conflicts.room++;
    roomSlot.set(rk, (roomSlot.get(rk) ?? 0) + 1);
    if ((classSlot.get(ck) ?? 0) > 0) conflicts.classClash++;
    classSlot.set(ck, (classSlot.get(ck) ?? 0) + 1);
    teacherDay.set(tdk, (teacherDay.get(tdk) ?? 0) + 1);

    if (subj.needsLab && room.kind !== "Lab") conflicts.labMismatch++;
    if (group.size > room.capacity) conflicts.capacity++;

    const cdk = `${l.classId}#${day}`;
    const arr = classDaySlots.get(cdk) ?? [];
    arr.push(g.slot % P);
    classDaySlots.set(cdk, arr);
  });

  for (const [k, n] of teacherDay) {
    const tid = k.split("#")[0]!;
    const t = d.teachers.find((x) => x.id === tid);
    if (t && n > t.maxPerDay) conflicts.teacherOverload += n - t.maxPerDay;
  }
  for (const arr of classDaySlots.values()) {
    const sorted = [...arr].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i]! - sorted[i - 1]! - 1;
      if (gap > 0) conflicts.gaps += gap;
    }
  }

  const penalty =
    conflicts.teacher * HARD_WEIGHTS.teacher +
    conflicts.room * HARD_WEIGHTS.room +
    conflicts.classClash * HARD_WEIGHTS.classClash +
    conflicts.labMismatch * HARD_WEIGHTS.labMismatch +
    conflicts.capacity * HARD_WEIGHTS.capacity +
    conflicts.teacherOverload * HARD_WEIGHTS.teacherOverload +
    conflicts.gaps * HARD_WEIGHTS.gaps;

  conflicts.total = conflicts.teacher + conflicts.room + conflicts.classClash;

  return { genes, conflicts, fitness: 1 / (1 + penalty) };
}

function randomIndividual(d: Dataset, lessons: Lesson[]): Individual {
  const S = slotCount(d);
  const genes = lessons.map(() => ({ slot: ri(S), room: ri(d.rooms.length) }));
  return evaluate(d, lessons, genes);
}

export function initialPopulation(d: Dataset, lessons: Lesson[]): Individual[] {
  return Array.from({ length: d.config.populationSize }, () => randomIndividual(d, lessons));
}

function tournament(pop: Individual[], k = 3): Individual {
  let best = pop[ri(pop.length)]!;
  for (let i = 1; i < k; i++) {
    const c = pop[ri(pop.length)]!;
    if (c.fitness > best.fitness) best = c;
  }
  return best;
}

function crossover(a: Individual, b: Individual): Chromosome {
  const n = a.genes.length;
  const p1 = ri(n);
  const p2 = p1 + ri(Math.max(1, n - p1));
  return a.genes.map((g, i) => (i >= p1 && i <= p2 ? { ...b.genes[i]! } : { ...g }));
}

function mutate(d: Dataset, genes: Chromosome, rate: number) {
  const S = slotCount(d);
  for (const g of genes) {
    if (rnd() < rate) g.slot = ri(S);
    if (rnd() < rate) g.room = ri(d.rooms.length);
  }
  return genes;
}

export type StepResult = {
  population: Individual[];
  best: Individual;
  stat: GenerationStat;
  sample: {
    parentA: number;
    parentB: number;
    crossoverPoint: number;
    mutations: number;
  };
};

export function stepGeneration(
  d: Dataset,
  lessons: Lesson[],
  population: Individual[],
  gen: number,
): StepResult {
  const sorted = [...population].sort((x, y) => y.fitness - x.fitness);
  const next: Individual[] = sorted.slice(0, Math.max(1, d.config.elitism));
  let mutations = 0;
  let cxPoint = 0;

  while (next.length < d.config.populationSize) {
    const a = tournament(sorted);
    const b = tournament(sorted);
    const child = crossover(a, b);
    cxPoint = Math.floor(child.length / 2);
    const before = child.map((g) => `${g.slot}-${g.room}`).join();
    mutate(d, child, d.config.mutationRate);
    if (child.map((g) => `${g.slot}-${g.room}`).join() !== before) mutations++;
    next.push(evaluate(d, lessons, child));
  }

  const evaluated = next.sort((x, y) => y.fitness - x.fitness);
  const best = evaluated[0]!;
  const avg = evaluated.reduce((s, i) => s + i.fitness, 0) / evaluated.length;

  return {
    population: evaluated,
    best,
    stat: {
      gen,
      best: best.fitness,
      avg,
      worst: evaluated[evaluated.length - 1]!.fitness,
      hardConflicts: best.conflicts.total,
    },
    sample: {
      parentA: 0,
      parentB: 1,
      crossoverPoint: cxPoint,
      mutations,
    },
  };
}

export type Assignment = {
  lesson: Lesson;
  slot: number;
  day: number;
  period: number;
  roomId: string;
  conflicted: boolean;
};

export function decode(d: Dataset, lessons: Lesson[], ind: Individual): Assignment[] {
  const P = d.config.periods.length;
  const rows: Assignment[] = lessons.map((l, i) => {
    const g = ind.genes[i]!;
    return {
      lesson: l,
      slot: g.slot,
      day: Math.floor(g.slot / P),
      period: g.slot % P,
      roomId: d.rooms[g.room % d.rooms.length]!.id,
      conflicted: false,
    };
  });

  const bump = (map: Map<string, Assignment[]>, k: string, a: Assignment) => {
    const arr = map.get(k) ?? [];
    arr.push(a);
    map.set(k, arr);
  };
  const t = new Map<string, Assignment[]>();
  const r = new Map<string, Assignment[]>();
  const c = new Map<string, Assignment[]>();
  for (const a of rows) {
    bump(t, `${a.lesson.teacherId}#${a.slot}`, a);
    bump(r, `${a.roomId}#${a.slot}`, a);
    bump(c, `${a.lesson.classId}#${a.slot}`, a);
  }
  for (const m of [t, r, c]) {
    for (const arr of m.values()) {
      if (arr.length > 1) arr.forEach((a) => (a.conflicted = true));
    }
  }
  return rows;
}

export function utilization(d: Dataset, rows: Assignment[]) {
  const S = slotCount(d);
  const rooms = d.rooms.map((room) => {
    const used = new Set(rows.filter((a) => a.roomId === room.id).map((a) => a.slot)).size;
    return { id: room.id, name: room.name, used, total: S, pct: Math.round((used / S) * 100) };
  });
  const teachers = d.teachers.map((t) => {
    const used = rows.filter((a) => a.lesson.teacherId === t.id).length;
    return { id: t.id, name: t.name, used, total: S, pct: Math.round((used / S) * 100) };
  });
  return { rooms, teachers };
}
