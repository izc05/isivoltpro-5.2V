import { BarChart3, BriefcaseBusiness, Building2, CalendarDays, Home, Settings } from "lucide-react";
import { classNames } from "../utils/classNames";

const items = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "installations", label: "Instal.", icon: Building2 },
  { id: "workOrders", label: "OT", icon: BriefcaseBusiness },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "reports", label: "Informes", icon: BarChart3 },
  { id: "settings", label: "Ajustes", icon: Settings },
];

export default function BottomNav({ current, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-3 pb-3 md:max-w-3xl lg:max-w-5xl">
      <div className="grid grid-cols-6 rounded-t-[36px] rounded-b-[30px] bg-[radial-gradient(circle_at_top_left,#155E75_0%,#173B72_44%,#071426_100%)] px-2 pb-3 pt-4 shadow-nav ring-1 ring-white/10">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={classNames(
                "relative flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl text-[13px] font-black leading-none tracking-normal transition",
                active ? "text-accent" : "text-white"
              )}
            >
              {active ? <span className="absolute top-1 h-1.5 w-5 rounded-full bg-accent" /> : null}
              <Icon className={classNames("drop-shadow-sm", active ? "" : "opacity-90")} size={26} strokeWidth={active ? 2.9 : 2.45} />
              <span className={classNames("drop-shadow-sm", active ? "" : "opacity-95")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
