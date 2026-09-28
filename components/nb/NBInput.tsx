import React, { forwardRef } from "react";

export interface NBInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const NBInput = forwardRef<HTMLInputElement, NBInputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block font-heading uppercase text-xs font-black tracking-wider text-nb-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full px-3.5 py-2.5 bg-white text-nb-ink font-mono text-sm border-[3px] border-nb-ink shadow-[4px_4px_0px_#0A0A0A] placeholder-zinc-400 focus:outline-none focus:ring-0 ${
              error ? "bg-red-50 border-nb-red" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p className="text-xs font-mono text-zinc-600 font-semibold">{helperText}</p>
        )}
        {error && (
          <div className="bg-nb-red text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-nb-ink shadow-[2px_2px_0px_#0A0A0A] inline-block animate-pulse">
            ⚠ {error}
          </div>
        )}
      </div>
    );
  }
);

NBInput.displayName = "NBInput";
