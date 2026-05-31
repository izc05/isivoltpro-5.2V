import { BriefcaseBusiness, CalendarDays, ChevronRight, Droplet, Edit3, FlameKindling, MapPin, PackagePlus, Phone, Plus, ShieldCheck, Snowflake, Trash2, User, Wrench, X, Zap } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import InstallationFormModal from "../components/InstallationFormModal";
import AssetFormModal from "../components/AssetFormModal";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/dates";

const specialtyIcons = {
  Electricidad: Zap,
  Climatizacion: Snowflake,
  Fontaneria: Droplet,
  PCI: FlameKindling,
};

const summaryTones = {
  Activos: "bg-blue-100 text-blue-700",
  Preventivos: "bg-orange-100 text-orange-700",
  Correctivos: "bg-red-100 text-red-700",
  "OT abiertas": "bg-purple-100 text-purple-700",
};

const specialtyTones = {
  Electricidad: "bg-orange-100 text-orange-700",
  Climatizacion: "bg-blue-100 text-blue-700",
  Fontaneria: "bg-cyan-100 text-cyan-700",
  PCI: "bg-red-100 text-red-700",
};

const specialtyValues = {
  Electricidad: "electricidad",
  Climatizacion: "climatizacion",
  Fontaneria: "fontaneria",
  PCI: "pci",
  General: "general",
};

