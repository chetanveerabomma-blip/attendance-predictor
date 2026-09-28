/**
 * Attendance Predictor - Calculation Engine
 * Pure functions for attendance forecasting, detention risk, and recovery planning.
 * Timezone: Asia/Kolkata
 * Semester: 2026-08-29 to 2026-11-29
 */

export const SEMESTER_START = "2026-08-29";
export const SEMESTER_END = "2026-11-29";
export const THRESHOLD_DETENTION = 0.75;
export const THRESHOLD_TARGET = 0.90;

export type AttendanceStatus = "SAFE_90" | "SAFE_75" | "DANGER" | "IRREVERSIBLE";

export interface SubjectScheduleInfo {
  code: string;
  name: string;
  type: "THEORY" | "LAB";
  periodsPerSession?: number;
}

export interface SubjectInput {
  code: string;
  name: string;
  type: "THEORY" | "LAB";
  mode: "PERCENTAGE" | "COUNTS";
  // Used if mode === 'PERCENTAGE'
  percentage?: number;
  // Used if mode === 'COUNTS'
  attended?: number;
  held?: number;
  // User planned skips up to planning date
  plannedSkips?: number;
}

export interface SubjectCalculation {
  code: string;
  name: string;
  type: "THEORY" | "LAB";
  mode: "PERCENTAGE" | "COUNTS";
  held_so_far: number;
  attended_so_far: number;
  current_percentage: number;
  remaining_total: number; // R
  remaining_until_plan_date: number;
  total_final: number; // T = held_so_far + remaining_total
  must_attend_75: number;
  must_attend_90: number;
  can_bunk_75: number;
  can_bunk_90: number;
  status: AttendanceStatus;
  max_possible_percentage: number;
  // Future planning projections
  planned_skips: number;
  projected_attended_with_skips: number;
  projected_percentage_with_skips: number;
  plan_breaks_75: boolean;
  // Recovery plan: classes to attend per week (assuming remaining weeks)
  weekly_target_75: number;
  weekly_target_90: number;
}

export interface OverallCalculation {
  total_held: number;
  total_attended: number;
  current_percentage: number;
  total_remaining: number;
  total_final: number;
  must_attend_75: number;
  must_attend_90: number;
  can_bunk_75: number;
  can_bunk_90: number;
  max_possible_percentage: number;
  status: AttendanceStatus;
  has_irreversible_detention: boolean;
  irreversible_subjects: SubjectCalculation[];
}

/**
 * Calculates required classes to attend out of remaining to achieve a target threshold.
 * Formula: max(0, ceil(threshold * total_final - attended_so_far))
 */
export function calculateRequiredForThreshold(
  threshold: number,
  total_final: number,
  attended_so_far: number
): number {
  if (total_final <= 0) return 0;
  const rawRequired = Math.ceil(threshold * total_final - attended_so_far);
  return Math.max(0, rawRequired);
}

/**
 * Calculates safe classes that can be bunked while keeping attendance >= threshold.
 * Formula: max(0, floor(remaining - must_attend)) if current + remaining can meet it, else 0
 */
export function calculateCanBunkForThreshold(
  remaining: number,
  must_attend: number
): number {
  if (must_attend > remaining) return 0;
  return Math.max(0, Math.floor(remaining - must_attend));
}

/**
 * Determines attendance status based on thresholds and recovery feasibility.
 */
export function determineStatus(
  current_percentage: number,
  must_attend_75: number,
  remaining: number,
  can_bunk_90: number
): AttendanceStatus {
  if (must_attend_75 > remaining) {
    return "IRREVERSIBLE";
  }
  if (current_percentage >= 90 && can_bunk_90 > 0) {
    return "SAFE_90";
  }
  if (current_percentage >= 75) {
    return "SAFE_75";
  }
  return "DANGER";
}

/**
 * Core calculation function for a single subject.
 */
