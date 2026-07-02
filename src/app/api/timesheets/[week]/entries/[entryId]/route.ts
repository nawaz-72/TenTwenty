import { NextResponse } from "next/server";
import { deleteEntry, upsertEntry } from "@/lib/timesheetStore";

function parseWeek(params: { week?: string }) {
  const week = Number(params.week);
  return Number.isFinite(week) ? week : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ week: string; entryId: string }> }
) {
  const resolvedParams = await params;
  const weekNumber = parseWeek(resolvedParams);
  if (!weekNumber) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = upsertEntry(
    weekNumber,
    {
      date: String(body.date ?? ""),
      project: String(body.project ?? ""),
      workType: String(body.workType ?? ""),
      description: String(body.description ?? ""),
      hours: Number(body.hours ?? 0)
    },
    resolvedParams.entryId
  );

  if (!updated) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ week: string; entryId: string }> }) {
  const resolvedParams = await params;
  const weekNumber = parseWeek(resolvedParams);
  if (!weekNumber) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const deleted = deleteEntry(weekNumber, resolvedParams.entryId);
  if (!deleted) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
