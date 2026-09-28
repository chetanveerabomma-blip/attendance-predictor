# ATTENDANCE PREDICTOR — SRM TRICHY (SCHOOL OF EEE)

Official analytical attendance forecasting portal for SRM Trichy School of EEE students (Autumn Semester: **29 Aug 2026 to 29 Nov 2026**).

Built strictly with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Custom Neobrutalism Design System**, **Zustand**, **Prisma + SQLite**, and **Vitest**.

---

## ⚡ Quick Start & Localhost Access

### 1. Link to Access Locally
Once the local server is running, access the portal at:
```
http://localhost:3000
```

### 2. Default Test & Evaluation Credentials

| Role | Registration Number | Password | Assigned Section |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `RA2611003010042` | `StudentPassword123` | `2-ece-a` (Year II - ECE Sec A) |
| **Faculty Admin** | `RA2611003010001` | `AdminPassword123` | Administrative Console |

---

## 🏗️ Architecture & Features

### 1. Design System
- **Hard Offset Shadows:** `box-shadow: 6px 6px 0 #0A0A0A` on cards, `4px 4px 0` on buttons
- **Strict 3px Solid Borders:** Consistent dark ink borders (`#0A0A0A`) across every card, input, and badge
- **Color Tokens:** Cream background (`#FFF8E7`), Ink (`#0A0A0A`), Card white (`#FFFFFF`), Yellow (`#FFD93D`), Pink (`#FF6B9D`), Blue (`#4D96FF`), Green (`#6BCB77`), Red (`#FF3B30`), Purple (`#B983FF`)
- **Typography:** Space Grotesk (headings, 700+), Space Mono (numbers and labels), Inter (body)
- **Stickers & Banners:** Rotated stickers (`-2deg`, `3deg`), Marquee warning ticker bar, and diagonal hazard stripes for irreversible detention alerts

### 2. Core Calculation Engine (`/lib/engine.ts`)
- **Strict Cutoffs:** 75% statutory detention barrier and 90% honors target
- **Safe-to-Bunk Counter:** Floor calculation of safe skips available
- **Must-Attend Counter:** Ceil calculation of mandatory classes needed
- **Irreversible Detention Detection:** Automatic alert when `must_attend_75 > remaining_classes`
- **Future Absence Simulator:** Real-time feedback if planned absences breach 75%
- **Weekly Recovery Pacing:** Breakdown of classes to attend per week across remaining weeks

### 3. Timetable & Holiday Calendar Engine (`/lib/dates.ts`)
- **Semester Duration:** 29 Aug 2026 to 29 Nov 2026 (Asia/Kolkata timezone)
- **10 Complete Timetables:** Year I to IV across ECE, ECE-DS, and BME
- **Holiday Exclusion:** All Tamil Nadu / SRM declared holidays (Krishna Jayanthi, Milad-un-Nabi, Gandhi Jayanthi, Ayudha Puja, Vijaya Dasami, Deepavali)
- **Sunday Exclusion:** Automatic exclusion of Sundays from scheduled classes
- **Configurable Lab Blocks:** Choose between "1 Period = 1 Class" or "1 Multi-period Session = 1 Class"

---

## 🧪 Testing

Run the 28 unit tests covering all engine edge cases:
```bash
npm test
```
Tests cover:
- Exactly 75% and 90% thresholds
- IRREVERSIBLE boundaries (`must == R` vs `must == R + 1`)
- Zero remaining classes (at semester end)
- Lab session block counting vs individual period counting
- Holiday and Sunday exclusion
- Planned skips future projection

---
## 📋 Assumptions Made

1. **Registration Number Format:** Formatted as `^[A-Z]{2}\d{10,13}$` (e.g. `RA2611003010042` or `TR2600000000001`), case-insensitive and normalized to uppercase.
2. **Lab Counting:** Configurable via a toggle on the dashboard:
   - **Period Mode (Default):** Counts every timetable period slot as an attendance unit.
   - **Session Mode:** Contiguous lab periods on the same day are grouped into a single class count.
3. **Current Date Treatment:** Default today is fixed to `2026-09-28` in IST (mid-semester point with 62 calendar days and 50 working days remaining until 29 Nov 2026). A toggle allows marking today's classes as completed.
4. **Planning Date:** Selectable from today up to `2026-11-29`, allowing students to simulate symposium leaves or holiday periods.

https://github.com/chetanveerabomma-blip/attendance-predictor
