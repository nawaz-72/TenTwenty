import { NextResponse } from "next/server";
import { getWeekPayload, upsertEntry } from "@/lib/timesheetStore";

function parseWeek(params: { week?: string }) {
  const week = Number(params.week);
  return Number.isFinite(week) ? week : null;
}

export async function GET(_: Request, { params }: { params: Promise<{ week: string }> }) {
  const resolvedParams = await params;
  const weekNumber = parseWeek(resolvedParams);
  if (!weekNumber) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const payload = getWeekPayload(weekNumber);
  if (!payload) {
    return NextResponse.json({ error: "Week not found" }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function POST(request: Request, { params }: { params: Promise<{ week: string }> }) {
  const resolvedParams = await params;
  const weekNumber = parseWeek(resolvedParams);
  if (!weekNumber) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const created = upsertEntry(weekNumber, {
    date: String(body.date ?? ""),
    project: String(body.project ?? ""),
    workType: String(body.workType ?? ""),
    description: String(body.description ?? ""),
    hours: Number(body.hours ?? 0)
  });

  if (!created) {
    return NextResponse.json({ error: "Unable to create entry" }, { status: 400 });
  }

  return NextResponse.json(created, { status: 201 });
}
