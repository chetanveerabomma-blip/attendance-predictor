import React from "react";
import Link from "next/link";
import { NBButton } from "@/components/nb/NBButton";
import { NBSticker } from "@/components/nb/NBSticker";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="inline-block">
        <NBSticker text="ERROR 404" color="pink" rotation="-3deg" />
      </div>

      <div className="bg-white border-[4px] border-nb-ink p-8 shadow-[8px_8px_0px_#0A0A0A] space-y-4">
        <div className="w-16 h-16 bg-nb-yellow border-[3px] border-nb-ink flex items-center justify-center mx-auto shadow-[3px_3px_0px_#0A0A0A]">
          <FileQuestion className="w-10 h-10 text-nb-ink" />
        </div>

        <h1 className="font-heading uppercase font-black text-3xl sm:text-4xl text-nb-ink">
          TIMETABLE NOT FOUND
        </h1>

        <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-md mx-auto">
          The course module, section URL, or page you requested does not exist on the SRM Trichy School of EEE Attendance Predictor portal.
        </p>

        <div className="pt-4 flex justify-center">
          <Link href="/">
            <NBButton size="md" variant="primary">
              <Home className="w-4 h-4 mr-2" />
              Return To Portal Home
            </NBButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
