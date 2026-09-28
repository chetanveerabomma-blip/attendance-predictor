"use client";

import React, { useState } from "react";
import { NBModal } from "@/components/nb/NBModal";
import { NBButton } from "@/components/nb/NBButton";
import { Flag, Users, Check, Send, Copy } from "lucide-react";
import { buildSquadMessage, getWhatsAppUrl } from "@/lib/squad/whatsapp";

interface ClaimModalProps {
  isOpen: boolean;
  roomId: string;
  roomLabel?: string;
  floor?: number | null;
  freeUntil?: string | null;
  onClose: () => void;
  onConfirmClaim: (data: { squadSize: number; nickname: string }) => Promise<void>;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  roomId,
  roomLabel,
  floor,
  freeUntil,
  onClose,
  onConfirmClaim,
}) => {
  const [squadSize, setSquadSize] = useState(3);
  const [nickname, setNickname] = useState("ECE Project Group");
  const [loading, setLoading] = useState(false);
  const [isClaimedSuccess, setIsClaimedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayRoom = roomLabel || roomId;
  const squadMsg = buildSquadMessage({
    roomId,
    roomLabel: displayRoom,
    floor,
    freeUntil: freeUntil || "14:30",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirmClaim({ squadSize, nickname });
      setIsClaimedSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(getWhatsAppUrl(squadMsg), "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(squadMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalClose = () => {
    setIsClaimedSuccess(false);
    onClose();
  };

  return (
    <NBModal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isClaimedSuccess ? `SQUAD ASSEMBLED! 🎉` : `CLAIM ROOM: ${displayRoom}`}
    >
      {!isClaimedSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <p className="text-gray-700">
            Claiming holds this room for your group on the 3D building map and alerts other students that a squad is inside.
          </p>

          <div>
            <label className="block font-heading font-black uppercase text-xs mb-1">
              Squad / Group Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. ECE Study Squad"
              className="w-full p-2 border-2 border-black rounded bg-white font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block font-heading font-black uppercase text-xs mb-1">
              Headcount (Squad Size)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setSquadSize(num)}
                  className={`w-9 h-9 border-2 border-black rounded font-black font-mono text-xs ${
                    squadSize === num
                      ? "bg-[#4D96FF] text-white shadow-[2px_2px_0px_#0A0A0A]"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border-2 border-black rounded font-heading font-bold text-xs uppercase"
            >
              CANCEL
            </button>
            <NBButton type="submit" variant="yellow" size="sm" disabled={loading}>
              <Flag size={14} /> {loading ? "HOLDING ROOM..." : "CONFIRM CLAIM"}
            </NBButton>
          </div>
        </form>
      ) : (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-green-50 border-[3px] border-green-600 rounded-[2px] space-y-1">
            <span className="font-heading font-black text-sm uppercase text-green-900 block">
              ✓ Room Claimed Successfully!
            </span>
            <p className="text-gray-700">
              {displayRoom} is now reserved for <strong>{nickname}</strong> ({squadSize} members).
            </p>
          </div>

          {/* Pre-filled WhatsApp message card */}
          <div>
            <span className="block font-heading font-black uppercase text-xs text-gray-700 mb-1">
              Instant Squad Invite Message:
            </span>
            <div className="p-3 bg-[#FFF8E7] border-2 border-black rounded-[2px] font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#0A0A0A]">
              &quot;{squadMsg}&quot;
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 px-4 bg-[#25D366] text-black font-heading text-xs font-black uppercase rounded-[2px] border-[3px] border-black shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#20ba59] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Send size={15} /> CALL THE SQUAD (OPEN WHATSAPP)
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-1.5 px-3 bg-white text-black font-heading text-xs font-bold uppercase border-2 border-black rounded-[2px] shadow-[2px_2px_0px_#0A0A0A] hover:bg-gray-100 flex items-center justify-center gap-1.5"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                {copied ? "COPIED TO CLIPBOARD!" : "COPY MESSAGE"}
              </button>

              <button
                onClick={handleModalClose}
                className="py-1.5 px-4 bg-zinc-100 text-black font-heading text-xs font-bold uppercase border-2 border-black rounded-[2px] hover:bg-zinc-200"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </NBModal>
  );
};
