import React, { useEffect } from "react";

export interface NBModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "hazard" | "danger";
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const NBModal: React.FC<NBModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = "default",
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const headerStyles = {
    default: "bg-nb-yellow text-nb-ink",
    hazard: "hazard-stripes text-white",
    danger: "bg-nb-red text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidthStyles[maxWidth]} bg-white border-[4px] border-nb-ink shadow-[8px_8px_0px_#0A0A0A] overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b-[3px] border-nb-ink flex items-center justify-between ${headerStyles[variant]}`}
        >
          <h3 className="font-heading uppercase font-black text-base tracking-wider truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-mono font-black text-sm bg-white text-nb-ink border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] hover:bg-zinc-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
