import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimetableFileSchema } from "@/lib/timetable-schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const dir = path.resolve(process.cwd(), "data", "timetables");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const timetables = files.map((f) => {
    return {
      filename: f,
      content: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")),
    };
  });

  return NextResponse.json({ timetables });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const { filename, content } = await req.json();
    if (!filename || !content) {
      return NextResponse.json({ error: "Missing filename or content" }, { status: 400 });
    }

    // Validate with Zod schema
    const parseResult = TimetableFileSchema.safeParse(content);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Timetable validation failed", issues: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const validData = parseResult.data;
    const targetFile = path.resolve(process.cwd(), "data", "timetables", filename);
    fs.writeFileSync(targetFile, JSON.stringify(validData, null, 2), "utf8");

    // Sync to DB
    await prisma.section.upsert({
      where: { id: validData.section.id },
      update: {
        year: validData.section.year,
        branch: validData.section.branch,
        label: validData.section.label,
      },
      create: {
        id: validData.section.id,
        year: validData.section.year,
        branch: validData.section.branch,
        label: validData.section.label,
      },
    });

    for (const sub of validData.subjects) {
      await prisma.subject.upsert({
        where: {
          sectionId_code: {
            sectionId: validData.section.id,
            code: sub.code,
          },
        },
        update: {
          name: sub.name,
          type: sub.type,
          periodsPerSession: sub.periodsPerSession || 1,
        },
        create: {
          code: sub.code,
          name: sub.name,
          type: sub.type,
          periodsPerSession: sub.periodsPerSession || 1,
          sectionId: validData.section.id,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "TIMETABLE_UPDATED",
        details: `Updated timetable ${filename} by admin ${(session.user as any).regNo}`,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ message: "Timetable updated and synchronized with database!" });
  } catch (error: any) {
    console.error("Admin timetable update error:", error);
    return NextResponse.json({ error: "Internal error updating timetable" }, { status: 500 });
  }
}
