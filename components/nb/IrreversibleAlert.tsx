"use client";

import React, { useState, useEffect } from "react";
import { SubjectCalculation } from "@/lib/engine";
import {
  AlertTriangle,
  X,
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
  Stethoscope,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NBButton } from "./NBButton";

export interface IrreversibleAlertProps {
  irreversibleSubjects: SubjectCalculation[];
}

export const IrreversibleAlert: React.FC<IrreversibleAlertProps> = ({
  irreversibleSubjects,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  if (irreversibleSubjects.length === 0) return null;

  const handleGoToSubject = (subjectCode: string) => {
    setIsModalOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`subject-${subjectCode}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-nb-yellow");
        setTimeout(() => el.classList.remove("ring-4", "ring-nb-yellow"), 2500);
      }
    }, 100);
  };

  return (
    <>
      {/* 1. Full-Width Persistent Banner pinned above results */}
      <div className="w-full hazard-stripes border-[4px] border-nb-ink p-3 sm:p-5 shadow-[6px_6px_0px_#0A0A0A] mb-8">
        <div className="bg-nb-ink text-white p-4 border-[3px] border-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nb-yellow border-2 border-nb-ink flex items-center justify-center text-nb-ink font-black text-xl flex-shrink-0">
                ⚠
              </div>
              <div>
                <h3 className="font-heading uppercase text-base sm:text-lg font-black text-nb-yellow tracking-wider">
                  ATTENDANCE RECOVERY NOTICE • ACTION PROTOCOL
                </h3>
                <p className="font-mono text-xs text-zinc-300 mt-0.5">
                  Regular class attendance alone is near margin for{" "}
                  <span className="text-nb-yellow font-bold underline">
                    {irreversibleSubjects.length} course(s)
                  </span>
                  . Institutional support pathways (Medical Condonation &amp; OD Credits) are available.
                </p>
              </div>
            </div>

            {/* Banner Action Toggles */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsModalOpen((prev) => !prev)}
                className="font-heading uppercase text-xs font-bold px-3 py-1.5 bg-nb-yellow text-nb-ink border-2 border-nb-ink shadow-[2px_2px_0px_#FFFFFF] hover:bg-yellow-400 flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Toggle Recovery Action Modal"
              >
                <span>{isModalOpen ? "Close Modal ✕" : "View Recovery Plan ▾"}</span>
              </button>

              <button
                onClick={() => setIsBannerCollapsed((prev) => !prev)}
                className="font-heading uppercase text-xs font-bold px-2 py-1.5 bg-zinc-800 text-white border-2 border-white hover:bg-zinc-700 flex items-center gap-1"
                title={isBannerCollapsed ? "Expand Banner" : "Minimize Banner"}
              >
                {isBannerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Subject Grid (collapsible) */}
          {!isBannerCollapsed && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-zinc-700">
              {irreversibleSubjects.map((sub) => (
                <div
                  key={sub.code}
                  className="bg-zinc-900 border-2 border-nb-yellow p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-black text-xs text-white truncate">
                      {sub.code}: {sub.name}
                    </span>
                    <span className="font-mono text-[10px] bg-nb-yellow text-nb-ink px-2 py-0.5 font-black uppercase flex-shrink-0">
                      Condonation / OD Track
                    </span>
                  </div>
                  <div className="font-mono text-xs text-zinc-300 mt-2">
                    Attended: <strong>{sub.attended_so_far} / {sub.held_so_far}</strong> ({sub.current_percentage}%) • Scheduled Remaining: <strong>{sub.remaining_total}</strong>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                    <span className="font-mono text-[11px] text-yellow-300 font-bold">
                      Class Max: {sub.max_possible_percentage}% • Eligible for Condonation
                    </span>
                    <button
                      onClick={() => handleGoToSubject(sub.code)}
                      className="font-mono text-[11px] font-bold text-nb-yellow hover:text-white underline flex items-center gap-1"
                    >
                      Recalibrate {sub.code} <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Modal: Constructive Recovery Pathways */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl bg-white border-[5px] border-nb-ink shadow-[10px_10px_0px_#0A0A0A] max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-nb-yellow p-3.5 border-b-[4px] border-nb-ink flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-2 py-1 bg-white text-nb-ink border-2 border-nb-ink font-heading font-black text-xs uppercase shadow-[2px_2px_0px_#0A0A0A] hover:bg-zinc-100 flex items-center gap-1"
                  aria-label="Go Back to Dashboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go Back</span>
                </button>
                <h2 className="font-heading font-black text-sm uppercase text-nb-ink tracking-wider">
                  Attendance Recovery &amp; Support Protocol
                </h2>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-nb-red text-white border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center font-black text-sm hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                aria-label="Close dialog"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Supportive Strategy Introduction */}
              <div className="bg-amber-50 border-[3px] border-amber-600 p-4 space-y-2">
                <div className="flex items-center gap-2 font-heading uppercase text-sm font-black text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Constructive Institutional Solutions Available</span>
                </div>
                <p className="font-mono text-xs text-amber-950 leading-relaxed">
                  While ordinary period attendance is mathematically tight, SRM University regulations provide official, well-defined procedures so dedicated students can maintain full examination eligibility.
                </p>
              </div>

              {/* 4 Actionable Recovery Options */}
              <div className="space-y-3">
                <h4 className="font-heading uppercase text-xs font-black tracking-widest text-zinc-800">
                  OFFICIAL SRM RECOVERY PATHWAYS:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Pathway 1: Medical Condonation */}
                  <div className="bg-white border-[3px] border-nb-ink p-3.5 shadow-[3px_3px_0px_#0A0A0A] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <strong className="font-heading text-xs uppercase font-black">
                        1. Medical Condonation
                      </strong>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-700 leading-normal">
                      Students in the <strong>65% to 74.9%</strong> bracket can submit medical certificates approved by SRM Hospital to receive full exam eligibility.
                    </p>
                  </div>

                  {/* Pathway 2: On-Duty (OD) Credits */}
                  <div className="bg-white border-[3px] border-nb-ink p-3.5 shadow-[3px_3px_0px_#0A0A0A] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <strong className="font-heading text-xs uppercase font-black">
                        2. On-Duty (OD) Claims
                      </strong>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-700 leading-normal">
                      Credited attendance for University Technical Symposiums, Hackathons, Sports, NSS, or Department projects will boost your total.
                    </p>
                  </div>

                  {/* Pathway 3: Compensatory Sessions */}
                  <div className="bg-white border-[3px] border-nb-ink p-3.5 shadow-[3px_3px_0px_#0A0A0A] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <strong className="font-heading text-xs uppercase font-black">
                        3. Compensatory Classes
                      </strong>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-700 leading-normal">
                      Connect with your Course Coordinator for weekend makeup lab sessions or remedial practical hours.
                    </p>
                  </div>

                  {/* Pathway 4: Portal Audit */}
                  <div className="bg-white border-[3px] border-nb-ink p-3.5 shadow-[3px_3px_0px_#0A0A0A] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <strong className="font-heading text-xs uppercase font-black">
                        4. Portal Input Check
                      </strong>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-700 leading-normal">
                      Audit past entries with your Faculty Advisor. Inadvertent absence markings in earlier cycles can be officially adjusted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown with direct action buttons */}
              <div className="space-y-3 pt-2">
                <h4 className="font-heading uppercase text-xs font-black tracking-widest text-zinc-800">
                  RECOVERY TARGETS PER COURSE:
                </h4>
                {irreversibleSubjects.map((sub) => (
                  <div
                    key={sub.code}
                    className="border-[3px] border-nb-ink bg-zinc-50 p-3.5 space-y-2 shadow-[3px_3px_0px_#0A0A0A]"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-heading font-black text-sm truncate">
                        {sub.code} — {sub.name}
                      </span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 uppercase flex-shrink-0">
                        {sub.type} • Condonation Eligible
                      </span>
                    </div>

                    <div className="font-mono text-xs text-zinc-700">
                      Current Standing: <strong>{sub.attended_so_far} / {sub.held_so_far}</strong> ({sub.current_percentage}%) • Remaining Classes: <strong>{sub.remaining_total}</strong>
                    </div>

                    <div className="font-mono text-xs text-zinc-800 bg-amber-50 p-2 border border-amber-300">
                      Target Protocol: Max class percentage reaches <strong>{sub.max_possible_percentage}%</strong>. Applying <strong>{Math.max(1, sub.must_attend_75 - sub.remaining_total)} OD / Condonation credit(s)</strong> secures full exam clearance.
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleGoToSubject(sub.code)}
                        className="px-3 py-1.5 bg-nb-yellow text-nb-ink border-2 border-nb-ink font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#0A0A0A] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
                      >
                        <span>Update / Recalibrate {sub.code}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-zinc-100 border-t-[3px] border-nb-ink flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 font-mono font-bold text-xs uppercase border-2 border-nb-ink bg-white text-zinc-700 hover:bg-zinc-200"
              >
                ← Back to Dashboard
              </button>

              <NBButton
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Got It • Proceed with Recovery Pathways
              </NBButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
