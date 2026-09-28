import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataDir = path.resolve(process.cwd(), "data", "timetables");
    const holidaysPath = path.resolve(process.cwd(), "data", "holidays-2026.json");

    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
    const timetables: Record<string, any> = {};

    for (const f of files) {
      const content = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
      timetables[content.section.id] = content;
    }

    const holidays = JSON.parse(fs.readFileSync(holidaysPath, "utf8"));

    return NextResponse.json({ timetables, holidays });
  } catch (error: any) {
    console.error("Error reading timetable data:", error);
    return NextResponse.json({ error: "Failed to load timetable datasets" }, { status: 500 });
  }
}
