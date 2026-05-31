import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import Button from "./Button";
import { classNames } from "../utils/classNames";

export default function Header({ title, subtitle, eyebrow, actions, onBack, compact = false, children }) {
  return (
    <header
      className={classNames(
        "relative overflow-hidden rounded-b-[44px] bg-[radial-gradient(circle_at_top_left,#155E75_0%,#173B72_42%,#071426_100%)] px-6 text-white shadow-soft",
        compact ? "pb-12 pt-8" : "pb-16 pt-10"
      )}
    >
      <div className="absolute right-16 top-20 h-32 w-32 rounded-full bg-cyan-300/12 blur-[1px]" />
      <div className="absolute right-7 top-36 h-14 w-14 rounded-full bg-amber-300/18 blur-[1px]" />
      <div className="absolute left-7 bottom-16 h-20 w-20 rounded-full bg-violet-300/12 blur-[1px]" />
      <div className="relative z-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {onBack ? (
              <button
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20"
                onClick={onBack}
                aria-label="Volver"
              >
                <ArrowLeft size={23} />
              </button>
            ) : (
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/35 bg-white/10">
                <ShieldCheck className="text-accent" size={30} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-2xl font-black leading-none">
                <span>IsiVolt</span>
                <span className="text-accent">Pro</span>
              </div>
              <p className="mt-1 text-base font-semibold text-white/78">Mantenimiento</p>
            </div>
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>

        {eyebrow ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent px-4 py-2 text-sm font-black text-accent">
            <Zap size={16} fill="currentColor" />
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-[2.4rem] font-black leading-[0.98] tracking-normal">{title}</h1>
        {subtitle ? <p className="mt-2 text-lg font-semibold text-white/78">{subtitle}</p> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </header>
  );
}
