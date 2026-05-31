import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, ClipboardPlus, ShieldCheck, Wrench } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import Section from "../components/Section";
import StatusBadge from "../components/StatusBadge";

const recentTones = [
  "from-rose-100 to-amber-100 text-rose-700",
  "from-sky-100 to-cyan-100 text-sky-700",
  "from-violet-100 to-fuchsia-100 text-violet-700",
];

export default function HomeScreen({ installations, workOrders, onNavigate, onOpenInstallation, onOpenWorkOrder }) {
  const lastOrder = workOrders[0];
  const lastInstallation = installations.find((item) => item.id === lastOrder.installationId) || installations[0];
  const recents = workOrders.slice(1, 4);

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

      <main className="space-y-6 px-5 pb-32 pt-6">
        <Card className="relative overflow-hidden border-sky-100 bg-white">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300" />
          <div className="grid grid-cols-[1fr_112px] items-start gap-4">
            <div className="min-w-0">
              <p className="font-bold text-slate-500">Ultimo trabajo</p>
              <h2 className="mt-2 text-3xl font-black leading-none text-primaryDark">{lastInstallation.name}</h2>
              <p className="mt-3 flex items-center gap-2 font-semibold text-slate-500">
                <Building2 size={18} />
                Area de mantenimiento
              </p>
            </div>
            <div className="space-y-4">
              <StatusBadge status="En progreso" />
              {lastInstallation.imageUrl ? (
                <img className="h-24 w-28 rounded-3xl object-cover" src={lastInstallation.imageUrl} alt="" />
              ) : null}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-[1fr_96px] items-end gap-4">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-500">Progreso general</p>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300" />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500">11 de 15 tareas completadas</p>
            </div>
            <strong className="text-4xl font-black">72%</strong>
          </div>
          <Button icon={ArrowRight} variant="dark" className="mt-6 w-full flex-row-reverse" onClick={() => onOpenWorkOrder(lastOrder.id)}>
            Continuar
          </Button>
        </Card>

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
                  {order.type === "Correctiva" ? <Wrench size={23} /> : <ShieldCheck size={23} />}
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

        <button className="w-full overflow-hidden rounded-app bg-[radial-gradient(circle_at_left,#155E75,#173B72_48%,#071426)] p-5 text-left text-white shadow-soft" onClick={() => onOpenInstallation(lastInstallation.id)}>
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
      </main>
    </>
  );
}