function SpecialtySheet({ specialty, assets, workOrders, onClose, onCreateWorkOrder }) {
  const isAll = specialty === "Todos";
  const rawSpecialty = specialtyValues[specialty] || specialty.toLowerCase();
  const specialtyAssets = isAll ? assets : assets.filter((asset) => asset.specialty === rawSpecialty);
  const specialtyOrders = (isAll ? workOrders : workOrders.filter((order) => order.rawSpecialty === rawSpecialty)).slice(0, 4);
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
                specialtyAssets.map((asset) => (
                  <div key={asset.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block text-lg">{asset.name}</strong>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-500">{asset.location}</p>
                        <p className="mt-1 text-xs font-black uppercase text-primary/70">{asset.code}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{asset.status}</span>
                    </div>
                  </div>
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
                specialtyOrders.map((order) => (
                  <div key={order.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block text-primaryDark">{order.number}</strong>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-500">{order.title}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{order.status}</span>
                    </div>
                  </div>
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

function OrdersSheet({ workOrders, onClose }) {
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
            workOrders.map((order) => (
              <div key={order.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block text-primaryDark">{order.number}</strong>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-500">{order.title}</p>
                    <p className="mt-1 text-xs font-black uppercase text-primary/70">{order.specialty}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-sm font-semibold text-slate-500">Todavia no hay ordenes relacionadas con esta instalacion.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InstallationDetailScreen({ installation, assets = [], workOrders = [], onBack, onSaveInstallation, onDeleteInstallation, onSaveAsset, onCreateWorkOrder }) {
  const [editing, setEditing] = useState(false);
  const [editingAsset, setEditingAsset] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [ordersOpen, setOrdersOpen] = useState(false);
  if (!installation) return null;

  const saveInstallation = (form) => {
    onSaveInstallation(installation.id, form);
    setEditing(false);
  };

  const askDelete = () => {
    const hasRelations = assets.length || workOrders.length;
    const message = hasRelations
      ? "Esta instalacion tiene activos u ordenes asociadas. ¿Seguro que quieres eliminarla?"
      : `¿Seguro que quieres eliminar ${installation.name}?`;
    if (window.confirm(message)) onDeleteInstallation(installation.id);
  };

  const latestOrders = workOrders.slice(0, 3);

  return (
    <>
      <Header
        title="Instalacion"
        subtitle={installation.name}
        onBack={onBack}
        actions={
          <>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20" onClick={() => setEditing(true)} aria-label="Editar">
              <Edit3 size={22} />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-red-200 ring-1 ring-white/20" onClick={askDelete} aria-label="Borrar">
              <Trash2 size={22} />
            </button>
          </>
        }
      />
      <main className="-mt-8 space-y-5 px-5 pb-32">
        <Card className="relative z-10">
          <div className="grid grid-cols-[112px_1fr] gap-4">
            {installation.imageUrl ? (
              <img className="h-32 w-full rounded-3xl object-cover" src={installation.imageUrl} alt="" />
            ) : (
              <div className="grid h-32 place-items-center rounded-3xl bg-[radial-gradient(circle_at_top_left,#155E75,#173B72)] text-cyan-200">
                <ShieldCheck size={50} />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-black leading-none text-primaryDark">{installation.name}</h2>
              <p className="mt-2 font-semibold text-slate-500">Instalacion principal</p>
              <p className="mt-4 flex gap-2 text-sm font-semibold text-slate-500">
                <MapPin className="shrink-0 text-slate-600" size={18} />
                {installation.address}
              </p>
              <StatusBadge status={installation.status} className="mt-4" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button icon={Plus} onClick={onCreateWorkOrder}>
            Crear OT
          </Button>
          <Button icon={PackagePlus} variant="outline" onClick={() => setEditingAsset(true)}>
            Añadir activo
          </Button>
          <Button icon={ShieldCheck} variant="dark" onClick={() => setSelectedSpecialty("Todos")}>
            Ver activos
          </Button>
          <Button icon={BriefcaseBusiness} variant="outline" onClick={() => setOrdersOpen(true)}>
            Ver ordenes
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            ["Activos", installation.summary.assets, ShieldCheck],
            ["Preventivos", installation.summary.preventive, CalendarDays],
            ["Correctivos", installation.summary.corrective, Wrench],
            ["OT abiertas", installation.summary.openOrders, BriefcaseBusiness],
          ].map(([label, value, Icon]) => (
            <Card key={label} className="grid place-items-center px-2 py-4 text-center">
              <div className={`grid h-11 w-11 place-items-center rounded-full ${summaryTones[label]}`}>
                <Icon size={23} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
              <strong className="text-2xl font-black">{value}</strong>
            </Card>
          ))}
        </div>

        <section>
          <h2 className="mb-3 px-1 text-lg font-black">Especialidades</h2>
          <Card className="divide-y divide-slate-100 p-0">
            {installation.specialties.map((item) => {
              const Icon = specialtyIcons[item.name] || Wrench;
              return (
                <button key={item.name} className="flex w-full items-center gap-4 px-5 py-4 text-left" onClick={() => setSelectedSpecialty(item.name)}>
                  <div className={`grid h-11 w-11 place-items-center rounded-full ${specialtyTones[item.name] || "bg-slate-100 text-slate-700"}`}>
                    <Icon size={23} />
                  </div>
                  <strong className="flex-1 text-lg">{item.name}</strong>
                  <span className="font-semibold text-slate-500">{item.assets} activos</span>
                  <ChevronRight className="text-slate-500" />
                </button>
              );
            })}
          </Card>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-black">Informacion</h2>
          <Card className="divide-y divide-slate-100 p-0">
            {[
              [User, "Responsable", installation.responsible],
              [Phone, "Telefono", installation.phone],
              [MapPin, "Direccion", installation.address],
              [CalendarDays, "Ultima actualizacion", formatDateTime(installation.lastUpdate)],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4">
                <Icon className="text-slate-500" size={22} />
                <span className="flex-1 font-semibold text-slate-500">{label}</span>
                <strong className="text-right">{value}</strong>
              </div>
            ))}
          </Card>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-black">Ultimas ordenes</h2>
          <Card className="divide-y divide-slate-100 p-0">
            {latestOrders.length ? (
              latestOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-4">
                  <div className={order.rawType === "correctiva" ? "grid h-11 w-11 place-items-center rounded-2xl bg-red-100 text-red-700" : "grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700"}>
                    {order.rawType === "correctiva" ? <Wrench size={22} /> : <CalendarDays size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-primaryDark">{order.number}</strong>
                    <p className="truncate text-sm font-semibold text-slate-500">{order.title}</p>
                  </div>
                  <StatusBadge status={order.status} className="shrink-0" />
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-sm font-semibold text-slate-500">Todavia no hay ordenes relacionadas con esta instalacion.</p>
            )}
          </Card>
        </section>
        {editing ? <InstallationFormModal installation={installation} onClose={() => setEditing(false)} onSave={saveInstallation} /> : null}
        {editingAsset ? (
          <AssetFormModal
            asset={null}
            onClose={() => setEditingAsset(false)}
            onSave={(form) => {
              onSaveAsset(null, { ...form, installationId: installation.id });
              setEditingAsset(false);
            }}
          />
        ) : null}
        {selectedSpecialty ? (
          <SpecialtySheet
            specialty={selectedSpecialty}
            assets={assets}
            workOrders={workOrders}
            onClose={() => setSelectedSpecialty("")}
            onCreateWorkOrder={() => onCreateWorkOrder(selectedSpecialty === "Todos" ? {} : { specialty: selectedSpecialty })}
          />
        ) : null}
        {ordersOpen ? <OrdersSheet workOrders={workOrders} onClose={() => setOrdersOpen(false)} /> : null}
      </main>
    </>
  );
}
