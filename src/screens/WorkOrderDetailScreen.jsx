import { BriefcaseBusiness, Building2, CalendarDays, Camera, CheckCircle2, Edit3, Flag, MapPin, Play, Save, Trash2, UserPlus, Wrench, X, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime, toDateInputValue } from "../utils/dates";

const TYPE_OPTIONS = ["Correctiva", "Preventiva"];
const STATUS_OPTIONS = ["Pendiente", "Asignada", "En curso", "Observada", "Demorada", "Completada", "Cerrada"];
const SPECIALTY_OPTIONS = ["Electricidad", "Climatizacion", "Fontaneria", "PCI", "Mecanica"];
const PRIORITY_OPTIONS = ["Baja", "Media", "Alta", "Urgente"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PhotoTile({ photo, index }) {
  const labels = {
    pasillo: "Pasillo sin alumbrado",
    techo: "Registro de luminaria",
    clima: "Unidad de climatizacion",
    panel: "Panel tecnico",
    bomba: "Grupo de presion",
    agua: "Zona de fuga",
    pci: "Equipo PCI",
  };

  if (photo?.startsWith("data:image")) {
    return <img className="h-32 w-full rounded-2xl object-cover" src={photo} alt={`Foto ${index + 1}`} />;
  }

  return (
    <div className="grid h-32 place-items-end overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e2e8f0,#64748b)] p-3">
      <span className="rounded-xl bg-black/40 px-3 py-1 text-xs font-black text-white">{labels[photo] || `Foto ${index + 1}`}</span>
    </div>
  );
}

function EditModal({ order, installations, technicians, onClose, onSave }) {
  const [form, setForm] = useState({
    title: order.title || "",
    type: order.type || "Correctiva",
    status: order.status || "Pendiente",
    installationId: order.installationId || installations[0]?.id || "",
    specialty: order.specialty || "Mecanica",
    location: order.location || "",
    priority: order.priority || "Media",
    technician: order.assignedTechnicianId || "",
    date: toDateInputValue(order.scheduledAt || order.createdAt || new Date()),
    time: new Date(order.scheduledAt || order.createdAt || new Date()).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    description: order.description || "",
    observations: order.observations || "",
    actionTaken: order.actionTaken || "",
    timeSpentMinutes: order.timeSpentMinutes || 0,
    initialPhotos: order.initialPhotos || [],
    finalPhotos: order.finalPhotos || [],
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = () => {
    onSave(order.id, form);
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 mx-auto flex w-full max-w-md items-end bg-black/45">
      <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Editar OT</h2>
            <p className="font-semibold text-slate-500">{order.number}</p>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100" onClick={onClose} aria-label="Cerrar">
            <X size={23} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Titulo</span>
            <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 font-bold outline-none focus:border-accent" value={form.title} onChange={(event) => update("title", event.target.value)} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Tipo</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.type} onChange={(event) => update("type", event.target.value)}>
                {TYPE_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Estado</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.status} onChange={(event) => update("status", event.target.value)}>
                {STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Instalacion</span>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.installationId} onChange={(event) => update("installationId", event.target.value)}>
              {installations.map((installation) => (
                <option key={installation.id} value={installation.id}>{installation.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Especialidad</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.specialty} onChange={(event) => update("specialty", event.target.value)}>
                {SPECIALTY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Prioridad</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
                {PRIORITY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Tecnico asignado</span>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.technician} onChange={(event) => update("technician", event.target.value)}>
              <option value="">Sin asignar</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>{technician.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Ubicacion</span>
            <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 font-bold outline-none focus:border-accent" value={form.location} onChange={(event) => update("location", event.target.value)} />
          </label>

          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <label className="block min-w-0">
              <span className="mb-1 block font-black text-slate-700">Fecha</span>
              <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-3 font-bold outline-none focus:border-accent" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-black text-slate-700">Hora</span>
              <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-3 font-bold outline-none focus:border-accent" type="time" value={form.time} onChange={(event) => update("time", event.target.value)} />
            </label>
            <label className="col-span-2 block min-w-0">
              <span className="mb-1 block font-black text-slate-700">Minutos trabajados</span>
              <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-3 font-bold outline-none focus:border-accent" type="number" min="0" value={form.timeSpentMinutes} onChange={(event) => update("timeSpentMinutes", event.target.value)} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Descripcion</span>
            <textarea className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-accent" value={form.description} onChange={(event) => update("description", event.target.value)} />
          </label>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Trabajo realizado</span>
            <textarea className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-accent" value={form.actionTaken} onChange={(event) => update("actionTaken", event.target.value)} />
          </label>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Observaciones</span>
            <textarea className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-accent" value={form.observations} onChange={(event) => update("observations", event.target.value)} />
          </label>

          <Button icon={Save} className="w-full" onClick={save}>Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkOrderDetailScreen({ order, installations, technicians, onBack, onUpdateStatus, onSaveWorkOrder, onDeleteWorkOrder }) {
  const [editing, setEditing] = useState(false);
  const rows = useMemo(() => [
    [Building2, "Instalacion", order?.installation],
    [Zap, "Especialidad", order?.specialty],
    [MapPin, "Ubicacion", order?.location],
    [Flag, "Prioridad", order?.priority],
    [UserPlus, "Tecnico asignado", order?.technician],
    [CalendarDays, "Fecha prevista", order ? formatDateTime(order.scheduledAt || order.createdAt) : ""],
  ], [order]);

  if (!order) {
    return (
      <>
        <Header title="OT no encontrada" subtitle="La orden ya no existe" onBack={onBack} />
        <main className="px-5 py-8">
          <Button className="w-full" onClick={onBack}>Volver</Button>
        </main>
      </>
    );
  }

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const photos = await Promise.all(files.map(fileToDataUrl));
    onSaveWorkOrder(order.id, {
      ...order,
      type: order.type,
      status: order.status,
      specialty: order.specialty,
      priority: order.priority,
      technician: order.assignedTechnicianId,
      date: toDateInputValue(order.scheduledAt || order.createdAt),
      time: new Date(order.scheduledAt || order.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      initialPhotos: [...(order.initialPhotos || []), ...photos],
      finalPhotos: order.finalPhotos || [],
    });
    event.target.value = "";
  };

  const removeOrder = () => {
    const confirmed = window.confirm(`Se borrara ${order.number}. ¿Quieres continuar?`);
    if (confirmed) onDeleteWorkOrder(order.id);
  };

  return (
    <>
      <Header
        title={order.number}
        subtitle={`${order.type} - ${order.installation}`}
        onBack={onBack}
        actions={
          <>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={() => setEditing(true)} aria-label="Editar">
              <Edit3 size={22} />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-danger ring-1 ring-white/20" onClick={removeOrder} aria-label="Eliminar">
              <Trash2 size={22} />
            </button>
          </>
        }
      >
        <div className="overflow-hidden rounded-3xl border border-accent/35 bg-white/8 shadow-soft">
          {order.installationImageUrl ? (
            <div className="relative h-28">
              <img className="h-full w-full object-cover opacity-75" src={order.installationImageUrl} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-primaryDark via-primaryDark/45 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-accent">{order.installation}</p>
                  <p className="truncate text-xs font-semibold text-white/75">{order.installationAddress}</p>
                </div>
                <StatusBadge status={order.status} className="shrink-0" />
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-4 p-5">
            <div className={`grid h-16 w-16 place-items-center rounded-2xl ${order.type === "Correctiva" ? "bg-red-500/20 text-red-100" : "bg-accent/20 text-accent"}`}>
              {order.type === "Correctiva" ? <Wrench size={34} /> : <BriefcaseBusiness size={34} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate text-2xl font-black">{order.type}</h2>
                {!order.installationImageUrl ? <StatusBadge status={order.status} /> : null}
              </div>
              <p className="mt-1 text-base font-semibold text-white/78">{order.title}</p>
            </div>
          </div>
        </div>
      </Header>

      <main className="-mt-5 space-y-4 px-5 pb-48">
        <Card className="divide-y divide-slate-100 p-0">
          {rows.map(([Icon, label, value]) => (
            <div key={label} className="grid grid-cols-[28px_1fr_1.2fr] items-center gap-3 px-5 py-4">
              <Icon className="text-slate-700" size={22} />
              <span className="font-semibold text-slate-500">{label}</span>
              <strong className="text-right leading-tight">{value}</strong>
            </div>
          ))}
        </Card>

        <Card>
          <h2 className="text-lg font-black">Descripcion</h2>
          <p className="mt-3 rounded-2xl bg-slate-50 p-4 font-semibold leading-relaxed text-slate-600">{order.description}</p>
          {order.actionTaken ? (
            <>
              <h2 className="mt-5 text-lg font-black">Trabajo realizado</h2>
              <p className="mt-3 rounded-2xl bg-cyan-50 p-4 font-semibold leading-relaxed text-slate-700">{order.actionTaken}</p>
            </>
          ) : null}
          {order.observations ? (
            <>
              <h2 className="mt-5 text-lg font-black">Observaciones</h2>
              <p className="mt-3 rounded-2xl bg-amber-50 p-4 font-semibold leading-relaxed text-slate-700">{order.observations}</p>
            </>
          ) : null}
          <div className="mt-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Fotos</h2>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-accent px-3 py-2 text-sm font-black text-primary">
              <Camera size={18} />
              Subir
              <input className="hidden" type="file" accept="image/*" multiple onChange={addPhotos} />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {order.photos.length ? order.photos.map((photo, index) => <PhotoTile key={`${photo}-${index}`} photo={photo} index={index} />) : (
              <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 p-5 text-center font-bold text-slate-500">Sin fotos adjuntas</div>
            )}
          </div>
        </Card>

        {order.rawStatus !== "completada" && order.rawStatus !== "cerrada" && (
          <div className="sticky bottom-28 z-30 grid grid-cols-2 gap-3 rounded-[28px] bg-appBg/95 py-3 backdrop-blur">
            {order.rawStatus !== "en_curso" && (
              <Button icon={Play} variant="dark" onClick={() => onUpdateStatus(order.id, "En curso")}>
                En curso
              </Button>
            )}
            <Button icon={CheckCircle2} className={order.rawStatus === "en_curso" ? "col-span-2" : ""} onClick={() => onUpdateStatus(order.id, "Completada")}>
              Completar
            </Button>
          </div>
        )}
      </main>

      {editing ? (
        <EditModal
          order={order}
          installations={installations}
          technicians={technicians}
          onClose={() => setEditing(false)}
          onSave={onSaveWorkOrder}
        />
      ) : null}
    </>
  );
}
