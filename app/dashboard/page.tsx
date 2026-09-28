"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useAttendanceStore } from "@/lib/store";
import {
  calculateSubjectAttendance,
  calculateOverallAttendance,
  SubjectCalculation,
  SubjectInput,
  SEMESTER_START,
  SEMESTER_END,
} from "@/lib/engine";
import { countClassesBetweenDates, getWorkingDaysCount, Holiday } from "@/lib/dates";
import { KPIStrip } from "@/components/dashboard/KPIStrip";
import { SubjectCard } from "@/components/dashboard/SubjectCard";
import { AttendanceProjectionChart } from "@/components/dashboard/AttendanceProjectionChart";
import { RecoveryPlanView } from "@/components/dashboard/RecoveryPlanView";
import { FutureSkipPlanner } from "@/components/dashboard/FutureSkipPlanner";
import { SnapshotsView } from "@/components/dashboard/SnapshotsView";
import { IrreversibleAlert } from "@/components/nb/IrreversibleAlert";
import { NBTabs } from "@/components/nb/NBTabs";
import { NBButton } from "@/components/nb/NBButton";
import { NBSticker } from "@/components/nb/NBSticker";
import { NBBadge } from "@/components/nb/NBBadge";
import {
  Calendar,
  Lock,
  RefreshCw,
  Sliders,
  Filter,
  Layers,
  Sparkles,
  Printer,
  SlidersHorizontal,
} from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";

