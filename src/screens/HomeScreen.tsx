import { Activity, AlertTriangle, ArrowRight, BriefcaseBusiness, Building2, CalendarDays, ClipboardCheck, ClipboardPlus, Flag, LocateFixed, MapPin, ShieldCheck, UserRoundCog, Wrench } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import Section from "../components/Section";
import StatusBadge from "../components/StatusBadge";

const openStatuses = new Set(["nueva", "pendiente", "asignada", "en_curso", "observada", "demorada"]);
const closedStatuses = new Set(["completada", "cerrada"]);

const recentTones = [
  "from-rose-100 to-amber-100 text-rose-700",
  "from-sky-100 to-cyan-100 text-sky-700",
  "from-violet-100 to-fuchsia-100 text-violet-700",
];

const priorityRanks = {
  Urgente: 4,
  Alta: 3,
  Media: 2,
  Baja: 1,
};

const priorityStyles = {
  Urgente: "bg-red-100 text-red-700",
  Alta: "bg-amber-100 text-amber-700",
  Media: "bg-blue-100 text-blue-700",
  Baja: "bg-slate-100 text-slate-600",
};

export default function HomeScreen({ installations, workOrders, technicians = [], onNavigate, onOpenInstallation, onOpenWorkOrder, onNewWorkOrderWithGps }: any) {
  const [gps, setGps] = useState<any>(null);
  const [gpsError, setGpsError] = useState("");
  const openOrders = workOrders.filter((order) => openStatuses.has(order.rawStatus));
  const closedOrders = workOrders.filter((order) => closedStatuses.has(order.rawStatus));
  const nextOrder = openOrders[0] || workOrders[0];
  const nextInstallation = installations.find((item) => item.id === nextOrder?.installationId) || installations[0];
  const recents = workOrders.filter((order) => order.id !== nextOrder?.id).slice(0, 3);
  const completion = workOrders.length ? Math.round((closedOrders.length / workOrders.length) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = workOrders.filter((order) => String(order.scheduledAt || order.createdAt || "").slice(0, 10) === today).length;
  const priorityOrders = [...openOrders]
    .sort((a, b) => (priorityRanks[b.priority] || 0) - (priorityRanks[a.priority] || 0) || new Date(a.scheduledAt || a.createdAt).getTime() - new Date(b.scheduledAt || b.createdAt).getTime())
    .slice(0, 3);
  const urgentCount = openOrders.filter((order) => order.priority === "Urgente" || order.priority === "Alta").length;
  const nextPreventives = workOrders
    .filter((order) => order.rawType === "preventiva" && openStatuses.has(order.rawStatus))
    .sort((a, b) => new Date(a.scheduledAt || a.createdAt).getTime() - new Date(b.scheduledAt || b.createdAt).getTime())
    .slice(0, 2);
  const movements = [...workOrders]
    .sort((a, b) => new Date(b.updatedAt || b.completedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.completedAt || a.createdAt).getTime())
    .slice(0, 5);
  const locatedOrders = workOrders.filter((order) => order.gpsLat && order.gpsLng).length;
  const captureGps = () => {
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("GPS no disponible en este navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setGps({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setGpsError("No se pudo obtener la localizacion."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <>
      <Header title="Bienvenido de nuevo" subtitle="Todo tu mantenimiento, en un solo lugar." eyebrow="Plan Pro">
        <div className="grid grid-cols-2 gap-3">
          <Button icon={ClipboardPlus} onClick={() => onNavigate("newWorkOrder")} className="w-full">
            Nueva OT
          </Button>
          <Button icon={BriefcaseBusiness} variant="ghost" onClick={() => onNavigate("workOrders")} className="w-full">
            Mis trabajos
          </Button>
        </div>
      </Header>

      <main className="space-y-6 px-5 pb-32 pt-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:items-start lg:gap-6 lg:space-y-0 lg:px-8 xl:grid-cols-[minmax(0,1.5fr)_420px]">
        <div className="space-y-6">
        <Card className="relative overflow-hidden border-sky-100 bg-white">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300" />
          {nextOrder ? (
          <>
          <div className="grid grid-cols-[1fr_112px] items-start gap-4">
            <div className="min-w-0">
              <p className="font-bold text-slate-500">{openOrders.length ? "Siguiente trabajo" : "Ultimo trabajo"}</p>
              <h2 className="mt-2 text-3xl font-black leading-none text-primaryDark">{nextInstallation?.name || "Sin instalacion"}</h2>
              <p className="mt-3 flex items-center gap-2 font-semibold text-slate-500">
                <Building2 size={18} />
                {nextOrder.title}
              </p>
            </div>
            <div className="space-y-4">
              <StatusBadge status={nextOrder.status} />
              {nextInstallation?.imageUrl ? (
                <img className="h-24 w-28 rounded-3xl object-cover" src={nextInstallation.imageUrl} alt="" />
              ) : null}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-[1fr_96px] items-end gap-4">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-500">Cierre de ordenes</p>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500">{closedOrders.length} cerradas · {openOrders.length} abiertas · {todayCount} hoy</p>
            </div>
            <strong className="text-4xl font-black">{completion}%</strong>
          </div>
          <Button icon={ArrowRight} variant="dark" className="mt-6 w-full flex-row-reverse" onClick={() => onOpenWorkOrder(nextOrder.id)}>
            Continuar
          </Button>
          </>
          ) : (
            <div className="py-4">
              <h2 className="text-2xl font-black text-primaryDark">Todavia no hay ordenes</h2>
              <p className="mt-2 font-semibold text-slate-500">Crea un parte de visita, un correctivo o un preventivo programado para empezar.</p>
              <Button icon={ClipboardPlus} variant="dark" className="mt-5 w-full" onClick={() => onNavigate("newWorkOrder")}>
                Crear primera OT
              </Button>
            </div>
          )}
        </Card>

        <Section
          title="Prioridad"
          action={
            <button className="flex items-center gap-1 font-black text-primary" onClick={() => onNavigate("workOrders")}>
              Ver cola <ArrowRight size={18} />
            </button>
          }
        >
          <div className="space-y-3">
            {priorityOrders.length ? priorityOrders.map((order) => (
              <button key={order.id} className="grid w-full grid-cols-[48px_minmax(0,1fr)_88px] items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-soft" onClick={() => onOpenWorkOrder(order.id)}>
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${priorityStyles[order.priority] || "bg-slate-100 text-slate-600"}`}>
                  {order.priority === "Urgente" || order.priority === "Alta" ? <AlertTriangle size={24} /> : <Flag size={24} />}
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-primaryDark">{order.title}</strong>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-500">{order.installation} · {order.number}</p>
                </div>
                <span className={`rounded-xl px-3 py-1 text-center text-xs font-black ${priorityStyles[order.priority] || "bg-slate-100 text-slate-600"}`}>{order.priority}</span>
              </button>
            )) : (
              <Card className="py-6 text-center">
                <ShieldCheck className="mx-auto text-primary" size={32} />
                <p className="mt-2 font-black text-slate-700">Sin prioridades abiertas</p>
              </Card>
            )}
          </div>
        </Section>

        <Section title="Flujo de trabajo">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <button className="rounded-3xl bg-white p-4 text-left shadow-soft" onClick={() => onNavigate("newWorkOrder")}>
              <ClipboardCheck className="mb-3 text-emerald-600" size={28} />
              <strong className="block text-primaryDark">Parte de visita</strong>
              <span className="mt-1 block text-sm font-semibold text-slate-500">Registro rapido con fotos y notas.</span>
            </button>
            <button className="rounded-3xl bg-white p-4 text-left shadow-soft" onClick={() => onNavigate("workOrders")}>
              <AlertTriangle className="mb-3 text-red-600" size={28} />
              <strong className="block text-primaryDark">{urgentCount} prioritarias</strong>
              <span className="mt-1 block text-sm font-semibold text-slate-500">Correctivos abiertos por urgencia.</span>
            </button>
            <button className="rounded-3xl bg-white p-4 text-left shadow-soft" onClick={() => onNavigate("agenda")}>
              <CalendarDays className="mb-3 text-blue-600" size={28} />
              <strong className="block text-primaryDark">{nextPreventives.length} preventivos</strong>
              <span className="mt-1 block text-sm font-semibold text-slate-500">Proximas tareas programadas.</span>
            </button>
            <button className="rounded-3xl bg-white p-4 text-left shadow-soft" onClick={() => onNavigate("installations")}>
              <Building2 className="mb-3 text-primary" size={28} />
              <strong className="block text-primaryDark">Instalaciones</strong>
              <span className="mt-1 block text-sm font-semibold text-slate-500">Activos, QR y ubicaciones.</span>
            </button>
            <button className="rounded-3xl bg-white p-4 text-left shadow-soft" onClick={() => onNavigate("technicians")}>
              <UserRoundCog className="mb-3 text-violet-600" size={28} />
              <strong className="block text-primaryDark">{technicians.length} tecnicos</strong>
              <span className="mt-1 block text-sm font-semibold text-slate-500">Equipo y datos de contacto.</span>
            </button>
          </div>
        </Section>

        <Section
          title="Recientes"
          action={
            <button className="flex items-center gap-1 font-black text-primary" onClick={() => onNavigate("workOrders")}>
              Ver todas <ArrowRight size={18} />
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            {recents.map((order, index) => (
              <button key={order.id} className="rounded-3xl bg-white p-3 text-left shadow-soft" onClick={() => onOpenWorkOrder(order.id)}>
                <div className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${recentTones[index % recentTones.length]}`}>
                  {order.type === "Correctiva" ? <Wrench size={23} /> : order.type === "Parte de visita" ? <ClipboardCheck size={23} /> : <ShieldCheck size={23} />}
                </div>
                <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-tight">{order.installation}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{order.number}</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" />
                </div>
              </button>
            ))}
          </div>
        </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Movimientos de OT">
            <Card className="divide-y divide-slate-100 p-0">
              {movements.map((order) => (
                <button key={order.id} className="flex w-full items-start gap-3 px-4 py-4 text-left" onClick={() => onOpenWorkOrder(order.id)}>
                  <div className={order.rawStatus === "completada" || order.rawStatus === "cerrada" ? "grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700" : "grid h-11 w-11 place-items-center rounded-2xl bg-cyan-100 text-primary"}>
                    <Activity size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <strong className="truncate text-primaryDark">{order.number}</strong>
                      <StatusBadge status={order.status} className="shrink-0 text-xs" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-500">{order.title}</p>
                    <p className="mt-1 truncate text-xs font-black uppercase text-primary/70">{order.installation}</p>
                  </div>
                </button>
              ))}
            </Card>
          </Section>

          <Section title="Localizacion">
            <Card className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-primary">
                  <MapPin size={25} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primaryDark">Ubicaciones y GPS</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{locatedOrders} OT con coordenadas guardadas.</p>
                </div>
              </div>
              {gps ? (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  Lat {gps.lat.toFixed(5)} · Lng {gps.lng.toFixed(5)}
                </div>
              ) : null}
              {gpsError ? <p className="rounded-2xl bg-amber-50 p-3 text-sm font-black text-amber-800">{gpsError}</p> : null}
              <div className="grid grid-cols-2 gap-3">
                <Button icon={LocateFixed} variant="outline" onClick={captureGps}>Detectar</Button>
                <Button icon={ClipboardPlus} onClick={() => onNewWorkOrderWithGps(gps)}>OT GPS</Button>
              </div>
            </Card>
          </Section>

        <button className="w-full overflow-hidden rounded-app bg-[radial-gradient(circle_at_left,#155E75,#173B72_48%,#071426)] p-5 text-left text-white shadow-soft" onClick={() => nextInstallation ? onOpenInstallation(nextInstallation.id) : onNavigate("installations")}>
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-accent/30 bg-white/5">
              <ShieldCheck className="text-cyan-200" size={42} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Preventivos, correctivos y activos</h2>
              <p className="mt-2 text-sm font-semibold text-white/72">Gestiona ordenes, planes de mantenimiento y activos criticos de tu operacion.</p>
            </div>
          </div>
        </button>
        </aside>
      </main>
    </>
  );
}
