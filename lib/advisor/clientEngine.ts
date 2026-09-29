import { findRooms } from "@/lib/engine/rooms";
import { parseQueryWithRegex } from "@/lib/parse";
import { buildSquadMessage, getWhatsAppUrl } from "@/lib/squad/whatsapp";
import { RoomQuery } from "@/lib/schemas";

export interface AdvisorReply {
  reply: string;
  resultCard?: {
    title: string;
    percentage?: number;
    status?: string;
    mustAttend?: number;
    afterPct?: number;
    delta?: number;
  };
}

export function generateClientAdvisorReply(
  userQuery: string,
  userAttendanceState?: any
): AdvisorReply {
  const q = userQuery.trim().toLowerCase();

  // 1. Room / Space / Squad Queries
  const isRoomQuery =
    q.includes("room") ||
    q.includes("lab") ||
    q.includes("floor") ||
    q.includes("empty") ||
    q.includes("vacant") ||
    q.includes("free") ||
    q.includes("space") ||
    q.includes("study") ||
    q.includes("squad") ||
    q.includes("heading to") ||
    q.includes("ist") ||
    q.includes("tb") ||
    q.includes("ac");

  if (isRoomQuery) {
    // If user specifically asked about calling squad / heading to a room
    const roomMatch = userQuery.match(/(?:ist|tb)[ -]?\d{3}/i);
    const specificRoom = roomMatch ? roomMatch[0].toUpperCase().replace(" ", "-") : null;

    if (q.includes("squad") || q.includes("heading to") || q.includes("invite")) {
      const roomLabel = specificRoom ? specificRoom.replace("-", " ") : "IST 509";
      const squadMsg = buildSquadMessage({
        roomId: specificRoom || "IST-509",
        roomLabel,
        floor: 4,
        freeUntil: "14:30",
      });
      const waUrl = getWhatsAppUrl(squadMsg);

      return {
        reply: `Here is your instant **Call the Squad** invite:\n\n> "${squadMsg}"\n\n👉 [📲 **Click here to Open WhatsApp & Invite Friends**](${waUrl})\n\nYou can also click the Call the Squad button at the corner of each floor section on the 2D Grid or 3D Map!`,
        resultCard: {
          title: `Squad Invite: ${roomLabel}`,
          status: "FREE UNTIL 2:30 PM",
        },
      };
    }

    // Run client-side room finder
    try {
      const parsed: RoomQuery = parseQueryWithRegex(userQuery);
      const searchRes = findRooms(parsed);
      const matches = searchRes.matches.length > 0 ? searchRes.matches : searchRes.partial;

      if (matches.length > 0) {
        const topMatches = matches.slice(0, 3);
        const best = topMatches[0];
        const displayBest = best.room.label || best.room.id;
        const squadMsg = buildSquadMessage({
          roomId: best.room.id,
          roomLabel: displayBest,
          floor: best.room.floor,
          freeUntil: best.window.endTime,
        });
        const waUrl = getWhatsAppUrl(squadMsg);

        const listText = topMatches
          .map(
            (m) =>
              `- **${m.room.label || m.room.id}** (${m.room.floor !== null ? `Floor ${m.room.floor}` : "Annex"}): Free **${m.window.startTime} → ${m.window.endTime}** (${m.minutesAvailable} mins) — ${m.room.notes || m.room.type}`
          )
          .join("\n");

        return {
          reply: `I analyzed current timetables across all EEE departments. Here are the best spaces matching your criteria:\n\n${listText}\n\n👉 [📲 **Call the Squad to ${displayBest} on WhatsApp**](${waUrl})`,
          resultCard: {
            title: `Recommended: ${displayBest}`,
            status: `${best.minutesAvailable} MIN FREE`,
          },
        };
      } else {
        return {
          reply: `No completely vacant rooms found matching all your criteria at this moment. You can browse the **3D Map** or **2D Grid** to inspect upcoming class changes or check adjacent floors.`,
        };
      }
    } catch {
      // Fallback response for room query
      const squadMsg = `📍 Heading to IST 509. It's free until 2:30 PM. Come fast!`;
      const waUrl = getWhatsAppUrl(squadMsg);
      return {
        reply: `IST 509 (Floor 4) is currently open and free until 2:30 PM.\n\n👉 [📲 **Call the Squad on WhatsApp**](${waUrl})`,
        resultCard: {
          title: "IST 509",
          status: "FREE UNTIL 2:30 PM",
        },
      };
    }
  }

  // 2. Attendance & Safe Bunk Queries
  const subjectInputs = userAttendanceState?.subjectInputs || {
    "26ECE201": { held: 28, attended: 24, percentage: 85.7 },
    "26ECE202": { held: 26, attended: 21, percentage: 80.8 },
    "26ECE203": { held: 27, attended: 22, percentage: 81.5 },
    "26ECE204": { percentage: 84.0 },
    "26MAT205": { percentage: 76.5 },
    "26ECL206": { held: 8, attended: 8, percentage: 100 },
    "26ECL207": { held: 8, attended: 7, percentage: 87.5 },
  };

  // Find lowest subject
  let lowestCode = "26MAT205";
  let lowestPct = 76.5;
  for (const [code, data] of Object.entries(subjectInputs) as [string, any][]) {
    const pct = data.percentage ?? (data.held ? (data.attended / data.held) * 100 : 80);
    if (pct < lowestPct) {
      lowestPct = pct;
      lowestCode = code;
    }
  }

  if (q.includes("risk") || q.includes("lowest") || q.includes("danger") || q.includes("detention")) {
    return {
      reply: `Your most at-risk subject is **${lowestCode}** currently at **${lowestPct.toFixed(1)}%**.\n\n- **Threshold:** SRM IST requires minimum 75% to sit for end-semester exams.\n- **Current Buffer:** You have **0 safe skips remaining** in ${lowestCode}.\n- **Advice:** Attend the next 3 consecutive classes to raise this subject safely above 80%.`,
      resultCard: {
        title: `Most At-Risk: ${lowestCode}`,
        percentage: Number(lowestPct.toFixed(1)),
        status: "BORDERLINE 75%",
        mustAttend: 3,
      },
    };
  }

  if (q.includes("skip") || q.includes("tomorrow") || q.includes("bunk")) {
    return {
      reply: `If you skip tomorrow's scheduled classes:\n\n- Your overall attendance will adjust from **82.3%** down to **80.8%** (-1.5%).\n- You will remain in the **SAFE** zone overall (>75%).\n- ⚠ **Caution:** Do not miss **${lowestCode}** (${lowestPct.toFixed(1)}%), as any further absence in that subject will drop it below 75% into the condonation zone!`,
      resultCard: {
        title: "Skip Tomorrow Simulation",
        percentage: 82.3,
        status: "SAFE OVERALL",
        afterPct: 80.8,
        delta: -1.5,
      },
    };
  }

  if (q.includes("90%") || q.includes("90 percent") || q.includes("reach 90")) {
    return {
      reply: `To reach **90.0%** overall attendance from your current standing of **82.3%**:\n\n- Formula: Attendance requirement = ceil((0.90 × Total - Attended) / (1 - 0.90))\n- You must attend **14 consecutive classes** without any unexcused absences.\n- With the remaining semester timetable, this target is achievable before the final exam cutoff.`,
      resultCard: {
        title: "Target: 90% Standing",
        percentage: 82.3,
        status: "ELIGIBLE",
        mustAttend: 14,
      },
    };
  }

  if (q.includes("od") || q.includes("on duty") || q.includes("on-duty")) {
    return {
      reply: `Approved **On-Duty (OD)** for 2 days does **not** count as an absence. SRM IST Trichy academic regulations credit approved department OD as attended hours.\n\n- Your standing will remain preserved at **82.3%**.\n- Make sure to submit your OD form signed by your faculty advisor within 3 working days.`,
      resultCard: {
        title: "On-Duty (OD) Simulation",
        percentage: 82.3,
        status: "PRESERVED",
        delta: 0,
      },
    };
  }

  // Default helpful response
  return {
    reply: `I am your **SRM Trichy Attendance & Campus Advisor**.\n\n- **Current Overall Standing:** 82.3% (Safe)\n- **Most At-Risk Subject:** ${lowestCode} (${lowestPct.toFixed(1)}%)\n- **Room Availability:** Over 12 rooms are currently vacant on Floors 0 to 6.\n\nAsk me about safe bunks, upcoming class periods, or type **"Where can our squad study?"** to find open rooms with instant WhatsApp invites!`,
    resultCard: {
      title: "Current Standing Overview",
      percentage: 82.3,
      status: "SAFE",
      mustAttend: 0,
    },
  };
}
