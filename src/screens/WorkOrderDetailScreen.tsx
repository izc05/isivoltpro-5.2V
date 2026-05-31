import { BriefcaseBusiness, Building2, CalendarDays, Camera, CheckCircle2, ClipboardCheck, Edit3, Flag, MapPin, PackagePlus, Play, Trash2, UserPlus, Wrench, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EditWorkOrderModal from "../components/workOrder/EditWorkOrderModal";
import { formatDateTime, toDateInputValue } from "../utils/dates";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PhotoTile({ photo, index }: any) {
  const labels: any = {
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

function normalizeMaterials(materials: any[] = []) {
  return materials.map((item, index) => ({
    id: item.id || `material-${index}`,
    type: item.type || item.name || "",
    quantity: item.quantity || "",
  }));
}

export default function WorkOrderDetailScreen({ order, installations, technicians, onBack, onUpdateStatus, onSaveWorkOrder, onDeleteWorkOrder }: any) {
  const [editing, setEditing] = useState(false);
  const materials = normalizeMaterials(order?.materials || []).filter((item) => item.type || item.quantity);
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

  const addPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            <div className={`grid h-16 w-16 place-items-center rounded-2xl ${order.type === "Correctiva" ? "bg-red-500/20 text-red-100" : order.type === "Parte de visita" ? "bg-emerald-400/20 text-emerald-100" : "bg-accent/20 text-accent"}`}>
              {order.type === "Correctiva" ? <Wrench size={34} /> : order.type === "Parte de visita" ? <ClipboardCheck size={34} /> : <BriefcaseBusiness size={34} />}
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
          {rows.map(([Icon, label, value]: any) => (
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
          <div className="mt-5">
            <h2 className="text-lg font-black">Material instalado</h2>
            {materials.length ? (
              <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                {materials.map((material: any) => (
                  <div key={material.id} className="grid grid-cols-[32px_minmax(0,1fr)_88px] items-center gap-3 bg-white px-4 py-3">
                    <PackagePlus className="text-primary" size={20} />
                    <strong className="truncate text-slate-800">{material.type || "Material"}</strong>
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-center text-sm font-black text-slate-600">{material.quantity || "-"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-4 text-center font-bold text-slate-500">Sin material instalado</p>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Fotos</h2>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-accent px-3 py-2 text-sm font-black text-primary">
              <Camera size={18} />
              Subir
              <input className="hidden" type="file" accept="image/*" multiple onChange={addPhotos} />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {order.photos.length ? order.photos.map((photo: any, index: number) => <PhotoTile key={`${photo}-${index}`} photo={photo} index={index} />) : (
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
        <EditWorkOrderModal
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
