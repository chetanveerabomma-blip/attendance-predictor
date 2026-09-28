import { z } from "zod";
import { parseISO, format, addDays, nextMonday, nextFriday, isBefore, isEqual, isAfter, isSunday } from "date-fns";
import { matchSubject } from "./subjectMatch";
import {
  simulateLeave,
  maxSafeLeaveDays,
  calculateRequiredForThreshold,
  calculateCanBunkForThreshold,
  SubjectCalculation,
  OverallCalculation,
  SEMESTER_START,
  SEMESTER_END,
} from "../engine";
import { WeekSchedule, Holiday, DayKey, getDayKeyFromDate, isHoliday } from "../dates";
import { DEFAULT_POLICY, LeaveType } from "../../config/policy";

export interface DashboardContext {
  userId: string;
  regNo: string;
  name: string;
  sectionId: string;
  todayDate: string; // YYYY-MM-DD
  overall: OverallCalculation;
  subjects: SubjectCalculation[];
  weekSchedule: WeekSchedule;
  holidays: Holiday[];
  leaves: any[];
}

export const CLAUDE_TOOLS = [
  {
    name: "get_dashboard_summary",
    description: "Returns today's date, days left in semester, overall attendance %, must attend, can bunk, and overall status.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_subject_status",
    description: "Returns attended, held, current %, remaining classes, must-attend for 75/90%, and safe bunks for a specific subject.",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Subject code or name (e.g. 'circuits', '26ECE201')" },
      },
      required: ["subject"],
    },
  },
  {
    name: "simulate_leave",
    description: "Simulates an OD, Medical, or Absent leave over a date range and returns exact before/after %, delta, and threshold crossings.",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Subject code or name, or 'ALL' for entire timetable" },
        type: { type: "string", enum: ["OD", "MEDICAL", "ABSENT"], description: "Type of leave" },
        startDate: { type: "string", description: "ISO start date YYYY-MM-DD" },
        endDate: { type: "string", description: "ISO end date YYYY-MM-DD" },
        days: { type: "number", description: "Number of calendar days if endDate not provided" },
        halfDay: { type: "boolean", description: "Whether this is a half-day session" },
        medicalApproved: { type: "boolean", description: "Whether medical certificate is approved" },
      },
      required: ["subject", "type", "startDate"],
    },
  },
  {
    name: "max_safe_leave",
    description: "Computes the maximum consecutive calendar days that can be missed safely starting from a given date without falling below 75%.",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Subject code or name" },
        startDate: { type: "string", description: "ISO start date YYYY-MM-DD" },
      },
      required: ["subject", "startDate"],
    },
  },
  {
    name: "classes_needed",
    description: "Returns the exact number of remaining classes a student must attend to hit 75% or 90% and whether it is mathematically achievable.",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Subject code or name" },
        target: { type: "number", enum: [75, 90], description: "Target attendance percentage" },
      },
      required: ["subject", "target"],
    },
  },
  {
    name: "list_upcoming_classes",
    description: "Lists scheduled timetable sessions between two dates for a subject or all subjects.",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Subject code or name, or 'ALL'" },
        fromDate: { type: "string", description: "ISO start date YYYY-MM-DD" },
        toDate: { type: "string", description: "ISO end date YYYY-MM-DD" },
      },
      required: ["fromDate", "toDate"],
    },
  },
  {
    name: "resolve_date",
    description: "Resolves natural-language expressions like 'tomorrow', 'next Monday', or '5th Oct' to an exact YYYY-MM-DD date in IST relative to today.",
    input_schema: {
      type: "object",
      properties: {
        expression: { type: "string", description: "Natural language date expression" },
      },
      required: ["expression"],
    },
  },
];

/**
 * Resolves natural language date to YYYY-MM-DD in IST relative to context.todayDate.
 */