export function calculateSubjectAttendance(
  input: SubjectInput,
  scheduledHeldSoFar: number,
  remainingTotal: number,
  remainingUntilPlanDate: number,
  weeksRemaining: number = 9
): SubjectCalculation {
  let held_so_far = scheduledHeldSoFar;
  let attended_so_far = 0;

  if (input.mode === "COUNTS") {
    held_so_far = input.held !== undefined ? Math.max(0, Math.floor(input.held)) : scheduledHeldSoFar;
    attended_so_far = input.attended !== undefined ? Math.min(held_so_far, Math.max(0, Math.floor(input.attended))) : 0;
  } else {
    // Percentage mode
    const pct = input.percentage !== undefined ? Math.max(0, Math.min(100, input.percentage)) : 0;
    attended_so_far = Math.round((pct / 100) * held_so_far);
  }

  const current_percentage = held_so_far > 0 ? (attended_so_far / held_so_far) * 100 : 100;
  const total_final = held_so_far + remainingTotal;

  const must_attend_75 = calculateRequiredForThreshold(THRESHOLD_DETENTION, total_final, attended_so_far);
  const must_attend_90 = calculateRequiredForThreshold(THRESHOLD_TARGET, total_final, attended_so_far);

  const can_bunk_75 = calculateCanBunkForThreshold(remainingTotal, must_attend_75);
  const can_bunk_90 = calculateCanBunkForThreshold(remainingTotal, must_attend_90);

  const max_possible_attended = attended_so_far + remainingTotal;
  const max_possible_percentage = total_final > 0 ? (max_possible_attended / total_final) * 100 : 100;

  const status = determineStatus(current_percentage, must_attend_75, remainingTotal, can_bunk_90);

  // Future skip planning
  const planned_skips = Math.min(remainingUntilPlanDate, Math.max(0, input.plannedSkips || 0));
  // If user bunks planned_skips, they can at most attend (remainingTotal - planned_skips)
  const projected_attended_with_skips = attended_so_far + (remainingTotal - planned_skips);
  const projected_percentage_with_skips = total_final > 0 ? (projected_attended_with_skips / total_final) * 100 : 100;
  const plan_breaks_75 = projected_percentage_with_skips < 75.0;

  // Recovery plan targets per week
  const safeWeeks = Math.max(1, weeksRemaining);
  const weekly_target_75 = Math.ceil(must_attend_75 / safeWeeks);
  const weekly_target_90 = Math.ceil(must_attend_90 / safeWeeks);

  return {
    code: input.code,
    name: input.name,
    type: input.type,
    mode: input.mode,
    held_so_far,
    attended_so_far,
    current_percentage: Number(current_percentage.toFixed(2)),
    remaining_total: remainingTotal,
    remaining_until_plan_date: remainingUntilPlanDate,
    total_final,
    must_attend_75,
    must_attend_90,
    can_bunk_75,
    can_bunk_90,
    status,
    max_possible_percentage: Number(max_possible_percentage.toFixed(2)),
    planned_skips,
    projected_attended_with_skips,
    projected_percentage_with_skips: Number(projected_percentage_with_skips.toFixed(2)),
    plan_breaks_75,
    weekly_target_75,
    weekly_target_90,
  };
}

/**
 * Calculates aggregate stats across all subjects.
 */
export function calculateOverallAttendance(
  subjects: SubjectCalculation[]
): OverallCalculation {
  if (subjects.length === 0) {
    return {
      total_held: 0,
      total_attended: 0,
      current_percentage: 100,
      total_remaining: 0,
      total_final: 0,
      must_attend_75: 0,
      must_attend_90: 0,
      can_bunk_75: 0,
      can_bunk_90: 0,
      max_possible_percentage: 100,
      status: "SAFE_90",
      has_irreversible_detention: false,
      irreversible_subjects: [],
    };
  }

  const total_held = subjects.reduce((sum, s) => sum + s.held_so_far, 0);
  const total_attended = subjects.reduce((sum, s) => sum + s.attended_so_far, 0);
  const total_remaining = subjects.reduce((sum, s) => sum + s.remaining_total, 0);
  const total_final = total_held + total_remaining;

  const current_percentage = total_held > 0 ? (total_attended / total_held) * 100 : 100;
  const max_possible_attended = total_attended + total_remaining;
  const max_possible_percentage = total_final > 0 ? (max_possible_attended / total_final) * 100 : 100;

  const must_attend_75 = calculateRequiredForThreshold(THRESHOLD_DETENTION, total_final, total_attended);
  const must_attend_90 = calculateRequiredForThreshold(THRESHOLD_TARGET, total_final, total_attended);

  const can_bunk_75 = calculateCanBunkForThreshold(total_remaining, must_attend_75);
  const can_bunk_90 = calculateCanBunkForThreshold(total_remaining, must_attend_90);

  const irreversible_subjects = subjects.filter((s) => s.status === "IRREVERSIBLE");
  const has_irreversible_detention = irreversible_subjects.length > 0 || must_attend_75 > total_remaining;

  let status: AttendanceStatus = "SAFE_75";
  if (has_irreversible_detention) {
    status = "IRREVERSIBLE";
  } else if (current_percentage >= 90 && can_bunk_90 > 0) {
    status = "SAFE_90";
  } else if (current_percentage >= 75) {
    status = "SAFE_75";
  } else {
    status = "DANGER";
  }

  return {
    total_held,
    total_attended,
    current_percentage: Number(current_percentage.toFixed(2)),
    total_remaining,
    total_final,
    must_attend_75,
    must_attend_90,
    can_bunk_75,
    can_bunk_90,
    max_possible_percentage: Number(max_possible_percentage.toFixed(2)),
    status,
    has_irreversible_detention,
    irreversible_subjects,
  };
}
