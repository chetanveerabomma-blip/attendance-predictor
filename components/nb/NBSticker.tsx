import React from "react";

export interface NBStickerProps {
  text: string;
  color?: "yellow" | "pink" | "blue" | "green" | "red" | "purple";
  rotation?: "-2deg" | "2deg" | "-3deg" | "3deg";
  className?: string;
}

export const NBSticker: React.FC<NBStickerProps> = ({
  text,
  color = "yellow",
  rotation = "-2deg",
  className = "",
}) => {
  const colorStyles = {
    yellow: "bg-nb-yellow text-nb-ink",
    pink: "bg-nb-pink text-nb-ink",
    blue: "bg-nb-blue text-white",
    green: "bg-nb-green text-nb-ink",
    red: "bg-nb-red text-white",
    purple: "bg-nb-purple text-nb-ink",
  };

  const rotationStyles = {
    "-2deg": "-rotate-2",
    "2deg": "rotate-2",
    "-3deg": "-rotate-3",
    "3deg": "rotate-3",
  };

  return (
    <div
      className={`inline-block font-heading uppercase font-black text-xs px-2.5 py-1 border-[3px] border-nb-ink shadow-[3px_3px_0px_#0A0A0A] select-none tracking-widest ${
        rotationStyles[rotation]
      } ${colorStyles[color]} ${className}`}
    >
      ★ {text}
    </div>
  );
};