export default function DashboardPage() {
  const { data: session } = useSession();
  const {
    sectionId,
    setSectionId,
    todayDate,
    planningDate,
    setPlanningDate,
    includeHolidays,
    setIncludeHolidays,
    todayClassesDone,
    setTodayClassesDone,
    labCountingMode,
    setLabCountingMode,
    subjectInputs,
    setSubjectInput,
    resetInputs,
  } = useAttendanceStore();

  const [timetablesData, setTimetablesData] = useState<Record<string, any>>({});
  const [holidaysData, setHolidaysData] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cards");

  // Load section timetable data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/sections");
        if (res.ok) {
          const data = await res.json();
          setTimetablesData(data.timetables || {});
          setHolidaysData(data.holidays || []);
        }
      } catch (err) {
        console.error("Failed to load sections API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update section from session if user has a configured section
  useEffect(() => {
    if (session?.user && (session.user as any).sectionId && !sectionId) {
      setSectionId((session.user as any).sectionId);
    }
  }, [session, sectionId, setSectionId]);

  // Current timetable object
  const currentTimetable = timetablesData[sectionId] || null;

  // Active holidays list
  const activeHolidays = includeHolidays ? holidaysData : [];

  // Subject Type Map for Lab Block calculations
  const subjectTypeMap = useMemo(() => {
    const map: Record<string, "THEORY" | "LAB"> = {};
    if (currentTimetable?.subjects) {
      for (const s of currentTimetable.subjects) {
        map[s.code] = s.type;
      }
    }
    return map;
  }, [currentTimetable]);

  // Classes held so far: from SEMESTER_START (2026-08-29) up to yesterday (or today if todayClassesDone is true)
  const scheduledHeldCounts = useMemo(() => {
    if (!currentTimetable) return {};
    const effectiveEndDate = todayClassesDone ? todayDate : "2026-09-27"; // yesterday relative to 2026-09-28
    return countClassesBetweenDates(
      SEMESTER_START,
      effectiveEndDate,
      currentTimetable.week || {},
      activeHolidays,
      currentTimetable.dayOrderOverrides || [],
      labCountingMode,
      subjectTypeMap
    );
  }, [currentTimetable, todayClassesDone, todayDate, activeHolidays, labCountingMode, subjectTypeMap]);

  // Remaining classes from tomorrow (or today if not done) until semester end
  const remainingTotalCounts = useMemo(() => {
    if (!currentTimetable) return {};
    const effectiveStartDate = todayClassesDone ? "2026-09-29" : todayDate;
    return countClassesBetweenDates(
      effectiveStartDate,
      SEMESTER_END,
      currentTimetable.week || {},
      activeHolidays,
      currentTimetable.dayOrderOverrides || [],
      labCountingMode,
      subjectTypeMap
    );
  }, [currentTimetable, todayClassesDone, todayDate, activeHolidays, labCountingMode, subjectTypeMap]);

  // Remaining until planningDate
  const remainingUntilPlanCounts = useMemo(() => {
    if (!currentTimetable) return {};
    const effectiveStartDate = todayClassesDone ? "2026-09-29" : todayDate;
    return countClassesBetweenDates(
      effectiveStartDate,
      planningDate,
      currentTimetable.week || {},
      activeHolidays,
      currentTimetable.dayOrderOverrides || [],
      labCountingMode,
      subjectTypeMap
    );
  }, [currentTimetable, todayClassesDone, todayDate, planningDate, activeHolidays, labCountingMode, subjectTypeMap]);

  // Calendar metrics
  const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(SEMESTER_END), parseISO(todayDate)));
  const workingDaysLeft = getWorkingDaysCount(todayDate, SEMESTER_END, activeHolidays);
  const weeksRemaining = Math.max(1, Math.ceil(daysLeft / 7));

  // Run calculation engine for all subjects
  const subjectCalculations: SubjectCalculation[] = useMemo(() => {
    if (!currentTimetable?.subjects) return [];

    return currentTimetable.subjects.map((sub: any) => {
      const storedInput: Partial<SubjectInput> = subjectInputs[sub.code] || {};
      const fullInput: SubjectInput = {
        code: sub.code,
        name: sub.name,
        type: sub.type,
        mode: storedInput.mode || "COUNTS",
        percentage: storedInput.percentage,
        attended: storedInput.attended,
        held: storedInput.held,
        plannedSkips: storedInput.plannedSkips || 0,
      };

      const scheduledHeld = scheduledHeldCounts[sub.code] || 0;
      const remainingTotal = remainingTotalCounts[sub.code] || 0;
      const remainingPlan = remainingUntilPlanCounts[sub.code] || 0;

      return calculateSubjectAttendance(
        fullInput,
        scheduledHeld,
        remainingTotal,
        remainingPlan,
        weeksRemaining
      );
    });
  }, [
    currentTimetable,
    subjectInputs,
    scheduledHeldCounts,
    remainingTotalCounts,
    remainingUntilPlanCounts,
    weeksRemaining,
  ]);

  // Overall aggregate calculation
  const overallCalc = useMemo(() => {
    return calculateOverallAttendance(subjectCalculations);
  }, [subjectCalculations]);

  const handleUpdatePlannedSkip = (code: string, skips: number) => {
    setSubjectInput(code, { plannedSkips: skips });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-base font-bold">
        Loading timetable models and curriculum engines...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Controls Bar */}
      <div className="bg-white border-[3px] border-nb-ink p-5 shadow-[6px_6px_0px_#0A0A0A] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[2px] border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading uppercase font-black text-xs px-2.5 py-0.5 bg-nb-yellow border border-nb-ink">
                ACTIVE SEMESTER
              </span>
              <span className="font-mono text-xs text-zinc-500 font-bold">
                29 AUG 2026 – 29 NOV 2026
              </span>
            </div>
            <h1 className="font-heading uppercase font-black text-2xl sm:text-3xl text-nb-ink">
              ATTENDANCE PREDICTOR TERMINAL
            </h1>
            <p className="font-mono text-xs text-zinc-600">
              Logged in as: <strong className="text-nb-ink">{session?.user?.name || "Student"}</strong> ({ (session?.user as any)?.regNo || "RA2611003010042"})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NBButton size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print Report
            </NBButton>
            <NBButton size="sm" variant="outline" onClick={resetInputs}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset Inputs
            </NBButton>
          </div>
        </div>

        {/* Global Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* 1. Section Dropdown */}
          <div className="space-y-1">
            <label className="block font-heading uppercase text-xs font-black text-zinc-700">
              Section Timetable:
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs border-2 border-nb-ink bg-white font-bold shadow-[2px_2px_0px_#0A0A0A] focus:outline-none"
            >
              <optgroup label="Year I">
                <option value="1-ece">1-ECE (Electronics &amp; Comm)</option>
                <option value="1-bme">1-BME (Biomedical)</option>
              </optgroup>
              <optgroup label="Year II">
                <option value="2-ece-a">2-ECE-A (Sec A)</option>
                <option value="2-ece-b">2-ECE-B (Sec B)</option>
                <option value="2-bme">2-BME (Biomedical)</option>
              </optgroup>
              <optgroup label="Year III">
                <option value="3-ece">3-ECE (General)</option>
                <option value="3-ece-ds">3-ECE-DS (Data Science)</option>
                <option value="3-bme">3-BME (Biomedical)</option>
              </optgroup>
              <optgroup label="Year IV">
                <option value="4-ece">4-ECE (Final Year)</option>
                <option value="4-bme">4-BME (Final Year)</option>
              </optgroup>
            </select>
          </div>

          {/* 2. Today's Date Locked Chip */}
          <div className="space-y-1">
            <label className="block font-heading uppercase text-xs font-black text-zinc-700">
              Today&apos;s Date (IST):
            </label>
            <div className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border-2 border-nb-ink bg-zinc-100 shadow-[2px_2px_0px_#0A0A0A] font-bold text-zinc-700">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{todayDate}</span>
              <span className="text-[10px] bg-nb-yellow px-1 border border-nb-ink ml-auto">
                LOCKED
              </span>
            </div>
          </div>

          {/* 3. Planning Date Picker */}
          <div className="space-y-1">
            <label className="block font-heading uppercase text-xs font-black text-zinc-700">
              Plan Until:
            </label>
            <input
              type="date"
              min={todayDate}
              max={SEMESTER_END}
              value={planningDate}
              onChange={(e) => setPlanningDate(e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs border-2 border-nb-ink bg-white font-bold shadow-[2px_2px_0px_#0A0A0A] focus:outline-none"
            />
          </div>

          {/* 4. Holiday & Today Done Toggles */}
          <div className="space-y-1.5 flex flex-col justify-center font-mono text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHolidays}
                onChange={(e) => setIncludeHolidays(e.target.checked)}
                className="w-4 h-4 border-2 border-nb-ink text-nb-yellow rounded-none"
              />
              <span className="font-bold text-zinc-800">Exclude Holidays</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={todayClassesDone}
                onChange={(e) => setTodayClassesDone(e.target.checked)}
                className="w-4 h-4 border-2 border-nb-ink text-nb-yellow rounded-none"
              />
              <span className="font-bold text-zinc-800">Today&apos;s done</span>
            </label>
          </div>

          {/* 5. Lab Block Configuration */}
          <div className="space-y-1">
            <label className="block font-heading uppercase text-xs font-black text-zinc-700">
              Lab Count Policy:
            </label>
            <div className="flex border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A]">
              <button
                onClick={() => setLabCountingMode("PERIODS")}
                className={`flex-1 py-1 text-[11px] font-mono font-bold uppercase transition-colors ${
                  labCountingMode === "PERIODS"
                    ? "bg-nb-yellow text-nb-ink"
                    : "bg-white text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                1 Period = 1
              </button>
              <button
                onClick={() => setLabCountingMode("SESSION")}
                className={`flex-1 py-1 text-[11px] font-mono font-bold uppercase border-l-2 border-nb-ink transition-colors ${
                  labCountingMode === "SESSION"
                    ? "bg-nb-yellow text-nb-ink"
                    : "bg-white text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                1 Lab = 1 Class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. IRREVERSIBLE DETENTION ALERT (Pins above results + Modal on load) */}
      <IrreversibleAlert irreversibleSubjects={overallCalc.irreversible_subjects} />

      {/* 3. Top KPI Cards Strip */}
      <KPIStrip
        overall={overallCalc}
        daysLeft={daysLeft}
        workingDaysLeft={workingDaysLeft}
      />

      {/* 4. Tab Navigation */}
      <div className="space-y-6">
        <NBTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "cards", label: "Subject Cards", badge: subjectCalculations.length },
            { id: "recovery", label: "Weekly Recovery Plan" },
            { id: "chart", label: "Trajectory Forecast Chart" },
            { id: "future", label: "Future Skip Simulator" },
            { id: "snapshots", label: "Snapshots & History" },
          ]}
        />

        {/* Tab 1: Subject Cards Grid */}
        {activeTab === "cards" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectCalculations.map((calc) => (
                <SubjectCard
                  key={calc.code}
                  calc={calc}
                  input={subjectInputs[calc.code] || {}}
                  onInputChange={(updates) => setSubjectInput(calc.code, updates)}
                  maxScheduledHeld={scheduledHeldCounts[calc.code] || 35}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Recovery Plan */}
        {activeTab === "recovery" && (
          <RecoveryPlanView
            subjects={subjectCalculations}
            weeksRemaining={weeksRemaining}
          />
        )}

        {/* Tab 3: Trajectory Line Chart */}
        {activeTab === "chart" && (
          <div className="space-y-6">
            <AttendanceProjectionChart subjects={subjectCalculations} />
          </div>
        )}

        {/* Tab 4: Future Skip Simulator */}
        {activeTab === "future" && (
          <FutureSkipPlanner
            subjects={subjectCalculations}
            onUpdateSkip={handleUpdatePlannedSkip}
            planningDate={planningDate}
          />
        )}

        {/* Tab 5: Snapshots View */}
        {activeTab === "snapshots" && (
          <SnapshotsView
            overall={overallCalc}
            subjects={subjectCalculations}
            sectionId={sectionId}
            planningDate={planningDate}
          />
        )}
      </div>
    </div>
  );
}
