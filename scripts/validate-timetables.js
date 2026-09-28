const fs = require("fs");
const path = require("path");

const SEMESTER_START = "2026-08-29";
const SEMESTER_END = "2026-11-29";

function parseMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function runValidation() {
  console.log("=== Validating Timetables and Holidays ===");
  const baseDir = path.resolve(__dirname, "..");
  const holidaysPath = path.join(baseDir, "data", "holidays-2026.json");
  const timetablesDir = path.join(baseDir, "data", "timetables");

  let hasError = false;

  // 1. Validate Holidays
  if (!fs.existsSync(holidaysPath)) {
    console.error("❌ holidays-2026.json not found!");
    process.exit(1);
  }

  const holidays = JSON.parse(fs.readFileSync(holidaysPath, "utf8"));
  console.log(`Checking ${holidays.length} holidays...`);
  for (const h of holidays) {
    if (!h.date || !h.name) {
      console.error(`❌ Invalid holiday entry:`, h);
      hasError = true;
    }
    if (h.date < SEMESTER_START || h.date > SEMESTER_END) {
      console.error(`❌ Holiday ${h.name} (${h.date}) falls OUTSIDE semester range (${SEMESTER_START} to ${SEMESTER_END})!`);
      hasError = true;
    }
  }

  // 2. Validate Timetables
  if (!fs.existsSync(timetablesDir)) {
    console.error("❌ Timetables directory not found!");
    process.exit(1);
  }

  const files = fs.readdirSync(timetablesDir).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} timetable files...`);

  if (files.length < 10) {
    console.warn(`⚠️ Warning: Expected 10 timetables, found ${files.length}`);
  }

  for (const file of files) {
    const filePath = path.join(timetablesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const { section, subjects, week, dayOrderOverrides } = data;

    if (!section || !section.id || !section.year || !section.branch) {
      console.error(`❌ [${file}] Invalid section metadata`);
      hasError = true;
    }

    const declaredCodes = new Set(subjects.map((s) => s.code));

    // Validate days
    for (const [day, slots] of Object.entries(week || {})) {
      // Check unknown subject code
      for (const slot of slots) {
        if (!declaredCodes.has(slot.subjectCode)) {
          console.error(`❌ [${file}] Unknown subject code "${slot.subjectCode}" on day ${day}`);
          hasError = true;
        }
      }

      // Check overlapping periods or times
      const sortedSlots = [...slots].sort((a, b) => a.period - b.period);
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const curr = sortedSlots[i];
        const next = sortedSlots[i + 1];

        if (curr.period === next.period) {
          console.error(`❌ [${file}] Duplicate period ${curr.period} on day ${day}`);
          hasError = true;
        }

        const currEnd = parseMinutes(curr.end);
        const nextStart = parseMinutes(next.start);
        if (currEnd > nextStart) {
          console.error(`❌ [${file}] Overlapping time interval on ${day}: Period ${curr.period} ends at ${curr.end} after Period ${next.period} starts at ${next.start}`);
          hasError = true;
        }
      }
    }

    // Validate day overrides
    if (dayOrderOverrides) {
      for (const override of dayOrderOverrides) {
        if (override.date < SEMESTER_START || override.date > SEMESTER_END) {
          console.error(`❌ [${file}] Day order override date ${override.date} is outside semester!`);
          hasError = true;
        }
      }
    }

    console.log(`  ✓ ${file} passed timetable schema & integrity checks.`);
  }

  if (hasError) {
    console.error("❌ Timetable validation FAILED!");
    process.exit(1);
  } else {
    console.log("✅ All timetables and holidays successfully validated!");
  }
}

runValidation();
