import { CalendarPlus, ChevronRight, MapPin, Plus, Settings, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { formatLongDay, formatMonthYear, getWeekDays, toDateInputValue } from "../utils/dates";

export default function AgendaScreen({ workOrders, onOpenWorkOrder, onNewWorkOrder }) {
  const latestScheduled =
    workOrders
      .map((order) => order.scheduledAt || order.createdAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || new Date();
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(latestScheduled));
  const days = getWeekDays(selectedDate);
  const agenda = useMemo(
    () =>
      workOrders
        .filter((order) => toDateInputValue(order.scheduledAt || order.createdAt) === selectedDate)
        .sort((a, b) => new Date(a.scheduledAt || a.createdAt) - new Date(b.scheduledAt || b.createdAt)),
    [selectedDate, workOrders]
  );

  const getAgendaTone = (order) =>
    order.type === "Correctiva" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700";

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
                    {order.type === "Correctiva" ? <Zap size={30} /> : <CalendarPlus size={30} />}
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
                    <StatusBadge status={order.type === "Correctiva" ? "Correctivo" : "Preventivo"} className="shrink-0 text-xs" />
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
