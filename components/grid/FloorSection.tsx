"use client";

import React, { useState } from "react";
import { RoomAvailabilityStatus } from "@/lib/engine/rooms";
import { RoomTile } from "./RoomTile";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { buildSquadMessage, getWhatsAppUrl } from "@/lib/squad/whatsapp";

export interface FloorSectionProps {
  floorNumber: number | null;
  floorTitle: string;
  rooms: RoomAvailabilityStatus[];
}

export const FloorSection: React.FC<FloorSectionProps> = ({
  floorNumber,
  floorTitle,
  rooms,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const total = rooms.length;
  const freeRooms = rooms.filter((r) => r.status === "FREE" || r.status === "FREE_SOON");
  const freeCount = freeRooms.length;
  const freePercent = total > 0 ? Math.round((freeCount / total) * 100) : 0;

  // Best available free room on this floor for instant squad call
  const bestFreeRoom = freeRooms.length > 0
    ? [...freeRooms].sort((a, b) => (b.freeMinutes || 0) - (a.freeMinutes || 0))[0]
    : null;

  return (
    <div className="w-full bg-white border-[3px] border-black rounded-[4px] shadow-[6px_6px_0px_#0A0A0A] overflow-hidden mb-8 transition-all">
      {/* Floor Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FFF8E7] border-b-[3px] border-black cursor-pointer hover:bg-[#fffaed] transition-colors gap-3 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-black text-[#FFD93D] font-mono font-black text-sm border-2 border-black rounded-[2px] shadow-[2px_2px_0px_#FF6B9D]">
            {floorNumber !== null ? `FLOOR ${floorNumber}` : "UNMAPPED"}
          </div>
          <div>
            <h3 className="font-heading font-black text-lg uppercase tracking-wider text-black">
              {floorTitle}
            </h3>
            <span className="font-mono text-xs text-gray-700">
              {total} registered rooms
            </span>
          </div>
        </div>

        {/* Free/Total KPI and Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-mono text-sm font-black text-black">
              <span className="text-[#2e7d32]">{freeCount} FREE</span> / {total} TOTAL
            </span>
            <div className="w-32 sm:w-44 h-2.5 bg-gray-200 border-2 border-black rounded-full overflow-hidden mt-1 shadow-[1px_1px_0px_#0A0A0A]">
              <div
                className="h-full bg-[#6BCB77] transition-all duration-300"
                style={{ width: `${freePercent}%` }}
              />
            </div>
          </div>
          <button
            aria-label="Toggle Floor"
            className="p-1.5 bg-white border-2 border-black rounded-[2px] shadow-[2px_2px_0px_#0A0A0A]"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Grid of RoomTiles */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-[#FFFDF7]">
          {rooms.length === 0 ? (
            <p className="font-mono text-sm text-gray-500 py-4 text-center">
              No rooms on this floor match your current filter settings.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rooms.map((statusData) => (
                <RoomTile key={statusData.roomId} statusData={statusData} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floor Section Footer: The "Call the Squad" Feature in the very last tiny corner */}
      <div className="px-4 py-2.5 bg-[#F8F9FA] border-t-2 border-black flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-mono text-[11px] text-gray-600 font-medium">
          {freeCount > 0
            ? `⚡ ${freeCount} space(s) available on this level`
            : "🔒 All rooms currently occupied on this floor"}
        </span>

        {bestFreeRoom ? (
          <a
            href={getWhatsAppUrl(
              buildSquadMessage({
                roomId: bestFreeRoom.roomId,
                roomLabel: bestFreeRoom.room.label,
                floor: bestFreeRoom.room.floor,
                freeUntil: bestFreeRoom.freeUntil,
                isRestOfDay: !bestFreeRoom.nextBooking && bestFreeRoom.status === "FREE",
              })
            )}
            target="_blank"
            rel="noopener noreferrer"
            title={`Call the squad to ${bestFreeRoom.room.label || bestFreeRoom.roomId} on WhatsApp`}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#25D366] text-black font-mono text-[11px] font-black uppercase rounded-[2px] border-2 border-black shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#20ba59] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Send size={12} />
            <span>CALL THE SQUAD ({bestFreeRoom.room.label || bestFreeRoom.roomId})</span>
          </a>
        ) : (
          <span className="font-mono text-[10px] text-gray-400 font-bold uppercase">
            No vacant rooms on this floor
          </span>
        )}
      </div>
    </div>
  );
};
