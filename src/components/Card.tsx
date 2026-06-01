import type React from "react";
import { classNames } from "../utils/classNames";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & Record<string, unknown>;

export default function Card({ children, className = "", as: Component = "div", ...props }: CardProps) {
  return (
    <Component
      className={classNames("rounded-app border border-slate-200/80 bg-card p-5 shadow-soft", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
