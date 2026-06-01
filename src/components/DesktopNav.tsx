import { BarChart3, BriefcaseBusiness, Building2, CalendarDays, Home, Plus, Settings, UserRoundCog } from "lucide-react";
import { classNames } from "../utils/classNames";

const items = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "installations", label: "Instalaciones", icon: Building2 },
  { id: "workOrders", label: "Ordenes", icon: BriefcaseBusiness },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "technicians", label: "Tecnicos", icon: UserRoundCog },
  { id: "reports", label: "Informes", icon: BarChart3 },
  { id: "settings", label: "Ajustes", icon: Settings },
];

export default function DesktopNav({ current, onNavigate }: any) {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-80 border-r border-white/10 bg-[radial-gradient(circle_at_top_left,#155E75_0%,#173B72_46%,#071426_100%)] p-5 text-white shadow-2xl lg:block">
      <div className="flex h-full flex-col">
        <button className="mb-7 flex items-center gap-3 text-left" onClick={() => onNavigate("home")}>
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-accent/40 bg-white/10 text-accent">
            <Building2 size={28} />
          </div>
          <div>
            <div className="text-2xl font-black leading-none">IsiVolt<span className="text-accent">Pro</span></div>
            <p className="mt-1 text-sm font-semibold text-white/70">CRM mantenimiento</p>
          </div>
        </button>

        <button className="mb-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-amber-300 px-4 font-black text-slate-950 shadow-soft" onClick={() => onNavigate("newWorkOrder")}>
          <Plus size={21} />
          Nueva OT
        </button>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                className={classNames(
                  "flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-left font-black transition",
                  active ? "bg-white text-primaryDark shadow-soft" : "text-white/82 hover:bg-white/10"
                )}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={22} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/8 p-4">
          <p className="text-xs font-black uppercase text-accent">Vista escritorio</p>
          <p className="mt-2 text-sm font-semibold leading-snug text-white/72">Panel lateral, mas espacio para datos y control de ordenes.</p>
        </div>
      </div>
    </aside>
  );
}
