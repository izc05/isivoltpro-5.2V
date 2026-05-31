import { ShieldCheck, Snowflake, Droplet, FlameKindling, Zap, Wrench, X, Plus } from "lucide-react";
import Button from "../Button";

export const specialtyIcons: any = {
  Electricidad: Zap,
  Climatizacion: Snowflake,
  Fontaneria: Droplet,
  PCI: FlameKindling,
};

export const specialtyTones: any = {
  Electricidad: "bg-orange-100 text-orange-700",
  Climatizacion: "bg-blue-100 text-blue-700",
  Fontaneria: "bg-cyan-100 text-cyan-700",
  PCI: "bg-red-100 text-red-700",
  General: "bg-slate-100 text-slate-700",
};

export const specialtyValues: any = {
  Electricidad: "electricidad",
  Climatizacion: "climatizacion",
  Fontaneria: "fontaneria",
  PCI: "pci",
  General: "general",
};

export function getAssetSpecialtyLabel(asset: any) {
  return Object.entries(specialtyValues).find(([, value]) => value === asset.specialty)?.[0] || "General";
}

export function AssetVisual({ asset, size = "large" }: any) {
  const label = getAssetSpecialtyLabel(asset);
  const Icon = specialtyIcons[label] || Wrench;
  const dimensions = size === "small" ? "h-20 w-20 rounded-2xl" : "h-32 w-full rounded-3xl";
  if (asset.imageUrl) {
    return <img className={`${dimensions} shrink-0 object-cover`} src={asset.imageUrl} alt="" />;
  }
  return (
    <div className={`${dimensions} grid shrink-0 place-items-center bg-[radial-gradient(circle_at_top_left,#e0f2fe,#dbeafe_48%,#f8fafc)] text-primary`}>
      <Icon size={size === "small" ? 30 : 44} strokeWidth={2.4} />
    </div>
  );
}

export default function SpecialtySheet({ specialty, assets, workOrders, onClose, onCreateWorkOrder, onOpenAsset, onOpenWorkOrder }: any) {
  const isAll = specialty === "Todos";
  const rawSpecialty = specialtyValues[specialty] || specialty.toLowerCase();
  const specialtyAssets = isAll ? assets : assets.filter((asset: any) => asset.specialty === rawSpecialty);
  const specialtyOrders = (isAll ? workOrders : workOrders.filter((order: any) => order.rawSpecialty === rawSpecialty)).slice(0, 4);
  const Icon = isAll ? ShieldCheck : specialtyIcons[specialty] || Wrench;

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 mx-auto flex w-full max-w-md items-end bg-black/45">
      <div className="max-h-[82vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${specialtyTones[specialty] || "bg-slate-100 text-slate-700"}`}>
              <Icon size={28} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black">{isAll ? "Activos" : specialty}</h2>
              <p className="font-semibold text-slate-500">{specialtyAssets.length} activos · {specialtyOrders.length} OTs recientes</p>
            </div>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100" onClick={onClose} aria-label="Cerrar">
            <X size={23} />
          </button>
        </div>

        <div className="space-y-5">
          <section>
            <h3 className="mb-3 text-lg font-black">Activos</h3>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100">
              {specialtyAssets.length ? (
                specialtyAssets.map((asset: any) => (
                  <button key={asset.id} className="w-full px-4 py-4 text-left" onClick={() => onOpenAsset(asset)}>
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4">
                      <AssetVisual asset={asset} size="small" />
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <strong className="block text-lg leading-tight">{asset.name}</strong>
                          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{asset.status}</span>
                        </div>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-500">{asset.location}</p>
                        <p className="mt-1 text-xs font-black uppercase text-primary/70">{asset.code}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-sm font-semibold text-slate-500">Todavia no hay activos registrados en esta especialidad.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-black">Ordenes relacionadas</h3>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100">
              {specialtyOrders.length ? (
                specialtyOrders.map((order: any) => (
                  <button key={order.id} className="w-full px-4 py-4 text-left" onClick={() => onOpenWorkOrder(order.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block text-primaryDark">{order.number}</strong>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-500">{order.title}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{order.status}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-sm font-semibold text-slate-500">No hay ordenes recientes para esta especialidad.</p>
              )}
            </div>
          </section>

          <Button icon={Plus} className="w-full" onClick={onCreateWorkOrder}>
            {isAll ? "Crear OT" : `Crear OT de ${specialty}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
