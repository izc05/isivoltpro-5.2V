import { BarChart3, Building2, ChevronRight, ClipboardCheck, Download, FileText, ShieldCheck, TimerReset, TrendingUp, Wrench } from "lucide-react";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { generateCorrectiveReport, generateInstallationReport, generateMonthlyReport, generatePreventiveReport } from "../services/pdfService";

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function ReportCard({ icon: Icon, tone, title, text, metric, detail, onClick, children }) {
  return (
    <Card className="overflow-hidden p-0">
      <button className="w-full text-left" onClick={onClick}>
        <div className="grid grid-cols-[74px_minmax(0,1fr)_24px] gap-4 p-4">
          <div className={`grid h-16 w-16 place-items-center rounded-2xl ${tone}`}>
            <Icon size={31} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black leading-tight">{title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">Plantilla</span>
            </div>
            <p className="mt-1 font-semibold leading-snug text-slate-500">{text}</p>
          </div>
          <ChevronRight className="mt-5 text-slate-600" />
        </div>
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <strong className="text-2xl font-black text-primaryDark">{metric}</strong>
              <p className="text-xs font-black uppercase text-slate-500">{detail}</p>
            </div>
            {children}
          </div>
        </div>
      </button>
    </Card>
  );
}

export default function ReportsScreen({ workOrders = [], installations = [], settings }) {
  const corrective = workOrders.filter((order) => order.type === "Correctiva");
  const preventive = workOrders.filter((order) => order.type === "Preventiva");
  const completed = workOrders.filter((order) => order.status === "Completada" || order.status === "Cerrada");
  const open = workOrders.length - completed.length;
  const completion = percent(completed.length, workOrders.length);
  const topInstallation = installations
    .map((installation) => ({
      ...installation,
      orderCount: workOrders.filter((order) => order.installationId === installation.id).length,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)[0];

  return (
    <>
      <Header title="Informes" subtitle="Partes, resumenes y exportaciones">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
            <strong className="block text-2xl font-black text-accent">{workOrders.length}</strong>
            <span className="text-xs font-black uppercase text-white/70">OTs</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
            <strong className="block text-2xl font-black text-accent">{completion}%</strong>
            <span className="text-xs font-black uppercase text-white/70">Cierre</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
            <strong className="block text-2xl font-black text-accent">{open}</strong>
            <span className="text-xs font-black uppercase text-white/70">Abiertas</span>
          </div>
        </div>
      </Header>

      <main className="space-y-5 px-5 pb-32 pt-6">
        <Card className="bg-[radial-gradient(circle_at_top_left,#155E75,#173B72_50%,#071426)] text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-cyan-200">Panel del mes</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">Actividad de mantenimiento</h2>
              <p className="mt-2 font-semibold text-white/70">Resumen rapido de correctivos, preventivos y centros con mas trabajo.</p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber-200">
              <TrendingUp size={30} />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-amber-300" style={{ width: `${completion}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm font-black text-white/75">
            <span>{completed.length} cerradas</span>
            <span>{open} pendientes</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-100 text-red-700">
              <Wrench size={24} />
            </div>
            <p className="mt-3 text-sm font-black uppercase text-slate-500">Correctivos</p>
            <strong className="text-3xl font-black">{corrective.length}</strong>
          </Card>
          <Card className="p-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
              <ShieldCheck size={24} />
            </div>
            <p className="mt-3 text-sm font-black uppercase text-slate-500">Preventivos</p>
            <strong className="text-3xl font-black">{preventive.length}</strong>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <h2 className="text-xl font-black">Informes disponibles</h2>
            <StatusBadge status="Borrador" />
          </div>

          <ReportCard
            icon={ClipboardCheck}
            tone="bg-red-100 text-red-700"
            title="Partes correctivos"
            text="Intervenciones, tiempos, evidencias y estado de incidencias."
            metric={corrective.length}
            detail="intervenciones"
            onClick={() => generateCorrectiveReport(workOrders, settings)}
          >
            <StatusBadge status={corrective.length ? "Listo" : "Sin datos"} />
          </ReportCard>

          <ReportCard
            icon={ShieldCheck}
            tone="bg-blue-100 text-blue-700"
            title="Partes preventivos"
            text="Planes ejecutados, tareas pendientes y cumplimiento previsto."
            metric={`${percent(preventive.filter((order) => order.status === "Completada").length, preventive.length)}%`}
            detail="cumplimiento"
            onClick={() => generatePreventiveReport(workOrders, settings)}
          >
            <StatusBadge status={preventive.length ? "Listo" : "Sin datos"} />
          </ReportCard>

          <ReportCard
            icon={BarChart3}
            tone="bg-amber-100 text-amber-700"
            title="Informe mensual"
            text="Resumen operativo del mes con volumen, cierre y prioridades."
            metric={`${completion}%`}
            detail="ordenes cerradas"
            onClick={() => generateMonthlyReport(workOrders, settings)}
          >
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
              <TimerReset size={16} />
              Mes actual
            </div>
          </ReportCard>

          <ReportCard
            icon={Building2}
            tone="bg-purple-100 text-purple-700"
            title="Informe por instalacion"
            text="Estado de activos, OTs abiertas y actividad por centro."
            metric={topInstallation?.orderCount || 0}
            detail={topInstallation?.name || "sin centro"}
            onClick={() => generateInstallationReport(workOrders, topInstallation, settings)}
          >
            <StatusBadge status={topInstallation?.status || "Sin datos"} />
          </ReportCard>

          <ReportCard
            icon={Download}
            tone="bg-slate-100 text-slate-800"
            title="Exportar datos"
            text="Descarga preparada para revisar o compartir datos operativos."
            metric="JSON"
            detail="formato local"
            onClick={() => alert("Utilidad pendiente: Usa la exportacion en Ajustes por ahora.")}
          >
            <FileText className="text-slate-600" size={24} />
          </ReportCard>
        </section>
      </main>
    </>
  );
}
