import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-nb-ink text-white border-t-[4px] border-nb-ink mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-nb-yellow border-[2px] border-white flex items-center justify-center font-heading font-black text-nb-ink text-lg">
                AP
              </div>
              <span className="font-heading font-black text-lg tracking-wider">
                ATTENDANCE PREDICTOR
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-300 max-w-md leading-relaxed">
              Official analytical attendance forecasting utility developed for SRM Trichy,
              School of Electronics and Electrical Engineering (EEE). Autumn Semester 2026.
            </p>
            <div className="bg-yellow-400 text-nb-ink font-mono text-[11px] font-black px-3 py-1.5 inline-block border-2 border-white shadow-[2px_2px_0px_#FFFFFF]">
              ACADEMIC CYCLE: 29 AUG 2026 – 29 NOV 2026
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-heading uppercase text-xs font-black tracking-widest text-nb-yellow">
              Quick Portals
            </h4>
            <ul className="font-mono text-xs space-y-1.5 text-zinc-300">
              <li>
                <Link href="/dashboard" className="hover:text-nb-yellow underline">
                  Attendance Calculator
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-nb-yellow underline">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-nb-yellow underline">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-nb-yellow underline">
                  Faculty / Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-heading uppercase text-xs font-black tracking-widest text-nb-yellow">
              Thresholds & Rules
            </h4>
            <ul className="font-mono text-xs space-y-1 text-zinc-300">
              <li>• Detention Barrier: &lt; 75%</li>
              <li>• Condonation Zone: 65% – 74.9%</li>
              <li>• Deanery Target: ≥ 90%</li>
              <li>• Sunday & Holiday Exclusion Active</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="bg-zinc-900 border-[2px] border-zinc-700 p-4 rounded-none mb-8">
          <p className="font-mono text-[11px] text-zinc-400 uppercase leading-relaxed text-center">
            <strong className="text-nb-yellow">Official Institutional Disclaimer:</strong> Calculations and projected bunk limits provided by this portal are mathematical forecasts based on scheduled periods, designated holidays, and student inputs. The official Controller of Examinations portal and Deanery Attendance Register serve as the sole authoritative records for hall ticket eligibility.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-zinc-500 border-t border-zinc-800 pt-6">
          <div>© 2026 SRM Trichy • School of EEE. All Rights Reserved.</div>
          <div className="mt-2 sm:mt-0 font-bold text-zinc-400">
            Engineered with strict Neobrutalism Standards
          </div>
        </div>
      </div>
    </footer>
  );
};
