import { Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import Button from "../Button";
import { toDateInputValue } from "../../utils/dates";

const TYPE_OPTIONS = ["Parte de visita", "Correctiva", "Preventiva"];
const STATUS_OPTIONS = ["Pendiente", "Asignada", "En curso", "Observada", "Demorada", "Completada", "Cerrada"];
const SPECIALTY_OPTIONS = ["Electricidad", "Climatizacion", "Fontaneria", "PCI", "Mecanica", "General"];
const PRIORITY_OPTIONS = ["Baja", "Media", "Alta", "Urgente"];

function normalizeMaterials(materials: any[] = []) {
  return materials.map((item, index) => ({
    id: item.id || `material-${index}`,
    type: item.type || item.name || "",
    quantity: item.quantity || "",
  }));
}

export default function EditWorkOrderModal({ order, installations, technicians, onClose, onSave }: any) {
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
    materials: normalizeMaterials(order.materials || []),
    initialPhotos: order.initialPhotos || [],
    finalPhotos: order.finalPhotos || [],
  });

  const update = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }));

  const addMaterial = () => {
    setForm((current) => ({
      ...current,
      materials: [
        ...current.materials,
        { id: `material-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: "", quantity: "1" },
      ],
    }));
  };
  const updateMaterial = (id: string, key: string, value: any) => {
    setForm((current) => ({
      ...current,
      materials: current.materials.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };
  const removeMaterial = (id: string) => {
    setForm((current) => ({
      ...current,
      materials: current.materials.filter((item) => item.id !== id),
    }));
  };

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
            <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 font-bold outline-none focus:border-accent" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Tipo</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.type} onChange={(e) => update("type", e.target.value)}>
                {TYPE_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Estado</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.status} onChange={(e) => update("status", e.target.value)}>
                {STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Instalacion</span>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.installationId} onChange={(e) => update("installationId", e.target.value)}>
              {installations.map((inst: any) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Especialidad</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.specialty} onChange={(e) => update("specialty", e.target.value)}>
                {SPECIALTY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-black text-slate-700">Prioridad</span>
              <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.priority} onChange={(e) => update("priority", e.target.value)}>
                {PRIORITY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Tecnico asignado</span>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent" value={form.technician} onChange={(e) => update("technician", e.target.value)}>
              <option value="">Sin asignar</option>
              {technicians.map((tech: any) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Ubicacion</span>
            <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 font-bold outline-none focus:border-accent" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </label>

          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <label className="block min-w-0">
              <span className="mb-1 block font-black text-slate-700">Fecha</span>
              <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-3 font-bold outline-none focus:border-accent" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-black text-slate-700">Hora</span>
              <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-3 font-bold outline-none focus:border-accent" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
            </label>
            <label className="col-span-2 block min-w-0">
              <span className="mb-1 block font-black text-slate-700">Minutos trabajados</span>
              <input className="min-h-12 w-full rounded-2xl border border-slate-200 px-3 font-bold outline-none focus:border-accent" type="number" min="0" value={form.timeSpentMinutes} onChange={(e) => update("timeSpentMinutes", e.target.value)} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Descripcion</span>
            <textarea className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-accent" value={form.description} onChange={(e) => update("description", e.target.value)} />
          </label>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Trabajo realizado</span>
            <textarea className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-accent" value={form.actionTaken} onChange={(e) => update("actionTaken", e.target.value)} />
          </label>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-800">Material instalado</h3>
                <p className="text-sm font-semibold text-slate-500">Solo tipo y cantidad, sin precios.</p>
              </div>
              <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-soft" onClick={addMaterial} aria-label="Añadir material">
                <Plus size={22} />
              </button>
            </div>
            <div className="space-y-3">
              {form.materials.map((material: any) => (
                <div key={material.id} className="grid grid-cols-[minmax(0,1fr)_84px_40px] gap-2">
                  <input className="min-h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 font-bold outline-none focus:border-accent" placeholder="Ej: Filtro, lampara, valvula" value={material.type} onChange={(e) => updateMaterial(material.id, "type", e.target.value)} />
                  <input className="min-h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-center font-bold outline-none focus:border-accent" placeholder="Cant." value={material.quantity} onChange={(e) => updateMaterial(material.id, "quantity", e.target.value)} />
                  <button type="button" className="grid h-11 w-10 place-items-center rounded-2xl bg-red-50 text-red-700" onClick={() => removeMaterial(material.id)} aria-label="Quitar material">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {!form.materials.length ? (
                <button type="button" className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-black text-slate-500" onClick={addMaterial}>
                  Añadir material instalado
                </button>
              ) : null}
            </div>
          </section>

          <label className="block">
            <span className="mb-1 block font-black text-slate-700">Observaciones</span>
            <textarea className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-accent" value={form.observations} onChange={(e) => update("observations", e.target.value)} />
          </label>

          <Button icon={Save} className="w-full" onClick={save}>Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}
