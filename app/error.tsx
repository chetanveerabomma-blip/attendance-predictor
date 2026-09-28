"use client";

import React from "react";
import { NBButton } from "@/components/nb/NBButton";
import { NBSticker } from "@/components/nb/NBSticker";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="inline-block">
        <NBSticker text="SYSTEM EXCEPTION" color="red" rotation="2deg" />
      </div>

      <div className="bg-white border-[4px] border-nb-ink p-8 shadow-[8px_8px_0px_#0A0A0A] space-y-4">
        <div className="w-16 h-16 bg-red-100 border-[3px] border-nb-ink flex items-center justify-center mx-auto shadow-[3px_3px_0px_#0A0A0A]">
          <AlertOctagon className="w-10 h-10 text-nb-red" />
        </div>

        <h1 className="font-heading uppercase font-black text-2xl sm:text-3xl text-nb-ink">
          COMPUTATION ENGINE ERROR
        </h1>

        <p className="font-mono text-xs text-zinc-700 leading-relaxed max-w-md mx-auto">
          An unexpected computational error occurred while rendering your timetable matrix.
        </p>

        {error.message && (
          <div className="bg-zinc-100 p-3 font-mono text-[11px] text-nb-red border-2 border-nb-ink text-left overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="pt-4 flex justify-center">
          <NBButton size="md" variant="primary" onClick={() => reset()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Recalculate Standing
          </NBButton>
        </div>
      </div>
    </div>
  );
}
