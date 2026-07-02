import { NextResponse } from "next/server";
import { getStatus, getWeeks } from "@/lib/timesheetStore";

export function GET() {
  const weeks = getWeeks().map((week) => ({
    ...week,
    status: getStatus(week.hours)
  }));

  return NextResponse.json({ weeks });
}
