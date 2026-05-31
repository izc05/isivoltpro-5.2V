import { BriefcaseBusiness, CalendarDays, ChevronRight, Droplet, Plus, Search, ShieldCheck, Snowflake, Wrench, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { formatShortDate } from "../utils/dates";

const filters = ["Todas", "Preventivas", "Correctivas", "Pendientes", "Completadas"];

function matchesQuery(order, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    order.number,
    order.title,
    order.installation,
    order.installationAddress,
    order.location,
    order.specialty,
    order.technician,
    order.status,
    order.priority,
    order.description,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
}

function WorkOrderIcon({ order }) {
  const specialties = {
    Electricidad: { icon: Zap, tone: "bg-blue-100 text-blue-700" },
    Climatizacion: { icon: Snowflake, tone: "bg-sky-100 text-sky-700" },
    Fontaneria: { icon: Droplet, tone: "bg-cyan-100 text-cyan-700" },
    PCI: { icon: ShieldCheck, tone: "bg-purple-100 text-purple-700" },
  };
  const specialty = specialties[order.specialty] || { icon: BriefcaseBusiness, tone: "bg-slate-100 text-slate-700" };
  const Icon = order.type === "Correctiva" ? Wrench : specialty.icon;
  const color = order.type === "Correctiva" ? "bg-red-100 text-danger" : specialty.tone;
  return (
    <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${color}`}>
      <Icon size={30} strokeWidth={2.5} />
    </div>
  );
}

function getOrderStripe(order) {
  if (order.type === "Correctiva") return "from-rose-400 to-amber-300";
  if (order.specialty === "Climatizacion") return "from-sky-400 to-cyan-300";
  if (order.specialty === "Electricidad") return "from-blue-400 to-amber-300";
  if (order.specialty === "PCI") return "from-violet-400 to-fuchsia-300";
  if (order.specialty === "Fontaneria") return "from-cyan-400 to-teal-300";
  return "from-slate-300 to-cyan-300";
}

export default function WorkOrdersScreen({ workOrders, filter, setFilter, onOpenWorkOrder, onNewWorkOrder }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () =>
      workOrders.filter((order) => {
        const matchesFilter =
          filter === "Todas" ||
          (filter === "Preventivas" && order.type === "Preventiva") ||
          (filter === "Correctivas" && order.type === "Correctiva") ||
          (filter === "Pendientes" && order.status === "Pendiente") ||
          (filter === "Completadas" && order.status === "Completada");
        return matchesFilter && matchesQuery(order, query);
      }),
    [filter, query, workOrders]
  );

  return (
    <>
      <Header
        title="Ordenes de trabajo"
        subtitle={`${workOrders.length} activas`}
        actions={
          <>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={() => setSearchOpen((value) => !value)} aria-label="Buscar">
              <Search size={24} />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-amber-300 text-slate-950" onClick={onNewWorkOrder} aria-label="Nueva OT">
              <Plus size={28} />
            </button>
          </>
        }
      >
        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={item === filter ? "shrink-0 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" : "shrink-0 rounded-2xl border border-white/35 px-5 py-3 font-black text-white"}
            >
              {item}
            </button>
          ))}
        </div>
      </Header>
      <main className="space-y-4 px-5 pb-32 pt-6">
        {searchOpen ? (
          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-soft">
            <Search className="text-primary" size={21} />
            <input
              className="min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-slate-400"
              value={query}
              autoFocus
              placeholder="Buscar por OT, instalacion, zona, tecnico o estado"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        ) : null}

        <div className="-mt-1 flex items-center justify-between px-1 text-xs font-black uppercase tracking-wide text-slate-500">
          <span>{visible.length} resultados</span>
          <span>Desliza filtros arriba</span>
        </div>

        {visible.map((order) => (
          <Card key={order.id} className="overflow-hidden p-0">
            <button className="w-full text-left" onClick={() => onOpenWorkOrder(order.id)}>
              <div className={`h-2 bg-gradient-to-r ${getOrderStripe(order)}`} />
              {order.installationImageUrl ? (
                <div className="relative h-24">
                  <img className="h-full w-full object-cover" src={order.installationImageUrl} alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3 text-white">
                    <span className="truncate text-sm font-black">{order.installation}</span>
                    <StatusBadge status={order.status} className="shrink-0" />
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-4 p-4">
                <WorkOrderIcon order={order} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="whitespace-nowrap text-lg font-black tracking-tight">{order.number}</h2>
                      <p className="mt-1 text-lg font-semibold leading-tight">{order.title}</p>
                    </div>
                    {!order.installationImageUrl ? <StatusBadge status={order.status} className="shrink-0" /> : null}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500">
                    <span className="shrink-0 max-w-full truncate">{order.location || order.installation}</span>
                    <span className="shrink-0 max-w-full truncate">{order.specialty}</span>
                    <span className="inline-flex shrink-0 items-center gap-1">
                      <CalendarDays size={16} />
                      {formatShortDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-10 shrink-0 text-slate-500" />
              </div>
            </button>
          </Card>
        ))}
        {!visible.length ? (
          <Card className="py-10 text-center">
            <Search className="mx-auto text-primary" size={38} />
            <h2 className="mt-3 text-xl font-black">Sin ordenes</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Prueba otra busqueda o cambia el filtro.</p>
          </Card>
        ) : null}
      </main>
    </>
  );
}
