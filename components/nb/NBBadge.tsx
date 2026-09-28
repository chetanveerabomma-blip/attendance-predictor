import React from "react";
import { AttendanceStatus } from "@/lib/engine";

export interface NBBadgeProps {
  status?: AttendanceStatus;
  variant?: "safe" | "warning" | "danger" | "irreversible" | "default" | "purple";
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export const NBBadge: React.FC<NBBadgeProps> = ({
  status,
  variant,
  children,
  className = "",
  size = "md",
}) => {
  // Determine variant from status if provided
  let effectiveVariant = variant || "default";
  let label = children;

  if (status) {
    switch (status) {
      case "SAFE_90":
        effectiveVariant = "safe";
        label = label || "SAFE (90%+ TARGET)";
        break;
      case "SAFE_75":
        effectiveVariant = "warning";
        label = label || "ELIGIBLE (75% - 89%)";
        break;
      case "DANGER":
        effectiveVariant = "danger";
        label = label || "DANGER (DETENTION RISK)";
        break;
      case "IRREVERSIBLE":
        effectiveVariant = "irreversible";
        label = label || "IRREVERSIBLE DETENTION";
        break;
    }
  }

  const variantStyles = {
    safe: "bg-nb-green text-nb-ink border-nb-ink",
    warning: "bg-nb-yellow text-nb-ink border-nb-ink",
    danger: "bg-nb-red text-white border-nb-ink",
    irreversible: "hazard-stripes text-white font-black border-nb-ink shadow-[2px_2px_0px_#FF3B30]",
    purple: "bg-nb-purple text-nb-ink border-nb-ink",
    default: "bg-white text-nb-ink border-nb-ink",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] border-[2px]",
    md: "px-3 py-1 text-xs border-[3px]",
  };

  return (
    <span
      className={`inline-flex items-center font-heading uppercase font-bold tracking-wider rounded-none shadow-[2px_2px_0px_#0A0A0A] ${
        sizeStyles[size]
      } ${variantStyles[effectiveVariant]} ${className}`}
    >
      {label}
    </span>
  );
};
