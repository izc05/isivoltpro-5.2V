import { CalendarPlus, ChevronLeft, ChevronRight, ClipboardCheck, MapPin, Plus, Settings, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { formatLongDay, formatMonthYear, getWeekDays, toDateInputValue } from "../utils/dates";

export default function AgendaScreen({ workOrders, onOpenWorkOrder, onNewWorkOrder }: any) {
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [viewMode, setViewMode] = useState<"dia" | "mes">("dia");
  const days = getWeekDays(selectedDate);
  const monthDays = useMemo(() => {
    const selected = new Date(selectedDate);
    const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const start = new Date(first);
    const offset = first.getDay() || 7;
    start.setDate(first.getDate() - offset + 1);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const value = toDateInputValue(date);
      return {
        value,
        day: date.getDate(),
        currentMonth: date.getMonth() === selected.getMonth(),
        selected: value === selectedDate,
        count: workOrders.filter((order) => toDateInputValue(order.scheduledAt || order.createdAt) === value).length,
      };
    });
  }, [selectedDate, workOrders]);
  const agenda = useMemo(
    () =>
      workOrders
        .filter((order) => toDateInputValue(order.scheduledAt || order.createdAt) === selectedDate)
        .sort((a, b) => new Date(a.scheduledAt || a.createdAt).getTime() - new Date(b.scheduledAt || b.createdAt).getTime()),
    [selectedDate, workOrders]
  );

  const getAgendaTone = (order) =>
    order.type === "Correctiva" ? "bg-red-100 text-red-600" : order.type === "Parte de visita" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700";
  const changeMonth = (amount: number) => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() + amount);
    setSelectedDate(toDateInputValue(date));
  };

  return (
    <>
      <Header
        title="Calendario"
        subtitle={formatMonthYear(selectedDate)}
        actions={
          <button
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20"
            onClick={() => alert("Utilidad pendiente: aqui se configuraran vistas de agenda, avisos y recordatorios.")}
            aria-label="Ajustes agenda"
          >
            <Settings size={24} />
          </button>
        }
      >
        <div className="mb-3 grid grid-cols-2 rounded-2xl bg-white/10 p-1 ring-1 ring-white/15">
          {["dia", "mes"].map((mode) => (
            <button key={mode} className={viewMode === mode ? "rounded-xl bg-white px-3 py-2 text-sm font-black text-primaryDark" : "px-3 py-2 text-sm font-black text-white"} onClick={() => setViewMode(mode as "dia" | "mes")}>
              {mode === "dia" ? "Dia" : "Mes"}
            </button>
          ))}
        </div>
        <div className="rounded-3xl bg-white p-3 text-appText shadow-soft">
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDate(day.value)}
                className={day.selected ? "rounded-2xl bg-primaryDark px-1 py-3 text-cyan-200 shadow-soft" : "rounded-2xl px-1 py-3"}
              >
                <span className="block text-xs font-black text-slate-500">{day.label}</span>
                <strong className="mt-2 block text-lg font-black">{day.day}</strong>
                {day.selected ? <span className="mx-auto mt-1 block h-2 w-2 rounded-full bg-amber-300" /> : null}
              </button>
            ))}
          </div>
        </div>
      </Header>

      <main className="relative space-y-4 px-5 pb-32 pt-6">
        {viewMode === "mes" ? (
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <button className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-primary" onClick={() => changeMonth(-1)}><ChevronLeft size={22} /></button>
              <strong className="text-lg capitalize">{formatMonthYear(selectedDate)}</strong>
              <button className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-primary" onClick={() => changeMonth(1)}><ChevronRight size={22} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-500">
              {["L", "M", "X", "J", "V", "S", "D"].map((label) => <span key={label}>{label}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => (
                <button key={day.value} className={day.selected ? "min-h-14 rounded-2xl bg-primaryDark p-1 text-cyan-200" : day.currentMonth ? "min-h-14 rounded-2xl bg-slate-50 p-1 text-slate-800" : "min-h-14 rounded-2xl bg-white p-1 text-slate-300"} onClick={() => setSelectedDate(day.value)}>
                  <strong className="block text-sm">{day.day}</strong>
                  {day.count ? <span className="mx-auto mt-1 grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1 text-[11px] font-black text-primaryDark">{day.count}</span> : null}
                </button>
              ))}
            </div>
          </Card>
        ) : null}
        <h2 className="px-1 text-2xl font-black capitalize">{formatLongDay(selectedDate)}</h2>
        {agenda.length ? <div className="absolute bottom-36 left-8 top-20 w-px bg-slate-200" /> : null}
        {agenda.map((order) => (
          <div key={order.id} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3">
            <span className="mt-11 h-4 w-4 rounded-full border-4 border-appBg bg-cyan-400" />
            <Card className="p-3">
              <button
                className="grid w-full grid-cols-[66px_minmax(0,1fr)_18px] items-center gap-3 text-left"
                onClick={() => onOpenWorkOrder(order.id)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl ${getAgendaTone(order)}`}>
                    {order.type === "Correctiva" ? <Zap size={30} /> : order.type === "Parte de visita" ? <ClipboardCheck size={30} /> : <CalendarPlus size={30} />}
                  </div>
                  <strong className="text-base font-black text-primaryDark">{order.time}</strong>
                </div>
                <div className="min-w-0 border-l border-slate-100 pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="block text-base font-black leading-tight text-primaryDark">{order.number}</strong>
                    <StatusBadge status={order.status} className="shrink-0 text-xs" />
                  </div>
                  <p className="mt-1 truncate font-semibold text-slate-600">{order.title}</p>
                  <div className="mt-2 flex min-w-0 items-center gap-2">
                    <StatusBadge status={order.type === "Parte de visita" ? "Visita" : order.type === "Correctiva" ? "Correctivo" : "Preventivo"} className="shrink-0 text-xs" />
                    <span className="flex min-w-0 items-center gap-1 text-sm font-semibold text-slate-500">
                      <MapPin size={16} className="shrink-0 text-blue-600" />
                      <span className="truncate">{order.installation}</span>
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-slate-500" />
              </button>
            </Card>
          </div>
        ))}
        {!agenda.length ? (
          <Card className="py-8 text-center">
            <h3 className="text-xl font-black">Sin trabajos este dia</h3>
            <p className="mt-2 font-semibold text-slate-500">Crea una OT o cambia la fecha para ver la agenda.</p>
          </Card>
        ) : null}
        <div className="flex justify-end pr-1 pt-1">
          <button
            className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-amber-300 text-slate-950 shadow-soft"
            onClick={onNewWorkOrder}
            aria-label="Nueva orden"
          >
            <Plus size={34} />
          </button>
        </div>
      </main>
    </>
  );
}
