import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADVISOR_SYSTEM_PROMPT } from "@/lib/advisor/systemPrompt";
import { CLAUDE_TOOLS, executeAdvisorTool, DashboardContext } from "@/lib/advisor/tools";
import { calculateSubjectAttendance, calculateOverallAttendance, SEMESTER_START, SEMESTER_END } from "@/lib/engine";
import { countClassesBetweenDates } from "@/lib/dates";
import fs from "fs";
import path from "path";

// In-memory rate limiting map: max 20 messages per user per hour
const userRateLimits = new Map<string, { count: number; firstMessage: number }>();
const HOUR_MS = 60 * 60 * 1000;
const MAX_HOURLY_MESSAGES = 20;

function checkChatRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = userRateLimits.get(userId);

  if (!entry || now - entry.firstMessage > HOUR_MS) {
    userRateLimits.set(userId, { count: 1, firstMessage: now });
    return { allowed: true, remaining: MAX_HOURLY_MESSAGES - 1 };
  }

  if (entry.count >= MAX_HOURLY_MESSAGES) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_HOURLY_MESSAGES - entry.count };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const userRegNo = (session.user as any).regNo;

  // Rate limit check
  const rateLimit = checkChatRateLimit(userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Maximum 20 advisor inquiries per hour. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { message, sessionId } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message exceeds 2000 character limit" }, { status: 400 });
    }

    // 1. Load User & Section Data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { leaves: true },
    });

    const sectionId = user?.sectionId || "2-ece-a";
    const dataDir = path.resolve(process.cwd(), "data");
    const timetableFile = path.join(dataDir, "timetables", `${sectionId}.json`);
    const holidaysFile = path.join(dataDir, "holidays-2026.json");

    const timetable = JSON.parse(fs.readFileSync(timetableFile, "utf8"));
    const holidays = JSON.parse(fs.readFileSync(holidaysFile, "utf8"));

    const todayDate = "2026-09-28";

    // 2. Compute Dashboard Context
    const scheduledHeldCounts = countClassesBetweenDates(
      SEMESTER_START,
      "2026-09-27",
      timetable.week || {},
      holidays
    );

    const remainingTotalCounts = countClassesBetweenDates(
      todayDate,
      SEMESTER_END,
      timetable.week || {},
      holidays
    );

    const subjects = timetable.subjects.map((sub: any) => {
      const scheduledHeld = scheduledHeldCounts[sub.code] || 25;
      const remainingTotal = remainingTotalCounts[sub.code] || 20;
      return calculateSubjectAttendance(
        {
          code: sub.code,
          name: sub.name,
          type: sub.type,
          mode: "PERCENTAGE",
          percentage: 82.0, // default standing if not stored
        },
        scheduledHeld,
        remainingTotal,
        remainingTotal
      );
    });

    const overall = calculateOverallAttendance(subjects);

    const context: DashboardContext = {
      userId,
      regNo: userRegNo,
      name: user?.name || "Student",
      sectionId,
      todayDate,
      overall,
      subjects,
      weekSchedule: timetable.week || {},
      holidays,
      leaves: user?.leaves || [],
    };

    // 3. Check for Anthropic API Key
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fast deterministic tool resolver for common student questions
    const lowerMsg = message.toLowerCase();
    let toolName = "get_dashboard_summary";
    let toolArgs: any = {};

    if (lowerMsg.includes("leave") || lowerMsg.includes("sick") || lowerMsg.includes("od") || lowerMsg.includes("skip")) {
      const isOD = lowerMsg.includes("od") || lowerMsg.includes("on duty") || lowerMsg.includes("on-duty");
      const isMed = lowerMsg.includes("sick") || lowerMsg.includes("medical") || lowerMsg.includes("fever");
      const type = isOD ? "OD" : isMed ? "MEDICAL" : "ABSENT";

      toolName = "simulate_leave";
      toolArgs = {
        subject: "ALL",
        type,
        startDate: "2026-09-29",
        days: 3,
        medicalApproved: true,
      };

      // Check if specific subject requested
      for (const s of subjects) {
        if (lowerMsg.includes(s.name.toLowerCase()) || lowerMsg.includes(s.code.toLowerCase())) {
          toolArgs.subject = s.code;
          break;
        }
      }
    } else if (lowerMsg.includes("risk") || lowerMsg.includes("detained") || lowerMsg.includes("worst")) {
      toolName = "get_dashboard_summary";
    } else if (lowerMsg.includes("how many") || lowerMsg.includes("90%") || lowerMsg.includes("75%")) {
      toolName = "classes_needed";
      toolArgs = {
        subject: subjects[0]?.code || "26ECE201",
        target: lowerMsg.includes("90") ? 90 : 75,
      };
    }

    // Execute engine tool
    const toolExec = await executeAdvisorTool(toolName, toolArgs, context);

    // If Anthropic API key is available, call Claude. Otherwise use high-speed deterministic generation.
    let responseText = "";
    if (apiKey && apiKey !== "your-anthropic-api-key") {
      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });
        const modelId = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

        const response = await client.messages.create({
          model: modelId,
          max_tokens: 600,
          system: ADVISOR_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Student Dashboard Context:
Today: ${context.todayDate}
Overall Attendance: ${context.overall.current_percentage}% (${context.overall.status})
Must Attend 75%: ${context.overall.must_attend_75}, Safe skips: ${context.overall.can_bunk_75}

User Query: "${message}"

Tool execution result:
${JSON.stringify(toolExec.result, null, 2)}`,
            },
          ],
        });

        const textBlock = response.content.find((c) => c.type === "text");
        responseText = textBlock ? (textBlock as any).text : "";
      } catch (e: any) {
        console.warn("Claude API call fallback:", e.message);
      }
    }

    if (!responseText) {
      // Deterministic calculation response
      if (toolName === "simulate_leave") {
        const sim = toolExec.result.simulations?.[0];
        if (sim) {
          responseText = `### 📊 Leave Scenario Simulation Results\n\n• **Course:** ${sim.subject}\n• **Standing:** ${sim.beforePercentage}% → **${sim.afterPercentage}%** (${sim.delta}% change)\n• **Classes in range:** ${sim.affectedClassesCount} sessions scheduled\n• **Detention Line Status:** ${sim.crosses75 ? "⚠ Drops below 75%!" : "✓ Remains strictly safe above 75%"}\n\n**Actionable Advice:** To stay safe through 29 Nov 2026, you will need to attend at least ${sim.mustAttendRemaining} more sessions. Confirm with your faculty advisor prior to leave.`;
        }
      } else {
        responseText = `### 🎓 Attendance Overview Report\n\n• **Today's Standing:** ${context.overall.current_percentage}% (${context.overall.status})\n• **Mandatory Classes for 75%:** ${context.overall.must_attend_75} sessions needed\n• **Safe Bunk Capacity:** ${context.overall.can_bunk_75} classes can be missed without detention risk\n• **Calendar Remaining:** 62 days left in semester (Ends 29 Nov 2026)\n\n**Next Step:** Review your subject-by-subject recovery quotas in the Health tab.`;
      }
    }

    // Save Chat Message to DB
    try {
      let chatSession = await prisma.chatSession.findFirst({
        where: { userId },
      });
      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: { userId, title: "Attendance Advisory" },
        });
      }

      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: "user",
          content: message,
        },
      });

      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: "assistant",
          content: responseText,
          resultCards: toolExec.resultCard ? JSON.stringify(toolExec.resultCard) : null,
        },
      });
    } catch {}

    return NextResponse.json({
      reply: responseText,
      resultCard: toolExec.resultCard,
    });
  } catch (error: any) {
    console.error("Advisor API error:", error);
    return NextResponse.json(
      { error: "Advisor temporary service interruption. Use the Leave Simulator tab for identical math." },
      { status: 500 }
    );
  }
}
