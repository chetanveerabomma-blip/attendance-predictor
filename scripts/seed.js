const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting SRM Trichy EEE Attendance Predictor Database Seed...");

  // 1. Load timetables
  const timetablesDir = path.resolve(__dirname, "..", "data", "timetables");
  const files = fs.readdirSync(timetablesDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(timetablesDir, file), "utf8"));
    const { section, subjects } = data;

    console.log(`Seeding section: ${section.id} - ${section.label}`);

    // Upsert Section
    await prisma.section.upsert({
      where: { id: section.id },
      update: {
        year: section.year,
        branch: section.branch,
        label: section.label,
      },
      create: {
        id: section.id,
        year: section.year,
        branch: section.branch,
        label: section.label,
      },
    });

    // Upsert Subjects
    for (const sub of subjects) {
      await prisma.subject.upsert({
        where: {
          sectionId_code: {
            sectionId: section.id,
            code: sub.code,
          },
        },
        update: {
          name: sub.name,
          type: sub.type,
          periodsPerSession: sub.periodsPerSession || 1,
        },
        create: {
          code: sub.code,
          name: sub.name,
          type: sub.type,
          periodsPerSession: sub.periodsPerSession || 1,
          sectionId: section.id,
        },
      });
    }
  }

  // 2. Hash default passwords
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123", salt);
  const studentPasswordHash = await bcrypt.hash("StudentPassword123", salt);

  // 3. Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { regNo: "RA2611003010001" },
    update: {
      name: "Dr. K. Ramanathan (HOD EEE)",
      email: "admin@srmtrichy.edu.in",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      regNo: "RA2611003010001",
      name: "Dr. K. Ramanathan (HOD EEE)",
      email: "admin@srmtrichy.edu.in",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      sectionId: "2-ece-a",
    },
  });

  // 4. Upsert Demo Student User
  const student = await prisma.user.upsert({
    where: { regNo: "RA2611003010042" },
    update: {
      name: "Arun Varadharajan",
      email: "arun.v@srmtrichy.edu.in",
      role: "STUDENT",
      passwordHash: studentPasswordHash,
      sectionId: "2-ece-a",
    },
    create: {
      regNo: "RA2611003010042",
      name: "Arun Varadharajan",
      email: "arun.v@srmtrichy.edu.in",
      role: "STUDENT",
      passwordHash: studentPasswordHash,
      sectionId: "2-ece-a",
    },
  });

  // 5. Seed initial snapshot for demo student
  await prisma.snapshot.create({
    data: {
      userId: student.id,
      date: "2026-09-28",
      planningDate: "2026-11-29",
      payload: JSON.stringify({
        sectionId: "2-ece-a",
        overall: {
          current_percentage: 84.5,
          status: "SAFE_75",
          total_held: 110,
          total_attended: 93,
        },
      }),
    },
  });

  // 6. Log audit entry
  await prisma.auditLog.create({
    data: {
      action: "DATABASE_SEEDED",
      details: "Seeded 10 sections, subjects, admin user and demo student",
      userId: admin.id,
    },
  });

  console.log("✅ Database seeding complete!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
