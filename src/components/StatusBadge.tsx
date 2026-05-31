import { classNames } from "../utils/classNames";
import { getStatusTone } from "../utils/status";

export default function StatusBadge({ status, className = "" }) {
  const tone = getStatusTone(status);
  const styles = {
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={classNames("inline-flex items-center rounded-xl px-3 py-1 text-sm font-black", styles[tone], className)}>
      {status}
    </span>
  );
}
