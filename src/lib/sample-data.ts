import type { Dataset } from "./ga";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const PERIODS = [
  "09:00–09:55",
  "10:00–10:55",
  "11:10–12:05",
  "12:10–13:05",
  "14:00–14:55",
  "15:00–15:55",
];

export const sampleDataset: Dataset = {
  teachers: [
    { id: "t1", name: "Dr. A. Menon", dept: "Computer Science", maxPerDay: 4 },
    { id: "t2", name: "Prof. K. Iyer", dept: "Mathematics", maxPerDay: 4 },
    { id: "t3", name: "Dr. S. Bose", dept: "Computer Science", maxPerDay: 3 },
    { id: "t4", name: "Ms. R. Kaur", dept: "Electronics", maxPerDay: 4 },
    { id: "t5", name: "Mr. D. Fernandes", dept: "Humanities", maxPerDay: 3 },
  ],
  rooms: [
    { id: "r1", name: "LH-101", capacity: 70, kind: "Lecture" },
    { id: "r2", name: "LH-102", capacity: 60, kind: "Lecture" },
    { id: "r3", name: "LH-204", capacity: 45, kind: "Lecture" },
    { id: "r4", name: "Lab-A", capacity: 40, kind: "Lab" },
    { id: "r5", name: "Lab-B", capacity: 36, kind: "Lab" },
  ],
  subjects: [
    { id: "s1", name: "Data Structures", code: "CS201", teacherId: "t1", perWeek: 4, needsLab: false },
    { id: "s2", name: "DS Laboratory", code: "CS201L", teacherId: "t1", perWeek: 2, needsLab: true },
    { id: "s3", name: "Discrete Mathematics", code: "MA203", teacherId: "t2", perWeek: 3, needsLab: false },
    { id: "s4", name: "Operating Systems", code: "CS305", teacherId: "t3", perWeek: 3, needsLab: false },
    { id: "s5", name: "OS Laboratory", code: "CS305L", teacherId: "t3", perWeek: 2, needsLab: true },
    { id: "s6", name: "Digital Electronics", code: "EC202", teacherId: "t4", perWeek: 3, needsLab: false },
    { id: "s7", name: "Technical Communication", code: "HS101", teacherId: "t5", perWeek: 2, needsLab: false },
  ],
  classes: [
    { id: "c1", name: "CSE-2A", size: 58, subjectIds: ["s1", "s2", "s3", "s7"] },
    { id: "c2", name: "CSE-3B", size: 42, subjectIds: ["s4", "s5", "s3", "s6"] },
    { id: "c3", name: "ECE-2A", size: 38, subjectIds: ["s6", "s3", "s7", "s1"] },
  ],
  config: {
    days: DAYS,
    periods: PERIODS,
    populationSize: 60,
    generations: 120,
    mutationRate: 0.06,
    elitism: 4,
  },
};

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
