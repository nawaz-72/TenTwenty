"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, Loader2, MoreHorizontal, Minus, Plus, X } from "lucide-react";
import type { TimesheetEntry, TimesheetWeek } from "@/lib/timesheetStore";

type WeekDetailResponse = {
  week: TimesheetWeek;
  status: string;
  entries: TimesheetEntry[];
};

type EditForm = {
  id: string | null;
  project: string;
  workType: string;
  description: string;
  date: string;
  hours: number;
};

const projectOptions = ["Project Name", "Website Redesign", "Mobile App"];
const workTypeOptions = ["Big Task", "Small Task", "Bug Fix"];

function formatWeekLabel(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

function formatDayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dayKey(date: string) {
  return date;
}

export default function WeekDetailPage({ params }: { params: Promise<{ week: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.assign("/login");
    }
  });

  const weekNumber = Number(resolvedParams.week);
  const [weekDetail, setWeekDetail] = useState<WeekDetailResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [form, setForm] = useState<EditForm>({
    id: null,
    project: projectOptions[0],
    workType: workTypeOptions[0],
    description: "",
    date: "",
    hours: 1
  });

  useEffect(() => {
    let active = true;

    async function loadWeek() {
      setIsLoadingData(true);
      const response = await fetch(`/api/timesheets/${weekNumber}`, { cache: "no-store" });
      const data = await response.json();
      if (!active) return;
      const normalizedEntries = Array.isArray(data.entries) ? data.entries : [];
      setWeekDetail({
        week: data.week,
        status: data.status,
        entries: normalizedEntries
      });
      const firstDate = normalizedEntries[0]?.date ?? data.week?.startDate ?? "";
      setForm((current) => ({
        ...current,
        date: current.date || firstDate
      }));
      setIsLoadingData(false);
    }

    loadWeek().catch(() => {
      if (active) setIsLoadingData(false);
    });

    return () => {
      active = false;
    };
  }, [weekNumber]);

  const groupedEntries = useMemo(() => {
    if (!weekDetail || !Array.isArray(weekDetail.entries)) return [];
    const map = new Map<string, TimesheetEntry[]>();
    for (const entry of weekDetail.entries) {
      const key = dayKey(entry.date);
      map.set(key, [...(map.get(key) ?? []), entry]);
    }
    return Array.from(map.entries())
      .map(([date, entries]) => ({ date, entries }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [weekDetail]);

  const totalHours = weekDetail?.week.hours ?? 0;
  const progress = Math.min(100, Math.round((totalHours / 40) * 100));

  function openCreateModal(date: string) {
    setEditingEntry(null);
    setForm({
      id: null,
      project: projectOptions[0],
      workType: workTypeOptions[0],
      description: "",
      date,
      hours: 1
    });
    setIsModalOpen(true);
  }

  function openEditModal(entry: TimesheetEntry) {
    setEditingEntry(entry);
    setForm({
      id: entry.id,
      project: entry.project,
      workType: entry.workType,
      description: entry.description,
      date: entry.date,
      hours: entry.hours
    });
    setIsModalOpen(true);
    setMenuOpenId(null);
  }

  async function saveEntry() {
    if (!form.date || !form.description.trim()) return;
    setIsSaving(true);

    const payload = {
      week: weekNumber,
      date: form.date,
      project: form.project,
      workType: form.workType,
      description: form.description,
      hours: Number(form.hours)
    };

    const response = editingEntry
      ? await fetch(`/api/timesheets/${weekNumber}/entries/${editingEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch(`/api/timesheets/${weekNumber}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

    if (response.ok) {
      const nextWeek = await fetch(`/api/timesheets/${weekNumber}`, { cache: "no-store" }).then((res) => res.json());
      setWeekDetail(nextWeek);
      setIsModalOpen(false);
      setEditingEntry(null);
      setMenuOpenId(null);
    }

    setIsSaving(false);
  }

  async function deleteEntry(entry: TimesheetEntry) {
    setMenuOpenId(null);
    const response = await fetch(`/api/timesheets/${weekNumber}/entries/${entry.id}`, {
      method: "DELETE"
    });
    if (response.ok) {
      const nextWeek = await fetch(`/api/timesheets/${weekNumber}`, { cache: "no-store" }).then((res) => res.json());
      setWeekDetail(nextWeek);
    }
  }

  if (status === "loading" || isLoadingData || !weekDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/timesheet" className="text-2xl font-semibold tracking-tight text-slate-900">
              ticktock
            </Link>
            <div className="text-sm font-medium text-slate-500">Timesheets</div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{session?.user?.name || "John Doe"}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="ml-2 cursor-pointer rounded-full border border-emerald-500 bg-emerald-400 px-2 py-1 text-[10px] font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              •
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <section className="rounded-md border border-slate-200 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">This week&apos;s timesheet</h1>
              <p className="mt-1 text-sm text-slate-400">{formatWeekLabel(weekDetail.week.startDate, weekDetail.week.endDate)}</p>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                {totalHours}/40 hrs
              </div>
              <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-400">{progress}%</div>
            </div>
          </div>

          <div className="space-y-4">
            {groupedEntries.map(({ date, entries }) => (
              <div key={date} className="grid grid-cols-[70px_1fr] gap-4">
                <div className="pt-2 text-sm font-medium text-slate-500">{formatDayLabel(date)}</div>

                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="relative flex items-center justify-between rounded-md border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-700">{entry.description}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {entry.project} · {entry.workType}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{entry.hours} hrs</span>
                        <div className="group/menu relative">
                          <button
                            onClick={() => setMenuOpenId((current) => (current === entry.id ? null : entry.id))}
                            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Open actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {menuOpenId === entry.id && (
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-28 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                              <button
                                onClick={() => openEditModal(entry)}
                                className="flex w-full cursor-pointer items-center rounded px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteEntry(entry)}
                                className="flex w-full cursor-pointer items-center rounded px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => openCreateModal(date)}
                    className="flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-blue-200 bg-white py-2.5 text-sm font-medium text-blue-500 transition duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add new task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/80 px-4">
            <div className="relative w-full max-w-[420px] rounded-md bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">{editingEntry ? "Edit Entry" : "Add New Entry"}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 py-4">
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-slate-700">Select Project *</span>
                    <div className="relative">
                      <select
                        value={form.project}
                        onChange={(e) => setForm((current) => ({ ...current, project: e.target.value }))}
                        className="h-9 w-full appearance-none rounded border border-slate-300 bg-white px-3 text-[12px] text-slate-700 outline-none transition focus:border-blue-400"
                      >
                        {projectOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-slate-700">Type of Work *</span>
                    <div className="relative">
                      <select
                        value={form.workType}
                        onChange={(e) => setForm((current) => ({ ...current, workType: e.target.value }))}
                        className="h-9 w-full appearance-none rounded border border-slate-300 bg-white px-3 text-[12px] text-slate-700 outline-none transition focus:border-blue-400"
                      >
                        {workTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-slate-700">Task Description *</span>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                      placeholder="Write task here..."
                      className="min-h-28 w-full resize-none rounded border border-slate-300 px-3 py-2 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">A brief for entry info</p>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-slate-700">Date *</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                      className="h-9 w-full rounded border border-slate-300 px-3 text-[12px] text-slate-700 outline-none transition focus:border-blue-400"
                    />
                  </label>

                  <div>
                    <span className="mb-1 block text-[11px] font-semibold text-slate-700">Hours *</span>
                    <div className="inline-flex items-center overflow-hidden rounded border border-slate-300">
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, hours: Math.max(1, current.hours - 1) }))}
                        className="cursor-pointer border-r border-slate-300 px-3 py-2 text-slate-500 transition hover:bg-slate-50"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="min-w-10 px-3 py-2 text-center text-[12px] font-semibold text-slate-700">{form.hours}</div>
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, hours: current.hours + 1 }))}
                        className="cursor-pointer border-l border-slate-300 px-3 py-2 text-slate-500 transition hover:bg-slate-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-3">
                <button
                  onClick={saveEntry}
                  disabled={isSaving}
                  className="h-9 flex-1 cursor-pointer rounded bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Add Entry"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 flex-1 cursor-pointer rounded border border-slate-300 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-4 rounded-md border border-slate-200 bg-white py-6 text-center text-sm text-slate-400 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          © 2024 ttwenty. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
