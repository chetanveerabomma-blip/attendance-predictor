import { z } from "zod";

export const PeriodSlotSchema = z.object({
  period: z.number().int().positive(),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid start time format HH:MM"),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid end time format HH:MM"),
  subjectCode: z.string().min(1),
});

export const SubjectSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["THEORY", "LAB"]),
  periodsPerSession: z.number().int().positive().default(1),
});

export const SectionMetadataSchema = z.object({
  id: z.string().min(1),
  year: z.number().int().min(1).max(4),
  branch: z.enum(["ECE", "ECE-DS", "BME"]),
  label: z.string().min(1),
});

export const DayOrderOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  followsDay: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT"]),
});

export const TimetableFileSchema = z.object({
  section: SectionMetadataSchema,
  subjects: z.array(SubjectSchema).min(1),
  week: z.record(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT"]), z.array(PeriodSlotSchema)),
  dayOrderOverrides: z.array(DayOrderOverrideSchema).optional().default([]),
});

export const HolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  name: z.string().min(1),
});

export const HolidayListSchema = z.array(HolidaySchema);
