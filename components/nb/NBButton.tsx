import React from "react";

export interface NBButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "safe" | "outline" | "purple" | "pink" | "yellow" | "green";
  size?: "sm" | "md" | "lg";
}

export const NBButton: React.FC<NBButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "font-heading uppercase font-bold tracking-wider inline-flex items-center justify-center transition-all duration-150 border-[3px] border-nb-ink select-none cursor-pointer";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-none shadow-[3px_3px_0px_#0A0A0A]",
    md: "px-5 py-2.5 text-sm rounded-sm shadow-[4px_4px_0px_#0A0A0A]",
    lg: "px-7 py-3.5 text-base rounded-md shadow-[6px_6px_0px_#0A0A0A]",
  };

  const variantClasses = {
    primary: "bg-nb-yellow text-nb-ink hover:bg-yellow-400",
    secondary: "bg-nb-blue text-nb-ink hover:bg-blue-400",
    danger: "bg-nb-red text-white hover:bg-red-600",
    safe: "bg-nb-green text-nb-ink hover:bg-green-500",
    purple: "bg-nb-purple text-nb-ink hover:bg-purple-400",
    pink: "bg-nb-pink text-nb-ink hover:bg-pink-400",
    yellow: "bg-nb-yellow text-nb-ink hover:bg-yellow-400",
    green: "bg-nb-green text-nb-ink hover:bg-green-500",
    outline: "bg-white text-nb-ink hover:bg-zinc-100",
  };

  const interactive = disabled
    ? "opacity-50 cursor-not-allowed shadow-none"
    : "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none";

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${interactive} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