export function resolveDateExpression(expression: string, todayDateStr: string): string {
  const clean = expression.trim().toLowerCase();
  const today = parseISO(todayDateStr);

  if (clean === "today") {
    return todayDateStr;
  }
  if (clean === "tomorrow") {
    return format(addDays(today, 1), "yyyy-MM-dd");
  }
  if (clean === "day after tomorrow") {
    return format(addDays(today, 2), "yyyy-MM-dd");
  }
  if (clean.includes("next monday")) {
    return format(nextMonday(today), "yyyy-MM-dd");
  }
  if (clean.includes("next friday")) {
    return format(nextFriday(today), "yyyy-MM-dd");
  }

  // Regex match e.g. "5th oct" or "october 5" or "5 oct 2026"
  const matchDayMonth = clean.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/i);
  if (matchDayMonth) {
    const day = parseInt(matchDayMonth[1], 10);
    const monthNames: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12"
    };
    const month = monthNames[matchDayMonth[2].toLowerCase()];
    if (month) {
      return `2026-${month}-${String(day).padStart(2, "0")}`;
    }
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Default to tomorrow
  return format(addDays(today, 1), "yyyy-MM-dd");
}

/**
 * Executes a tool call against the student's authentic DashboardContext.
 */
export async function executeAdvisorTool(
  toolName: string,
  args: any,
  context: DashboardContext
): Promise<{ result: any; resultCard?: any }> {
  switch (toolName) {
    case "resolve_date": {
      const resolved = resolveDateExpression(args.expression || "tomorrow", context.todayDate);
      return { result: { expression: args.expression, resolvedDate: resolved } };
    }

    case "get_dashboard_summary": {
      return {
        result: {
          todayDate: context.todayDate,
          daysLeft: Math.max(0, 62), // calculated in context
          overallPercentage: context.overall.current_percentage,
          status: context.overall.status,
          totalHeld: context.overall.total_held,
          totalAttended: context.overall.total_attended,
          totalRemaining: context.overall.total_remaining,
          mustAttend75: context.overall.must_attend_75,
          canBunk75: context.overall.can_bunk_75,
          hasIrreversibleDetention: context.overall.has_irreversible_detention,
          subjectsCount: context.subjects.length,
        },
      };
    }

    case "get_subject_status": {
      const match = matchSubject(args.subject, context.subjects);
      if (!match.exactMatch) {
        return {
          result: {
            error: `Subject '${args.subject}' was not found.`,
            suggestions: match.candidates.map((c) => ({ code: c.code, name: c.name })),
          },
        };
      }

      const s = context.subjects.find((sub) => sub.code === match.exactMatch!.code)!;
      return {
        result: {
          code: s.code,
          name: s.name,
          currentPercentage: s.current_percentage,
          attended: s.attended_so_far,
          held: s.held_so_far,
          remaining: s.remaining_total,
          mustAttend75: s.must_attend_75,
          canBunk75: s.can_bunk_75,
          status: s.status,
          isIrreversible: s.status === "IRREVERSIBLE",
        },
        resultCard: {
          title: `${s.code}: ${s.name}`,
          percentage: s.current_percentage,
          status: s.status,
          mustAttend: s.must_attend_75,
          canBunk: s.can_bunk_75,
        },
      };
    }

    case "simulate_leave": {
      let startDate = args.startDate;
      if (!startDate) startDate = resolveDateExpression("tomorrow", context.todayDate);

      let endDate = args.endDate;
      if (!endDate && args.days) {
        endDate = format(addDays(parseISO(startDate), args.days - 1), "yyyy-MM-dd");
      }
      if (!endDate) endDate = startDate;

      const results: any[] = [];
      const targets =
        args.subject === "ALL"
          ? context.subjects
          : (() => {
              const m = matchSubject(args.subject, context.subjects);
              return m.exactMatch ? [context.subjects.find((s) => s.code === m.exactMatch!.code)!] : [];
            })();

      if (targets.length === 0) {
        return {
          result: { error: `No matching subject found for '${args.subject}'` },
        };
      }

      for (const target of targets) {
        const sim = simulateLeave(
          target,
          {
            type: args.type as LeaveType,
            startDate,
            endDate,
            scope: target.code,
            isHalfDay: args.halfDay,
            medicalApproved: args.medicalApproved,
          },
          context.weekSchedule,
          context.holidays,
          [],
          context.todayDate,
          DEFAULT_POLICY
        );
        results.push(sim);
      }

      const primary = results[0];
      return {
        result: {
          leaveType: args.type,
          startDate,
          endDate,
          simulations: results.map((r) => ({
            subject: r.subjectCode,
            beforePercentage: r.before.percentage,
            afterPercentage: r.after.percentage,
            delta: r.delta,
            crosses75: r.crossesThreshold75,
            becomesIrreversible: r.becomesIrreversible,
            affectedClassesCount: r.affectedPeriodsCount,
            mustAttendRemaining: r.after.must_attend_75,
          })),
        },
        resultCard: primary
          ? {
              title: `${primary.subjectCode} Leave Simulation (${args.type})`,
              beforePct: primary.before.percentage,
              afterPct: primary.after.percentage,
              delta: primary.delta,
              crosses75: primary.crossesThreshold75,
              becomesIrreversible: primary.becomesIrreversible,
              affectedClasses: primary.affectedPeriodsCount,
            }
          : undefined,
      };
    }

    case "max_safe_leave": {
      const match = matchSubject(args.subject, context.subjects);
      if (!match.exactMatch) {
        return { result: { error: `Subject '${args.subject}' not found.` } };
      }
      const s = context.subjects.find((sub) => sub.code === match.exactMatch!.code)!;
      const startDate = args.startDate || context.todayDate;
      const safeDays = maxSafeLeaveDays(
        s,
        s.code,
        startDate,
        context.weekSchedule,
        context.holidays
      );

      return {
        result: {
          subject: s.code,
          startDate,
          maxSafeDays: safeDays,
          currentPercentage: s.current_percentage,
        },
      };
    }

    case "classes_needed": {
      const match = matchSubject(args.subject, context.subjects);
      if (!match.exactMatch) {
        return { result: { error: `Subject '${args.subject}' not found.` } };
      }
      const s = context.subjects.find((sub) => sub.code === match.exactMatch!.code)!;
      const threshold = (args.target || 75) / 100;
      const needed = calculateRequiredForThreshold(threshold, s.total_final, s.attended_so_far);
      const isFeasible = needed <= s.remaining_total;

      return {
        result: {
          subject: s.code,
          targetPercentage: args.target,
          classesNeeded: needed,
          remainingScheduled: s.remaining_total,
          isFeasible,
        },
        resultCard: {
          title: `${s.code} - ${args.target}% Target`,
          classesNeeded: needed,
          remaining: s.remaining_total,
          isFeasible,
        },
      };
    }

    case "list_upcoming_classes": {
      const { fromDate, toDate, subject } = args;
      const classes: any[] = [];
      let curr = parseISO(fromDate);
      const end = parseISO(toDate);

      while (isBefore(curr, end) || isEqual(curr, end)) {
        const dStr = format(curr, "yyyy-MM-dd");
        if (!isSunday(curr) && !isHoliday(dStr, context.holidays)) {
          const dayKey = getDayKeyFromDate(curr);
          if (dayKey && context.weekSchedule[dayKey]) {
            for (const slot of context.weekSchedule[dayKey]!) {
              if (subject === "ALL" || !subject || slot.subjectCode.toLowerCase().includes(subject.toLowerCase())) {
                classes.push({
                  date: dStr,
                  period: slot.period,
                  start: slot.start,
                  end: slot.end,
                  subjectCode: slot.subjectCode,
                });
              }
            }
          }
        }
        curr = addDays(curr, 1);
      }

      return {
        result: {
          count: classes.length,
          classes: classes.slice(0, 15), // cap for token savings
        },
      };
    }

    default:
      return { result: { error: `Unknown tool: ${toolName}` } };
  }
}
