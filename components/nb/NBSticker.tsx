import React from "react";

export interface NBStickerProps {
  text?: string;
  children?: React.ReactNode;
  color?: "yellow" | "pink" | "blue" | "green" | "red" | "purple";
  rotation?: string;
  rotate?: string;
  className?: string;
}

export const NBSticker: React.FC<NBStickerProps> = ({
  text,
  children,
  color = "yellow",
  rotation = "-2deg",
  rotate,
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

  const rotationValue = rotate || rotation;
  const rotationClass = rotationValue.includes("3deg")
    ? rotationValue.startsWith("-") ? "-rotate-3" : "rotate-3"
    : rotationValue.includes("1")
      ? rotationValue.startsWith("-") ? "-rotate-1" : "rotate-1"
      : rotationValue.startsWith("-") ? "-rotate-2" : "rotate-2";

  return (
    <div
      className={`inline-block font-heading uppercase font-black text-xs px-2.5 py-1 border-[3px] border-nb-ink shadow-[3px_3px_0px_#0A0A0A] select-none tracking-widest ${
        rotationClass
      } ${colorStyles[color]} ${className}`}
    >
      {children ?? `★ ${text ?? ""}`}
    </div>
  );
};
