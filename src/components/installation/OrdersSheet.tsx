import { BriefcaseBusiness, X, Wrench } from "lucide-react";
import StatusBadge from "../StatusBadge";

export default function OrdersSheet({ workOrders, onClose, onOpenWorkOrder }: any) {
  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 mx-auto flex w-full max-w-md items-end bg-black/45">
      <div className="max-h-[82vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Ordenes</h2>
            <p className="font-semibold text-slate-500">{workOrders.length} ordenes de esta instalacion</p>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100" onClick={onClose} aria-label="Cerrar">
            <X size={23} />
          </button>
        </div>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100">
          {workOrders.length ? (
            workOrders.map((order: any) => (
              <button key={order.id} className="w-full px-4 py-4 text-left" onClick={() => onOpenWorkOrder(order.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block text-primaryDark">{order.number}</strong>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-500">{order.title}</p>
                    <p className="mt-1 text-xs font-black uppercase text-primary/70">{order.specialty}</p>
                  </div>
                  <StatusBadge status={order.status} className="shrink-0" />
                </div>
              </button>
            ))
          ) : (
            <p className="px-4 py-6 text-sm font-semibold text-slate-500">Todavia no hay ordenes relacionadas con esta instalacion.</p>
          )}
        </div>
      </div>
    </div>
  );
}
