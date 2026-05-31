import { BarChart3, Building2, ChevronRight, ClipboardCheck, Download, FileJson, FileSpreadsheet, FileText, Filter, ShieldCheck, TimerReset, TrendingUp, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { generateCorrectiveReport, generateInstallationReport, generateMonthlyReport, generatePreventiveReport, generateVisitReport } from "../services/pdfService";
import { exportReportJson, exportWorkOrdersCsv } from "../services/reportExportService";
import { toDateInputValue } from "../utils/dates";

const TYPE_FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "Correctiva", label: "Correctivas" },
  { value: "Preventiva", label: "Preventivas" },
  { value: "Parte de visita", label: "Visitas" },
];

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function orderDate(order) {
  return toDateInputValue(order.scheduledAt || order.createdAt);
}

function ReportCard({ icon: Icon, tone, title, text, metric, detail, actionLabel = "Generar", onClick, children }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 p-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl ${tone}`}>
          <Icon size={28} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black leading-tight">{title}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">Filtrado</span>
          </div>
          <p className="mt-1 font-semibold leading-snug text-slate-500">{text}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <strong className="text-2xl font-black text-primaryDark">{metric}</strong>
            <p className="text-xs font-black uppercase text-slate-500">{detail}</p>
          </div>
          <button className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-primaryDark px-4 py-2 text-sm font-black text-cyan-100" onClick={onClick}>
            {actionLabel}
            <ChevronRight size={18} />
          </button>
        </div>
        {children ? <div className="mt-3">{children}</div> : null}
      </div>
    </Card>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <select className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 font-bold text-slate-900 outline-none focus:border-accent" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <input className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 font-bold text-slate-900 outline-none focus:border-accent" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default function ReportsScreen({ workOrders = [], installations = [], settings }) {
  const today = toDateInputValue(new Date());
  const firstOrderDate = workOrders.map(orderDate).filter(Boolean).sort()[0] || today;
  const [typeFilter, setTypeFilter] = useState("todas");
  const [installationFilter, setInstallationFilter] = useState("todas");
  const [dateFrom, setDateFrom] = useState(firstOrderDate);
  const [dateTo, setDateTo] = useState(today);

  const filteredOrders = useMemo(
    () =>
      workOrders.filter((order) => {
        const date = orderDate(order);
        const matchesType = typeFilter === "todas" || order.type === typeFilter;
        const matchesInstallation = installationFilter === "todas" || order.installationId === installationFilter;
        const matchesFrom = !dateFrom || !date || date >= dateFrom;
        const matchesTo = !dateTo || !date || date <= dateTo;
        return matchesType && matchesInstallation && matchesFrom && matchesTo;
      }),
    [dateFrom, dateTo, installationFilter, typeFilter, workOrders]
  );

  const corrective = filteredOrders.filter((order) => order.type === "Correctiva");
  const preventive = filteredOrders.filter((order) => order.type === "Preventiva");
  const visits = filteredOrders.filter((order) => order.type === "Parte de visita");
  const completed = filteredOrders.filter((order) => order.status === "Completada" || order.status === "Cerrada");
  const open = filteredOrders.length - completed.length;
  const completion = percent(completed.length, filteredOrders.length);
  const selectedInstallation = installations.find((installation) => installation.id === installationFilter);
  const topInstallation = selectedInstallation || installations
    .map((installation) => ({
      ...installation,
      orderCount: filteredOrders.filter((order) => order.installationId === installation.id).length,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)[0];
  const stats = {
    total: filteredOrders.length,
    open,
    completed: completed.length,
    completion,
    corrective: corrective.length,
    preventive: preventive.length,
    visits: visits.length,
  };

  return (
    <>
      <Header title="Informes" subtitle="Partes, resumenes y exportaciones">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
            <strong className="block text-2xl font-black text-accent">{filteredOrders.length}</strong>
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
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-primary">
              <Filter size={23} />
            </div>
            <div>
              <h2 className="text-xl font-black">Filtro de informe</h2>
              <p className="text-sm font-semibold text-slate-500">Todos los informes y exportaciones usan estos datos.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Tipo" value={typeFilter} onChange={setTypeFilter}>
              {TYPE_FILTERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </SelectField>
            <SelectField label="Instalacion" value={installationFilter} onChange={setInstallationFilter}>
              <option value="todas">Todas</option>
              {installations.map((installation) => <option key={installation.id} value={installation.id}>{installation.name}</option>)}
            </SelectField>
            <DateField label="Desde" value={dateFrom} onChange={setDateFrom} />
            <DateField label="Hasta" value={dateTo} onChange={setDateTo} />
          </div>
        </Card>

        <Card className="bg-[radial-gradient(circle_at_top_left,#155E75,#173B72_50%,#071426)] text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-cyan-200">Panel filtrado</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">Actividad de mantenimiento</h2>
              <p className="mt-2 font-semibold text-white/70">Correctivos, preventivos, visitas y cierre del periodo.</p>
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
            <span>{open} abiertas</span>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-100 text-red-700"><Wrench size={22} /></div>
            <p className="mt-3 text-xs font-black uppercase text-slate-500">Correctivos</p>
            <strong className="text-2xl font-black">{corrective.length}</strong>
          </Card>
          <Card className="p-4">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-blue-700"><ShieldCheck size={22} /></div>
            <p className="mt-3 text-xs font-black uppercase text-slate-500">Preventivos</p>
            <strong className="text-2xl font-black">{preventive.length}</strong>
          </Card>
          <Card className="p-4">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><ClipboardCheck size={22} /></div>
            <p className="mt-3 text-xs font-black uppercase text-slate-500">Visitas</p>
            <strong className="text-2xl font-black">{visits.length}</strong>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <h2 className="text-xl font-black">Informes disponibles</h2>
            <StatusBadge status={filteredOrders.length ? "Listo" : "Sin datos"} />
          </div>

          <ReportCard icon={ClipboardCheck} tone="bg-red-100 text-red-700" title="Partes correctivos" text="Intervenciones, tiempos, evidencias y estado de incidencias." metric={corrective.length} detail="intervenciones" actionLabel="Generar PDF" onClick={() => generateCorrectiveReport(filteredOrders, settings)}>
            <StatusBadge status={corrective.length ? "PDF" : "Sin datos"} />
          </ReportCard>

          <ReportCard icon={ShieldCheck} tone="bg-blue-100 text-blue-700" title="Partes preventivos" text="Planes ejecutados, tareas pendientes y cumplimiento previsto." metric={`${percent(preventive.filter((order) => order.status === "Completada" || order.status === "Cerrada").length, preventive.length)}%`} detail="cumplimiento" actionLabel="Generar PDF" onClick={() => generatePreventiveReport(filteredOrders, settings)}>
            <StatusBadge status={preventive.length ? "PDF" : "Sin datos"} />
          </ReportCard>

          <ReportCard icon={ClipboardCheck} tone="bg-emerald-100 text-emerald-700" title="Partes de visita" text="Visitas realizadas, tecnico, centro, estado y observaciones." metric={visits.length} detail="visitas" actionLabel="Generar PDF" onClick={() => generateVisitReport(filteredOrders, settings)}>
            <StatusBadge status={visits.length ? "PDF" : "Sin datos"} />
          </ReportCard>

          <ReportCard icon={BarChart3} tone="bg-amber-100 text-amber-700" title="Informe mensual" text="Resumen operativo del periodo con volumen, cierre y prioridades." metric={`${completion}%`} detail="ordenes cerradas" actionLabel="Generar PDF" onClick={() => generateMonthlyReport(filteredOrders, settings)}>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-sm font-black text-amber-700"><TimerReset size={16} />Periodo</div>
          </ReportCard>

          <ReportCard icon={Building2} tone="bg-purple-100 text-purple-700" title="Informe por instalacion" text="Estado de activos, OTs abiertas y actividad por centro." metric={filteredOrders.filter((order) => order.installationId === topInstallation?.id).length || 0} detail={topInstallation?.name || "sin centro"} actionLabel="Generar PDF" onClick={() => generateInstallationReport(filteredOrders, topInstallation, settings)}>
            <StatusBadge status={topInstallation?.status || "Sin datos"} />
          </ReportCard>

          <ReportCard icon={FileSpreadsheet} tone="bg-slate-100 text-slate-800" title="Exportar CSV" text="Tabla compatible con Excel para revisar, filtrar o enviar." metric="CSV" detail={`${filteredOrders.length} ordenes`} actionLabel="Exportar" onClick={() => exportWorkOrdersCsv(filteredOrders)}>
            <Download className="text-slate-600" size={24} />
          </ReportCard>

          <ReportCard icon={FileJson} tone="bg-slate-100 text-slate-800" title="Exportar JSON" text="Copia del informe filtrado con estadisticas y datos operativos." metric="JSON" detail="informe local" actionLabel="Exportar" onClick={() => exportReportJson({ workOrders: filteredOrders, installations, filters: { typeFilter, installationFilter, dateFrom, dateTo }, stats })}>
            <FileText className="text-slate-600" size={24} />
          </ReportCard>
        </section>
      </main>
    </>
  );
}
