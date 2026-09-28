"use client";

import React, { useEffect, useRef } from "react";
import { MapViewState } from "./types";
import {
  Layers,
  Eye,
  Camera,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface MapControlsOverlayProps {
  viewState: MapViewState;
  selectedTime: string; // HH:mm
  onTimeChange: (time: string) => void;
  onResetTimeNow: () => void;
  onUpdateViewState: (updates: Partial<MapViewState>) => void;
  availableFloors?: (number | null)[];
}

export const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({
  viewState,
  selectedTime,
  onTimeChange,
  onResetTimeNow,
  onUpdateViewState,
  availableFloors = [6, 5, 4, 3, 2, 1, 0, null],
}) => {
  const {
    activeFloor,
    isExploded,
    isCutaway,
    cameraMode,
    isPlayingTimeLapse,
    timeLapseSpeed,
  } = viewState;

  // Time-lapse player animation
  const animFrameRef = useRef<number | null>(null);
  const onTimeChangeRef = useRef(onTimeChange);
  onTimeChangeRef.current = onTimeChange;

  useEffect(() => {
    if (!isPlayingTimeLapse) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTimestamp = performance.now();
    const [h, m] = selectedTime.split(":").map(Number);
    let currentTotalMinutes = (h || 8) * 60 + (m || 0);
    let lastPublishedMinute = Math.floor(currentTotalMinutes / 5) * 5;

    const step = (now: number) => {
      const deltaMs = now - lastTimestamp;
      lastTimestamp = now;

      // Advance five simulated minutes per update to avoid recalculating the room map every frame.
      const minutesPerSecond = 5 * timeLapseSpeed;
      currentTotalMinutes += (deltaMs / 1000) * minutesPerSecond;

      if (currentTotalMinutes >= 18 * 60) {
        currentTotalMinutes = 8 * 60; // loop back to 08:00
      }

      const publishedMinute = Math.floor(currentTotalMinutes / 5) * 5;
      if (publishedMinute !== lastPublishedMinute) {
        lastPublishedMinute = publishedMinute;
        const newH = Math.floor(publishedMinute / 60);
        const newM = publishedMinute % 60;
        onTimeChangeRef.current(`${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingTimeLapse, timeLapseSpeed, selectedTime]);

  return (
    <>
      {/* 1. Left Vertical Floor Selector */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 p-1.5 bg-white border-[3px] border-black rounded-[4px] shadow-[4px_4px_0px_#0A0A0A]">
        <span className="font-heading font-black text-[9px] uppercase px-1 text-center text-gray-500 border-b border-gray-200 pb-1">
          FLOORS
        </span>

        <button
          onClick={() => onUpdateViewState({ activeFloor: "ALL" })}
          className={`px-2 py-1 font-mono text-[11px] font-black uppercase rounded-[2px] border-2 border-black transition-all ${
            activeFloor === "ALL"
              ? "bg-[#FFD93D] text-black shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          ALL
        </button>

        {availableFloors.map((floor) => {
          const isSelected = activeFloor === floor;
          const label = floor !== null ? `F${floor}` : "ANNEX";

          return (
            <button
              key={floor !== null ? floor : "annex"}
              onClick={() => onUpdateViewState({ activeFloor: isSelected ? "ALL" : floor })}
              className={`px-2 py-1 font-mono text-[11px] font-black uppercase rounded-[2px] border-2 border-black transition-all ${
                isSelected
                  ? "bg-[#FF6B9D] text-white shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. Top-Right Mode Action Pills */}
      <div className="absolute top-4 right-4 z-20 flex max-w-[calc(100%-4.5rem)] flex-wrap justify-end gap-1.5 sm:gap-2">
        {/* Explode Toggle */}
        <button
          onClick={() => onUpdateViewState({ isExploded: !isExploded })}
          title={isExploded ? "Collapse floors" : "Explode floors"}
          aria-label={isExploded ? "Collapse floors" : "Explode floors"}
          className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 font-heading text-xs font-black uppercase rounded-[2px] border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all ${
            isExploded
              ? "bg-[#FFD93D] text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          <Layers size={13} />
          <span className="hidden sm:inline">{isExploded ? "COLLAPSE" : "EXPLODE"}</span>
        </button>

        {/* Cutaway Toggle */}
        <button
          onClick={() => onUpdateViewState({ isCutaway: !isCutaway })}
          title={isCutaway ? "Disable cutaway" : "Enable cutaway"}
          aria-label={isCutaway ? "Disable cutaway" : "Enable cutaway"}
          className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 font-heading text-xs font-black uppercase rounded-[2px] border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all ${
            isCutaway
              ? "bg-[#4D96FF] text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          <Eye size={13} />
          <span className="hidden sm:inline">CUTAWAY</span>
        </button>

        {/* Camera Ortho/Perspective Toggle */}
        <button
          onClick={() =>
            onUpdateViewState({
              cameraMode: cameraMode === "orthographic" ? "perspective" : "orthographic",
            })
          }
          title={cameraMode === "orthographic" ? "Switch to perspective" : "Switch to isometric"}
          aria-label={cameraMode === "orthographic" ? "Switch to perspective" : "Switch to isometric"}
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 bg-white text-black font-heading text-xs font-black uppercase rounded-[2px] border-2 border-black shadow-[2px_2px_0px_#0A0A0A] hover:bg-gray-100"
        >
          <Camera size={13} />
          <span className="hidden sm:inline">{cameraMode === "orthographic" ? "ISOMETRIC" : "3D PERSPECTIVE"}</span>
        </button>
      </div>

      {/* 3. Bottom Time Scrubber & Time-Lapse Player Strip */}
      <div className="absolute bottom-4 left-4 right-4 z-20 p-3 bg-white/95 backdrop-blur-sm border-[3px] border-black rounded-[4px] shadow-[6px_6px_0px_#0A0A0A] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Play/Pause + Now controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onUpdateViewState({ isPlayingTimeLapse: !isPlayingTimeLapse })}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-heading text-xs font-black uppercase rounded-[2px] border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all ${
              isPlayingTimeLapse
                ? "bg-[#FF3B30] text-white"
                : "bg-[#6BCB77] text-black hover:bg-[#5bbd67]"
            }`}
          >
            {isPlayingTimeLapse ? <Pause size={14} /> : <Play size={14} />}
            {isPlayingTimeLapse ? "PAUSE" : "PLAY DAY"}
          </button>

          <button
            onClick={onResetTimeNow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E7] text-black font-heading text-xs font-black uppercase rounded-[2px] border-2 border-black shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FFD93D]"
          >
            <RotateCcw size={13} />
            NOW
          </button>

          <div className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FFD93D] rounded-[2px] border border-black">
            {selectedTime}
          </div>
        </div>

        {/* Draggable slider (08:00 to 18:00) */}
        <div className="w-full max-w-xl flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold">08:00</span>
          <input
            type="range"
            min={8 * 60}
            max={18 * 60}
            step={5}
            value={(() => {
              const [h, m] = selectedTime.split(":").map(Number);
              return (h || 8) * 60 + (m || 0);
            })()}
            onChange={(e) => {
              const totalM = Number(e.target.value);
              const h = Math.floor(totalM / 60);
              const m = totalM % 60;
              onTimeChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6B9D]"
          />
          <span className="font-mono text-[11px] font-bold">18:00</span>
        </div>
      </div>
    </>
  );
};
