import { Check, ClipboardList, Cpu, Image, MapPin, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "./Button";

export const ASSET_SPECIALTIES = [
  { value: "electricidad", label: "Electricidad" },
  { value: "climatizacion", label: "Climatizacion" },
  { value: "fontaneria", label: "Fontaneria" },
  { value: "pci", label: "PCI" },
  { value: "general", label: "General" },
];

export const ASSET_STATUSES = [
  { value: "Operativo", label: "Operativo" },
  { value: "Mantenimiento", label: "En Mantenimiento" },
  { value: "Averiado", label: "Averiado" },
  { value: "Fuera de servicio", label: "Fuera de servicio" },
];

const EMPTY_FORM = {
  name: "",
  code: "",
  specialty: "general",
  location: "",
  status: "Operativo",
  imageUrl: "",
  notes: "",
};

function getInitialForm(asset) {
  if (!asset) return EMPTY_FORM;
  return {
    name: asset.name || "",
    code: asset.code || "",
    specialty: asset.specialty || "general",
    location: asset.location || "",
    status: asset.status || "Operativo",
    imageUrl: asset.imageUrl || "",
    notes: asset.notes || "",
  };
}

function TextField({ label, icon: Icon, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span>
      <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-accent">
        {Icon ? <Icon className="shrink-0 text-primary" size={20} /> : null}
        <input
          className="min-w-0 flex-1 bg-transparent py-3 font-bold text-slate-900 outline-none placeholder:text-slate-400"
          value={value}
          type={type}
          required={required}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span>
      <select
        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-accent"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AssetFormModal({ asset, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(asset));
  const isEditing = Boolean(asset?.id);

  useEffect(() => {
    setForm(getInitialForm(asset));
  }, [asset]);

  const title = useMemo(() => (isEditing ? "Editar activo" : "Nuevo activo"), [isEditing]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primaryDark/60 px-3 pb-3 backdrop-blur-sm">
      <form className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[34px] bg-appBg shadow-2xl" onSubmit={submit}>
        <div className="sticky top-0 z-10 rounded-b-[28px] bg-[radial-gradient(circle_at_top_left,#07396B_0%,#001B3D_48%,#000D24_100%)] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-accent">{isEditing ? "Modificar equipo" : "Alta de equipo"}</p>
              <h2 className="text-3xl font-black leading-none">{title}</h2>
            </div>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={onClose} aria-label="Cerrar">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {form.imageUrl ? (
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              <img className="h-36 w-full object-cover" src={form.imageUrl} alt="" />
            </div>
          ) : null}
          <TextField label="Nombre del activo" icon={Cpu} value={form.name} required onChange={(value) => update("name", value)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Codigo" icon={Tag} value={form.code} required onChange={(value) => update("code", value)} />
            <SelectField label="Estado" value={form.status} onChange={(value) => update("status", value)} options={ASSET_STATUSES} />
          </div>
          <SelectField label="Especialidad" value={form.specialty} onChange={(value) => update("specialty", value)} options={ASSET_SPECIALTIES} />
          <TextField label="Ubicacion" icon={MapPin} value={form.location} placeholder="Ej: Cuarto de calderas" required onChange={(value) => update("location", value)} />
          <TextField label="Imagen URL" icon={Image} value={form.imageUrl} placeholder="https://..." onChange={(value) => update("imageUrl", value)} />
          
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-slate-700">Observaciones y datos tecnicos</span>
            <div className="flex min-h-24 rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-accent">
              <ClipboardList className="mt-4 shrink-0 text-primary" size={20} />
              <textarea
                className="ml-3 min-h-24 w-full resize-none bg-transparent py-4 font-bold text-slate-900 outline-none"
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
              />
            </div>
          </label>

          <div className="grid grid-cols-[1fr_1.3fr] gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" icon={Check}>
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
