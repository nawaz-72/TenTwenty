"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import type { TimesheetStatus } from "@/lib/timesheetStore";

type WeekRow = {
  week: number;
  startDate: string;
  endDate: string;
  hours: number;
  status: TimesheetStatus;
};

const dateRanges = [
  { label: "All weeks", value: "all", start: "", end: "" },
  { label: "Jan 1 - Jan 12, 2024", value: "jan-1-12", start: "2024-01-01", end: "2024-01-12" },
  { label: "Jan 15 - Feb 2, 2024", value: "jan-15-feb-2", start: "2024-01-15", end: "2024-02-02" },
  { label: "Feb 5 - Feb 23, 2024", value: "feb-5-23", start: "2024-02-05", end: "2024-02-23" }
];

const statusStyles: Record<TimesheetStatus, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  INCOMPLETE: "bg-amber-100 text-amber-700",
  MISSING: "bg-pink-100 text-pink-700"
};

function formatDisplayRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const startText = start.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const endText = end.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  return `${startText} - ${endText}`;
}

function inSelectedRange(row: WeekRow, rangeValue: string) {
  const selected = dateRanges.find((range) => range.value === rangeValue) ?? dateRanges[0];
  if (selected.value === "all") return true;

  const rowStart = new Date(`${row.startDate}T00:00:00`).getTime();
  const rowEnd = new Date(`${row.endDate}T00:00:00`).getTime();
  const filterStart = new Date(`${selected.start}T00:00:00`).getTime();
  const filterEnd = new Date(`${selected.end}T00:00:00`).getTime();
  return rowStart >= filterStart && rowEnd <= filterEnd;
}

export default function TimesheetPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.assign("/login");
    }
  });

  const [rows, setRows] = useState<WeekRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TimesheetStatus>("all");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadWeeks() {
      setIsLoadingData(true);
      const response = await fetch("/api/timesheets", { cache: "no-store" });
      const data = await response.json();
      if (!active) return;
      setRows(data.weeks ?? []);
      setIsLoadingData(false);
    }

    loadWeeks().catch(() => {
      if (active) setIsLoadingData(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rangeMatch = inSelectedRange(row, dateRange);
      const statusMatch = statusFilter === "all" || row.status === statusFilter;
      return rangeMatch && statusMatch;
    });
  }, [dateRange, rows, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageSize, safePage]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const pages: Array<number> = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pages.push(-1);
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push(-1);
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  if (status === "loading" || isLoadingData) {
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
              aria-label="status"
            >
              •
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <section className="rounded-md border border-slate-200 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Your Timesheets</h1>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <label className="min-w-[220px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full cursor-pointer bg-transparent outline-none"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-[180px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | TimesheetStatus)}
                className="w-full cursor-pointer bg-transparent outline-none"
              >
                <option value="all">All statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="INCOMPLETE">Incomplete</option>
                <option value="MISSING">Missing</option>
              </select>
            </label>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-4">Week #</th>
                  <th className="px-4 py-4">
                    <span className="inline-flex items-center gap-1">
                      Date <ArrowUpDown className="h-3.5 w-3.5" />
                    </span>
                  </th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedRows.length > 0 ? (
                  pagedRows.map((row) => (
                    <tr key={row.week} className="text-sm">
                      <td className="px-4 py-4 text-slate-700">{row.week}</td>
                      <td className="px-4 py-4 text-slate-500">{formatDisplayRange(row.startDate, row.endDate)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded px-2 py-1 text-[11px] font-bold ${statusStyles[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {row.status === "COMPLETED" ? (
                          <Link
                            href={`/timesheet/${row.week}`}
                            className="font-medium text-blue-600 transition duration-200 hover:text-blue-700 hover:underline underline-offset-4 cursor-pointer"
                          >
                            View
                          </Link>
                        ) : (
                          <Link
                            href={`/timesheet/${row.week}`}
                            className="font-medium text-blue-600 transition duration-200 hover:text-blue-700 hover:underline underline-offset-4 cursor-pointer"
                          >
                            {row.status === "MISSING" ? "Create" : "Update"}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={4}>
                      No timesheets match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="cursor-pointer bg-transparent outline-none"
              >
                {[5, 10, 15].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <button
                className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                Previous
              </button>
              {visiblePages.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  onClick={() => {
                    if (item !== -1) setCurrentPage(item);
                  }}
                  className={`min-w-9 cursor-pointer rounded-md border px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 ${
                    item === safePage ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  disabled={item === -1}
                >
                  {item === -1 ? "..." : item}
                </button>
              ))}
              <button
                className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-4 rounded-md border border-slate-200 bg-white py-6 text-center text-sm text-slate-400 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          © 2024 ttwenty. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
