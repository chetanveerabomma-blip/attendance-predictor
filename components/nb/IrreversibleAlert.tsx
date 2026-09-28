"use client";

import React, { useState } from "react";
import { SubjectCalculation } from "@/lib/engine";
import { AlertOctagon, AlertTriangle } from "lucide-react";
import { NBButton } from "./NBButton";

export interface IrreversibleAlertProps {
  irreversibleSubjects: SubjectCalculation[];
}

export const IrreversibleAlert: React.FC<IrreversibleAlertProps> = ({
  irreversibleSubjects,
}) => {
  const [modalDismissed, setModalDismissed] = useState(false);

  if (irreversibleSubjects.length === 0) return null;

  return (
    <>
      {/* 1. Full-Width Persistent Banner pinned above results */}
      <div className="w-full hazard-stripes border-[4px] border-nb-ink p-4 sm:p-5 shadow-[6px_6px_0px_#0A0A0A] mb-8">
        <div className="bg-nb-ink text-white p-4 border-[3px] border-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-10 h-10 text-nb-red animate-pulse flex-shrink-0" />
              <div>
                <h3 className="font-heading uppercase text-lg sm:text-xl font-black text-nb-yellow tracking-wider animate-nb-shake">
                  ⚠ IRREVERSIBLE DETENTION ALERT ⚠
                </h3>
                <p className="font-mono text-xs text-zinc-300 mt-1">
                  Even attending 100% of remaining scheduled classes cannot breach the 75% statutory requirement in{" "}
                  <span className="text-nb-red font-bold underline">
                    {irreversibleSubjects.length} subject(s)
                  </span>
                  .
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalDismissed(false)}
              className="font-heading uppercase text-xs font-bold px-3 py-1.5 bg-nb-yellow text-nb-ink border-2 border-nb-ink shadow-[2px_2px_0px_#FFFFFF] hover:bg-yellow-400 whitespace-nowrap"
            >
              View Breakdown
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {irreversibleSubjects.map((sub) => (
              <div
                key={sub.code}
                className="bg-zinc-900 border-2 border-nb-red p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-xs text-white">
                    {sub.code}: {sub.name}
                  </span>
                  <span className="font-mono text-[10px] bg-nb-red text-white px-2 py-0.5 font-black uppercase">
                    Detained
                  </span>
                </div>
                <div className="font-mono text-xs text-red-400 mt-2">
                  Attended: <strong>{sub.attended_so_far} / {sub.held_so_far}</strong> ({sub.current_percentage}%) • Remaining: <strong>{sub.remaining_total}</strong>
                </div>
                <div className="font-mono text-xs text-yellow-300 font-bold mt-1">
                  Math: Max possible = {sub.max_possible_percentage}% &lt; 75.0%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Modal on Load (until dismissed) */}
      {!modalDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-in fade-in">
          <div className="w-full max-w-xl bg-white border-[5px] border-nb-ink shadow-[10px_10px_0px_#0A0A0A] overflow-hidden">
            {/* Hazard Stripe Header */}
            <div className="hazard-stripes p-4 border-b-[4px] border-nb-ink text-center">
              <h2 className="inline-block bg-nb-ink text-white font-heading font-black text-lg sm:text-xl tracking-wider px-4 py-1.5 border-[3px] border-white animate-nb-shake">
                ⚠ IRREVERSIBLE DETENTION ⚠
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-red-100 border-[3px] border-nb-red p-4">
                <AlertTriangle className="w-8 h-8 text-nb-red flex-shrink-0 mt-0.5" />
                <div className="text-xs font-mono leading-relaxed text-nb-ink">
                  <strong className="font-heading uppercase block text-sm font-black text-nb-red mb-1">
                    Statutory Alert: Action Required
                  </strong>
                  Based on SRM Trichy regulations, an attendance record below 75% leads to automatic withholding of semester examination hall tickets.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-heading uppercase text-xs font-black tracking-widest text-zinc-700">
                  Affected Course(s):
                </h4>
                {irreversibleSubjects.map((sub) => (
                  <div
                    key={sub.code}
                    className="border-[3px] border-nb-ink bg-zinc-50 p-3 space-y-1 shadow-[3px_3px_0px_#0A0A0A]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-heading font-black text-sm">
                        {sub.code} - {sub.name}
                      </span>
                      <span className="bg-nb-red text-white text-[10px] font-mono font-bold px-1.5 py-0.5">
                        {sub.type}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-zinc-700">
                      Current: {sub.attended_so_far} / {sub.held_so_far} ({sub.current_percentage}%)
                    </div>
                    <div className="font-mono text-xs font-bold text-nb-red bg-red-50 p-2 border border-nb-red">
                      Math: Max Possible Attendance ={" "}
                      <strong>{sub.max_possible_percentage}%</strong> (requires {sub.must_attend_75}, but only {sub.remaining_total} classes remain in semester).
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border-[2px] border-nb-ink p-3 text-[11px] font-mono text-zinc-700">
                <strong>Next Step:</strong> Consult your HOD / Faculty Advisor immediately regarding condonation or on-duty approval provisions.
              </div>

              <div className="flex justify-end pt-2">
                <NBButton
                  variant="primary"
                  size="md"
                  onClick={() => setModalDismissed(true)}
                  className="w-full sm:w-auto"
                >
                  I Understand • View Dashboard
                </NBButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
