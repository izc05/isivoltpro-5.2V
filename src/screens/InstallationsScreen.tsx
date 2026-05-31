import { ChevronRight, Edit3, Plus, Search, ShieldCheck, Building2, MapPin, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import InstallationFormModal, { INSTALLATION_STATUSES, INSTALLATION_TYPES } from "../components/InstallationFormModal";

const filters = [
  { id: "todas", label: "Todas" },
  ...INSTALLATION_TYPES.map((item) => ({ id: `type:${item.value}`, label: item.label })),
  ...INSTALLATION_STATUSES.map((item) => ({ id: `status:${item.value}`, label: item.label })),
];

function InstallationVisual({ visual }) {
  const icons = {
    hospital: Building2,
    clinic: Building2,
    residence: Building2,
    sports: ShieldCheck,
    school: Building2,
  };
  const Icon = icons[visual] || Building2;
  return (
    <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-[radial-gradient(circle_at_top_left,#155E75,#173B72)] text-cyan-200">
      <Icon size={46} strokeWidth={2.2} />
    </div>
  );
}

function matchesFilter(installation, filter) {
  if (filter === "todas") return true;
  const [kind, value] = filter.split(":");
  if (kind === "type") return installation.type === value;
  if (kind === "status") return installation.rawStatus === value;
  return true;
}

function matchesQuery(installation, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    installation.name,
    installation.address,
    installation.rawAddress,
    installation.responsible,
    installation.city,
    installation.type,
    installation.status,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
}

function getInstallationStripe(type) {
  const tones = {
    hospital: "from-sky-400 to-cyan-300",
    centro_especialidades: "from-violet-400 to-sky-300",
    residencia: "from-amber-300 to-orange-300",
    polideportivo: "from-emerald-300 to-cyan-300",
    colegio: "from-fuchsia-300 to-violet-300",
  };
  return tones[type] || "from-cyan-300 to-sky-300";
}

export default function InstallationsScreen({ installations, assets, workOrders, onOpenInstallation, onSaveInstallation, onDeleteInstallation }) {
  const [activeFilter, setActiveFilter] = useState("todas");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [editingInstallation, setEditingInstallation] = useState(null);

  const visibleInstallations = useMemo(
    () => installations.filter((installation) => matchesFilter(installation, activeFilter) && matchesQuery(installation, query)),
    [installations, activeFilter, query]
  );

  const closeModal = () => setEditingInstallation(null);
  const saveInstallation = (form) => {
    onSaveInstallation(editingInstallation?.id || null, form);
    closeModal();
  };

  const askDelete = (installation) => {
    const assetCount = assets.filter((asset) => asset.installationId === installation.id).length;
    const orderCount = workOrders.filter((order) => order.installationId === installation.id).length;
    const message =
      assetCount || orderCount
        ? "Esta instalacion tiene activos u ordenes asociadas. ¿Seguro que quieres eliminarla?"
        : `¿Seguro que quieres eliminar ${installation.name}?`;
    if (window.confirm(message)) onDeleteInstallation(installation.id);
  };

  return (
    <>
      <Header
        title="Instalaciones"
        subtitle={`${visibleInstallations.length} de ${installations.length} guardadas localmente`}
        eyebrow="Plan Pro"
        actions={
          <>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={() => setSearchOpen((value) => !value)} aria-label="Buscar">
              {searchOpen ? <X size={24} /> : <Search size={24} />}
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-amber-300 text-slate-950" onClick={() => setEditingInstallation({})} aria-label="Nueva instalacion">
              <Plus size={26} />
            </button>
          </>
        }
      />
      <main className="space-y-5 px-5 pb-32 pt-6">
        {searchOpen ? (
          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-soft">
            <Search className="text-primary" size={21} />
            <input
              className="min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-slate-400"
              value={query}
              autoFocus
              placeholder="Buscar por nombre, direccion, responsable, localidad o tipo"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex items-center justify-between px-1 text-xs font-black uppercase tracking-wide text-slate-500">
            <span>Filtros</span>
            <span>Desliza para buscar</span>
          </div>
          <div className="relative -mx-5">
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={
                    filter.id === activeFilter
                      ? "shrink-0 rounded-2xl bg-gradient-to-r from-cyan-300 to-sky-300 px-6 py-3 font-black text-slate-950"
                      : "shrink-0 rounded-2xl border border-sky-200 bg-white px-6 py-3 font-black text-primary"
                  }
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 bg-gradient-to-l from-appBg to-transparent" />
          </div>
        </div>

        <div className="space-y-4">
          {visibleInstallations.map((installation) => (
            <Card key={installation.id} className="overflow-hidden p-0">
              <div className={`h-2 bg-gradient-to-r ${getInstallationStripe(installation.type)}`} />
              <div className="flex w-full items-center gap-4 p-4 text-left">
                {installation.imageUrl ? (
                  <button onClick={() => onOpenInstallation(installation.id)} aria-label={`Imagen de ${installation.name}`}>
                    <img className="h-28 w-28 shrink-0 rounded-3xl object-cover" src={installation.imageUrl} alt="" />
                  </button>
                ) : (
                  <button onClick={() => onOpenInstallation(installation.id)} aria-label={`Imagen de ${installation.name}`}>
                    <InstallationVisual visual={installation.visual} />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => onOpenInstallation(installation.id)} aria-label={`Abrir ficha de ${installation.name}`}>
                    <h2 className="text-xl font-black leading-tight">{installation.name}</h2>
                    <StatusBadge status={installation.status} className="shrink-0" />
                  </button>
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-primary/60">{INSTALLATION_TYPES.find((item) => item.value === installation.type)?.label || "Instalacion"}</p>
                  <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-slate-500">
                    <MapPin className="mt-0.5 shrink-0 text-primary" size={17} />
                    {installation.address}
                  </p>
                  <div className="mt-4 flex items-center justify-between font-bold text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck size={18} className="text-primary" />
                      {installation.assetsCount} activos
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700" onClick={() => setEditingInstallation(installation)} aria-label={`Editar ${installation.name}`}>
                        <Edit3 size={17} />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-700" onClick={() => askDelete(installation)} aria-label={`Borrar ${installation.name}`}>
                        <Trash2 size={17} />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-100 text-cyan-800" onClick={() => onOpenInstallation(installation.id)} aria-label={`Entrar en ${installation.name}`}>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {!visibleInstallations.length ? (
            <Card className="py-10 text-center">
              <Building2 className="mx-auto text-primary" size={38} />
              <h2 className="mt-3 text-xl font-black">Sin instalaciones</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Prueba otra busqueda o crea una instalacion nueva.</p>
            </Card>
          ) : null}
        </div>
      </main>
      {editingInstallation ? <InstallationFormModal installation={editingInstallation.id ? editingInstallation : null} onClose={closeModal} onSave={saveInstallation} /> : null}
    </>
  );
}
