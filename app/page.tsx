"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NBButton } from "@/components/nb/NBButton";
import { NBCard } from "@/components/nb/NBCard";
import { NBSticker } from "@/components/nb/NBSticker";
import { NBBadge } from "@/components/nb/NBBadge";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Layers,
  Percent,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does this predictor compute remaining classes?",
      a: "The engine parses your specific section's official timetable day-by-day between today and 29 Nov 2026, systematically subtracting declared university holidays (such as Ayudha Puja and Deepavali) and non-instructional Sundays.",
    },
    {
      q: "What is the difference between Safe-to-Bunk and Must-Attend?",
      a: "Must-Attend is the absolute minimum number of remaining sessions you must attend to stay above the 75% detention cutoff. Safe-to-Bunk represents the surplus classes you can skip without falling below that threshold.",
    },
    {
      q: "How are lab classes counted?",
      a: "By default, our system counts each timetable period individually. However, you can toggle 'Lab Block Mode' in the calculator to treat multi-period lab sessions as 1 single attendance event, matching your department's specific register procedure.",
    },
    {
      q: "What causes an 'IRREVERSIBLE DETENTION' alert?",
      a: "When the mathematical classes required to hit 75% exceeds the total number of remaining classes scheduled for the semester, attendance cannot be salvaged through class attendance alone. Immediate faculty advisor consultation is advised.",
    },
    {
      q: "Is this synchronized with the official Controller of Examinations portal?",
      a: "This is a predictive planning companion. You input your current standing from the college portal, and our mathematical model forecasts future margins and recovery milestones.",
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-heading font-black text-xs uppercase px-3 py-1 bg-nb-yellow border-[2px] border-nb-ink shadow-[2px_2px_0px_#0A0A0A]">
                SRM TRICHY • SCHOOL OF EEE
              </span>
              <NBSticker text="AUTUMN 2026" color="pink" rotation="-2deg" />
            </div>

            <h1 className="font-heading uppercase font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-nb-ink leading-[0.95]">
              DON&apos;T GET DETAINED. <br />
              <span className="bg-nb-yellow px-2 inline-block border-[4px] border-nb-ink shadow-[6px_6px_0px_#0A0A0A] -rotate-1 mt-2">
                DO THE MATH.
              </span>
            </h1>

            <p className="font-mono text-sm sm:text-base text-zinc-800 max-w-xl leading-relaxed">
              Official analytical attendance intelligence for ECE, ECE-DS, and BME students.
              Stop guessing how many classes you can skip. Know your exact 75% detention line,
              90% honors target, and weekly recovery quotas in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard">
                <NBButton size="lg" variant="primary">
                  Attendance
                </NBButton>
              </Link>
              <Link href="/grid">
                <NBButton size="lg" variant="outline">
                  Floor System
                </NBButton>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 font-mono text-xs text-zinc-600 font-bold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                10 Verified Timetables
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                75% &amp; 90% Rules
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-nb-red" />
                Ends 29 Nov 2026
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup Card */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-4 -right-4 z-20">
              <NBSticker text="OFFICIAL" color="yellow" rotation="3deg" />
            </div>

            <NBCard variant="white" shadowSize="lg" className="p-6 relative space-y-5">
              <div className="flex items-center justify-between border-b-[3px] border-nb-ink pb-3">
                <div>
                  <div className="font-heading uppercase font-black text-sm text-nb-ink">
                    SAMPLE FORECAST: SEC 2-ECE-A
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 font-bold">
                    TODAY: 28 SEP 2026 • 62 DAYS REMAINING
                  </div>
                </div>
                <NBBadge status="SAFE_75" size="sm" />
              </div>

              {/* Mock Numbers */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-100 p-3 border-[2px] border-nb-ink">
                <div>
                  <div className="font-heading uppercase text-[10px] font-black text-zinc-600">
                    Must Attend (75%)
                  </div>
                  <div className="font-mono text-2xl font-black text-nb-ink mt-0.5">
                    14 CLASSES
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">out of 38 remaining</div>
                </div>

                <div className="border-l-[2px] border-nb-ink pl-3">
                  <div className="font-heading uppercase text-[10px] font-black text-zinc-600">
                    Safe To Skip
                  </div>
                  <div className="font-mono text-2xl font-black text-green-700 mt-0.5">
                    24 CLASSES
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">before hitting 75%</div>
                </div>
              </div>

              {/* Chunky bar simulation */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs font-bold">
                  <span>Circuits &amp; Systems (26ECE201)</span>
                  <span className="text-nb-ink">82.1%</span>
                </div>
                <div className="h-6 w-full bg-zinc-200 border-[2px] border-nb-ink overflow-hidden relative">
                  <div className="h-full bg-nb-yellow border-r-[2px] border-nb-ink" style={{ width: "82.1%" }} />
                  <div className="absolute top-0 bottom-0 w-[2px] bg-nb-ink" style={{ left: "75%" }} />
                  <div className="absolute top-0 bottom-0 w-[2px] bg-nb-ink" style={{ left: "90%" }} />
                </div>
              </div>

              <div className="bg-nb-yellow p-3 border-[2px] border-nb-ink font-mono text-xs font-bold text-nb-ink flex items-center justify-between">
                <span>Weekly Recovery Target:</span>
                <span className="bg-white px-2 py-0.5 border border-nb-ink">2 classes / week</span>
              </div>
            </NBCard>
          </div>
        </div>
      </section>

      {/* 2. LIVE STATS STRIP */}
      <section className="bg-white border-y-[3px] border-nb-ink py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-nb-yellow border-[3px] border-nb-ink flex items-center justify-center font-heading font-black text-lg">
                62
              </div>
              <div>
                <div className="font-heading uppercase font-black text-xs">Calendar Days Left</div>
                <div className="font-mono text-xs text-zinc-600">Until 29 Nov 2026</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-nb-green border-[3px] border-nb-ink flex items-center justify-center font-heading font-black text-lg">
                50
              </div>
              <div>
                <div className="font-heading uppercase font-black text-xs">Total Working Days</div>
                <div className="font-mono text-xs text-zinc-600">Sundays &amp; Holidays Excluded</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-nb-pink border-[3px] border-nb-ink flex items-center justify-center font-heading font-black text-xs text-center font-mono">
                02 OCT
              </div>
              <div>
                <div className="font-heading uppercase font-black text-xs">Next Holiday</div>
                <div className="font-mono text-xs text-zinc-600">Gandhi Jayanthi (Friday)</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-nb-blue text-white border-[3px] border-nb-ink flex items-center justify-center font-heading font-black text-lg">
                75%
              </div>
              <div>
                <div className="font-heading uppercase font-black text-xs">Strict Cutoff</div>
                <div className="font-mono text-xs text-zinc-600">SRM Trichy EEE Standard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="font-heading font-black text-xs uppercase px-3 py-1 bg-nb-yellow border-[2px] border-nb-ink">
            THE DILEMMA
          </span>
          <h2 className="font-heading uppercase font-black text-3xl sm:text-4xl text-nb-ink">
            WHY STUDENTS GET SURPRISED BY DETENTION
          </h2>
          <p className="font-mono text-xs text-zinc-600">
            Standard college software was designed for accounting, not forward planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-nb-red text-white border-[2px] border-nb-ink flex items-center justify-center font-mono font-black text-lg">
              01
            </div>
            <h3 className="font-heading uppercase font-black text-lg text-nb-ink">
              PORTALS SHOW THE PAST, NOT THE FUTURE
            </h3>
            <p className="font-mono text-xs text-zinc-700 leading-relaxed">
              Your official dashboard gives you yesterday&apos;s percentage, but has no clue how many classes remain on the calendar or how skipping tomorrow alters your final eligibility.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-nb-yellow border-[2px] border-nb-ink flex items-center justify-center font-mono font-black text-lg">
              02
            </div>
            <h3 className="font-heading uppercase font-black text-lg text-nb-ink">
              YOU FIND OUT TOO LATE TO FIX IT
            </h3>
            <p className="font-mono text-xs text-zinc-700 leading-relaxed">
              When the official detention list drops three days before university end-semester practicals, the mathematical math is already locked. You cannot attend classes that no longer exist.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-nb-blue text-white border-[2px] border-nb-ink flex items-center justify-center font-mono font-black text-lg">
              03
            </div>
            <h3 className="font-heading uppercase font-black text-lg">
              NO ACTIONABLE RECOVERY STRATEGY
            </h3>
            <p className="font-mono text-xs text-zinc-700 leading-relaxed">
              Being told &quot;attend more&quot; doesn&apos;t help. You need an exact quota: &quot;Attend 3 sessions every week across 5 weeks to hit 75.2% and stay eligible.&quot;
            </p>
          </NBCard>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-nb-yellow border-[4px] border-nb-ink p-8 shadow-[8px_8px_0px_#0A0A0A]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-heading uppercase font-black text-3xl text-nb-ink">
              HOW IT WORKS IN 4 STEPS
            </h2>
            <p className="font-mono text-xs text-zinc-800 font-bold mt-1">
              Zero complicated formulas required. Simple mathematical precision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-[3px] border-nb-ink p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-2">
              <span className="font-mono font-black text-2xl text-nb-red">01</span>
              <h4 className="font-heading uppercase font-black text-sm">Register Account</h4>
              <p className="font-mono text-xs text-zinc-600">
                Log in with your official SRM college registration number.
              </p>
            </div>

            <div className="bg-white border-[3px] border-nb-ink p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-2">
              <span className="font-mono font-black text-2xl text-nb-blue">02</span>
              <h4 className="font-heading uppercase font-black text-sm">Pick Your Section</h4>
              <p className="font-mono text-xs text-zinc-600">
                Select your Year &amp; Branch (e.g. Year II ECE Sec A or Year III BME).
              </p>
            </div>

            <div className="bg-white border-[3px] border-nb-ink p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-2">
              <span className="font-mono font-black text-2xl text-green-700">03</span>
              <h4 className="font-heading uppercase font-black text-sm">Enter Attendance</h4>
              <p className="font-mono text-xs text-zinc-600">
                Type your current % or attended/held counts per course.
              </p>
            </div>

            <div className="bg-white border-[3px] border-nb-ink p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-2">
              <span className="font-mono font-black text-2xl text-purple-700">04</span>
              <h4 className="font-heading uppercase font-black text-sm">Get Safe Bunk Plan</h4>
              <p className="font-mono text-xs text-zinc-600">
                Instantly see safe skips, must-attends, and weekly recovery targets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-heading font-black text-xs uppercase px-3 py-1 bg-nb-yellow border-[2px] border-nb-ink">
            ENGINEERED FEATURES
          </span>
          <h2 className="font-heading uppercase font-black text-3xl sm:text-4xl text-nb-ink">
            EVERY CALCULATION YOU NEED
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-green-100 border-[2px] border-nb-ink flex items-center justify-center font-mono font-bold text-green-700">
              ✓
            </div>
            <h3 className="font-heading uppercase font-black text-base text-nb-ink">
              Safe-to-Bunk Counter
            </h3>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">
              Accurate count of remaining classes you can safely skip while ensuring your final percentage stays strictly above 75.0%.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-red-100 border-[2px] border-nb-ink flex items-center justify-center font-mono font-bold text-nb-red">
              !
            </div>
            <h3 className="font-heading uppercase font-black text-base text-nb-ink">
              Must-Attend Counter
            </h3>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">
              If your current standing is low, immediately know the minimum classes you must be present for out of the remaining schedule.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-yellow-100 border-[2px] border-nb-ink flex items-center justify-center font-mono font-bold text-yellow-700">
              90%
            </div>
            <h3 className="font-heading uppercase font-black text-base text-nb-ink">
              90% Honors Recovery Plan
            </h3>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">
              Targeting placement tier-1 criteria or dean&apos;s honor roll? See how many sessions it takes to elevate your score to 90%+.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-red-600 text-white border-[2px] border-nb-ink flex items-center justify-center font-mono font-bold">
              ⚠
            </div>
            <h3 className="font-heading uppercase font-black text-base text-nb-ink">
              Irreversible Detention Alert
            </h3>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">
              If a subject has crossed the mathematical point of no return (`must_attend &gt; remaining`), our hazard system alerts you immediately.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-blue-100 border-[2px] border-nb-ink flex items-center justify-center font-mono font-bold text-nb-blue">
              📅
            </div>
            <h3 className="font-heading uppercase font-black text-base text-nb-ink">
              Future Date Planner
            </h3>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">
              Planning a symposium trip or sick leave? Enter your intended skips and preview your final projected standing with instant warnings.
            </p>
          </NBCard>

          <NBCard variant="white" shadowSize="md" className="p-6 space-y-3">
            <div className="w-10 h-10 bg-purple-100 border-[2px] border-nb-ink flex items-center justify-center font-mono font-bold text-purple-700">
              📊
            </div>
            <h3 className="font-heading uppercase font-black text-base text-nb-ink">
              Subject-Wise Granularity
            </h3>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">
              Every course is calculated individually with lab block options and custom weightings matching SRM Trichy EEE curriculum.
            </p>
          </NBCard>
        </div>
      </section>

      {/* 6. SECTIONS COVERED */}
      <section id="sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="font-heading font-black text-xs uppercase px-3 py-1 bg-nb-yellow border-[2px] border-nb-ink">
            TIMETABLE COVERAGE
          </span>
          <h2 className="font-heading uppercase font-black text-3xl text-nb-ink">
            10 SECTIONS IN THE SCHOOL OF EEE
          </h2>
          <p className="font-mono text-xs text-zinc-600">
            Full timetable datasets pre-loaded for Autumn Semester 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Year 1 */}
          <div className="border-[3px] border-nb-ink bg-white p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-3">
            <div className="bg-nb-yellow px-2.5 py-1 border-[2px] border-nb-ink font-heading font-black text-xs uppercase inline-block">
              Year I
            </div>
            <ul className="font-mono text-xs space-y-2">
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>1-ECE:</strong> ECE Year 1 (Physics &amp; Python Labs)
              </li>
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>1-BME:</strong> BME Year 1 (Anatomy &amp; Physiology)
              </li>
            </ul>
          </div>

          {/* Year 2 */}
          <div className="border-[3px] border-nb-ink bg-white p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-3">
            <div className="bg-nb-pink px-2.5 py-1 border-[2px] border-nb-ink font-heading font-black text-xs uppercase inline-block">
              Year II
            </div>
            <ul className="font-mono text-xs space-y-2">
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>2-ECE-A:</strong> ECE Sec A (EDC &amp; Digital Lab)
              </li>
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>2-ECE-B:</strong> ECE Sec B (EDC &amp; Digital Lab)
              </li>
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>2-BME:</strong> BME Year 2 (Sensors &amp; Circuits)
              </li>
            </ul>
          </div>

          {/* Year 3 */}
          <div className="border-[3px] border-nb-ink bg-white p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-3">
            <div className="bg-nb-blue text-white px-2.5 py-1 border-[2px] border-nb-ink font-heading font-black text-xs uppercase inline-block">
              Year III
            </div>
            <ul className="font-mono text-xs space-y-2">
              <li className="p-2 border border-nb-ink bg-zinc-50 text-nb-ink">
                <strong>3-ECE:</strong> Core ECE (DSP &amp; VLSI Labs)
              </li>
              <li className="p-2 border border-nb-ink bg-zinc-50 text-nb-ink">
                <strong>3-ECE-DS:</strong> ECE Data Science Track (ML &amp; VLSI)
              </li>
              <li className="p-2 border border-nb-ink bg-zinc-50 text-nb-ink">
                <strong>3-BME:</strong> BME Year 3 (Medical Imaging &amp; BMI)
              </li>
            </ul>
          </div>

          {/* Year 4 */}
          <div className="border-[3px] border-nb-ink bg-white p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-3">
            <div className="bg-nb-green px-2.5 py-1 border-[2px] border-nb-ink font-heading font-black text-xs uppercase inline-block">
              Year IV
            </div>
            <ul className="font-mono text-xs space-y-2">
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>4-ECE:</strong> Final Year ECE (IoT &amp; Capstone)
              </li>
              <li className="p-2 border border-nb-ink bg-zinc-50">
                <strong>4-BME:</strong> Final Year BME (Telemed &amp; Capstone)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="font-heading font-black text-xs uppercase px-3 py-1 bg-nb-yellow border-[2px] border-nb-ink">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-heading uppercase font-black text-3xl text-nb-ink">
            CLEAR ANSWERS TO ATTENDANCE RULES
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border-[3px] border-nb-ink shadow-[4px_4px_0px_#0A0A0A]"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-heading uppercase font-black text-sm tracking-wider text-nb-ink hover:bg-yellow-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 font-mono text-xs text-zinc-700 leading-relaxed border-t border-zinc-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hazard-stripes border-[4px] border-nb-ink p-6 sm:p-10 shadow-[8px_8px_0px_#0A0A0A]">
          <div className="bg-white border-[3px] border-nb-ink p-8 text-center space-y-6">
            <h2 className="font-heading uppercase font-black text-3xl sm:text-5xl text-nb-ink leading-tight">
              STOP GUESSING. START PLANNING.
            </h2>
            <p className="font-mono text-sm text-zinc-700 max-w-xl mx-auto">
              Login with your registration number to access your custom timetable and calculate your personal safe-bunk quota.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
