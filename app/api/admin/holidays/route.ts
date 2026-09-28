import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HolidayListSchema } from "@/lib/timetable-schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const holidaysPath = path.resolve(process.cwd(), "data", "holidays-2026.json");
  const holidays = JSON.parse(fs.readFileSync(holidaysPath, "utf8"));
  return NextResponse.json({ holidays });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const { holidays } = await req.json();
    const result = HolidayListSchema.safeParse(holidays);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid holiday schema", issues: result.error.flatten() },
        { status: 400 }
      );
    }

    const holidaysPath = path.resolve(process.cwd(), "data", "holidays-2026.json");
    fs.writeFileSync(holidaysPath, JSON.stringify(result.data, null, 2), "utf8");

    await prisma.auditLog.create({
      data: {
        action: "HOLIDAYS_UPDATED",
        details: `Holidays updated (${result.data.length} entries) by ${(session.user as any).regNo}`,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ message: "Holidays list saved successfully!", holidays: result.data });
  } catch (error: any) {
    console.error("Admin holiday update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
