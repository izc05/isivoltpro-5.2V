import { classNames } from "../utils/classNames";

export default function Card({ children, className = "", as: Component = "div", ...props }) {
  return (
    <Component
      className={classNames("rounded-app border border-slate-200/80 bg-card p-5 shadow-soft", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
