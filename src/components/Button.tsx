import type React from "react";
import { classNames } from "../utils/classNames";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  variant?: "primary" | "dark" | "outline" | "ghost" | "danger";
  className?: string;
};

export default function Button({ children, icon: Icon, variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-cyan-300 via-sky-300 to-amber-300 text-slate-950 shadow-soft",
    dark: "bg-primaryDark text-cyan-200 shadow-soft",
    outline: "border border-cyan-300 bg-white text-primary",
    ghost: "bg-white/10 text-white ring-1 ring-white/20",
    danger: "bg-danger text-white",
  };

  return (
    <button
      className={classNames(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-black transition active:scale-[0.98]",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon ? <Icon size={21} strokeWidth={2.6} /> : null}
      {children}
    </button>
  );
}
