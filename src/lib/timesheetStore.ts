export type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

export type TimesheetWeek = {
  week: number;
  startDate: string;
  endDate: string;
  hours: number;
};

export type TimesheetEntry = {
  id: string;
  week: number;
  date: string;
  project: string;
  workType: string;
  description: string;
  hours: number;
  updatedAt: string;
};

type TimesheetEntryInput = {
  date: string;
  project: string;
  workType: string;
  description: string;
  hours: number;
};

const weekSeed: TimesheetWeek[] = [
  { week: 1, startDate: "2024-01-01", endDate: "2024-01-05", hours: 40 },
  { week: 2, startDate: "2024-01-08", endDate: "2024-01-12", hours: 40 },
  { week: 3, startDate: "2024-01-15", endDate: "2024-01-19", hours: 28 },
  { week: 4, startDate: "2024-01-22", endDate: "2024-01-26", hours: 40 },
  { week: 5, startDate: "2024-01-29", endDate: "2024-02-02", hours: 0 },
  { week: 6, startDate: "2024-02-05", endDate: "2024-02-09", hours: 18 },
  { week: 7, startDate: "2024-02-12", endDate: "2024-02-16", hours: 40 },
  { week: 8, startDate: "2024-02-19", endDate: "2024-02-23", hours: 12 }
];

const entrySeed: TimesheetEntry[] = [
  { id: "entry-1", week: 3, date: "2024-01-15", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-15T09:00:00Z" },
  { id: "entry-2", week: 3, date: "2024-01-15", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-15T10:00:00Z" },
  { id: "entry-3", week: 3, date: "2024-01-16", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-16T09:00:00Z" },
  { id: "entry-4", week: 3, date: "2024-01-16", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-16T10:00:00Z" },
  { id: "entry-5", week: 3, date: "2024-01-16", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-16T11:00:00Z" },
  { id: "entry-6", week: 3, date: "2024-01-17", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-17T09:00:00Z" },
  { id: "entry-7", week: 3, date: "2024-01-17", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-17T10:00:00Z" },
  { id: "entry-8", week: 3, date: "2024-01-18", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-18T09:00:00Z" },
  { id: "entry-9", week: 3, date: "2024-01-18", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-18T10:00:00Z" },
  { id: "entry-10", week: 3, date: "2024-01-18", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-18T11:00:00Z" },
  { id: "entry-11", week: 3, date: "2024-01-19", project: "Project Name", workType: "Big Task", description: "Homepage Development", hours: 4, updatedAt: "2024-01-19T09:00:00Z" }
];

const store = globalThis as typeof globalThis & {
  __timesheetWeeks?: TimesheetWeek[];
  __timesheetEntries?: TimesheetEntry[];
};

store.__timesheetWeeks ??= weekSeed.map((week) => ({ ...week }));
store.__timesheetEntries ??= entrySeed.map((entry) => ({ ...entry }));

function recalculateWeekHours(weekNumber: number) {
  const total = getEntriesForWeek(weekNumber).reduce((sum, entry) => sum + entry.hours, 0);
  const week = store.__timesheetWeeks?.find((item) => item.week === weekNumber);
  if (week) {
    week.hours = total;
  }
}

export function getWeeks() {
  return [...(store.__timesheetWeeks ?? [])].sort((a, b) => a.week - b.week);
}

export function getWeek(weekNumber: number) {
  return store.__timesheetWeeks?.find((week) => week.week === weekNumber) ?? null;
}

export function getStatus(hours: number): TimesheetStatus {
  if (hours === 40) return "COMPLETED";
  if (hours > 0) return "INCOMPLETE";
  return "MISSING";
}

export function getEntriesForWeek(weekNumber: number) {
  return [...(store.__timesheetEntries ?? [])]
    .filter((entry) => entry.week === weekNumber)
    .sort((a, b) => a.date.localeCompare(b.date) || a.updatedAt.localeCompare(b.updatedAt));
}

export function upsertEntry(weekNumber: number, input: TimesheetEntryInput, entryId?: string) {
  const entries = store.__timesheetEntries ?? [];
  const now = new Date().toISOString();

  if (entryId) {
    const existing = entries.find((entry) => entry.id === entryId && entry.week === weekNumber);
    if (!existing) return null;
    existing.date = input.date;
    existing.project = input.project;
    existing.workType = input.workType;
    existing.description = input.description;
    existing.hours = input.hours;
    existing.updatedAt = now;
    recalculateWeekHours(weekNumber);
    return existing;
  }

  const created: TimesheetEntry = {
    id: `entry-${crypto.randomUUID()}`,
    week: weekNumber,
    date: input.date,
    project: input.project,
    workType: input.workType,
    description: input.description,
    hours: input.hours,
    updatedAt: now
  };
  entries.push(created);
  store.__timesheetEntries = entries;
  recalculateWeekHours(weekNumber);
  return created;
}

export function deleteEntry(weekNumber: number, entryId: string) {
  const entries = store.__timesheetEntries ?? [];
  const next = entries.filter((entry) => !(entry.id === entryId && entry.week === weekNumber));
  if (next.length === entries.length) return false;
  store.__timesheetEntries = next;
  recalculateWeekHours(weekNumber);
  return true;
}

export function getWeekPayload(weekNumber: number) {
  const week = getWeek(weekNumber);
  if (!week) return null;
  return {
    week,
    status: getStatus(week.hours),
    entries: getEntriesForWeek(weekNumber)
  };
}
