import { Building2, Camera, Check, Mail, MapPin, Phone, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "./Button";

export const INSTALLATION_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "centro_especialidades", label: "Centro de especialidades" },
  { value: "residencia", label: "Residencia" },
  { value: "colegio", label: "Colegio" },
  { value: "polideportivo", label: "Polideportivo" },
  { value: "industria", label: "Industria" },
  { value: "comunidad", label: "Comunidad" },
  { value: "oficina", label: "Oficina" },
  { value: "local_comercial", label: "Local comercial" },
  { value: "otro", label: "Otro" },
];

export const INSTALLATION_STATUSES = [
  { value: "en_servicio", label: "En servicio" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "fuera_servicio", label: "Fuera servicio" },
];

const EMPTY_FORM = {
  name: "",
  type: "hospital",
  address: "",
  city: "",
  province: "",
  responsible: "",
  phone: "",
  email: "",
  status: "en_servicio",
  imageUrl: "",
  notes: "",
};

function getInitialForm(installation) {
  if (!installation) return EMPTY_FORM;
  return {
    name: installation.name || "",
    type: installation.type || "hospital",
    address: installation.rawAddress || installation.address || "",
    city: installation.city || "",
    province: installation.province || "",
    responsible: installation.responsible || "",
    phone: installation.phone || "",
    email: installation.email || "",
    status: installation.rawStatus || installation.status || "en_servicio",
    imageUrl: installation.imageUrl || "",
    notes: installation.notes || "",
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

export default function InstallationFormModal({ installation, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(installation));
  const isEditing = Boolean(installation?.id);

  useEffect(() => {
    setForm(getInitialForm(installation));
  }, [installation]);

  const title = useMemo(() => (isEditing ? "Editar instalacion" : "Nueva instalacion"), [isEditing]);
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
              <p className="text-sm font-black text-accent">{isEditing ? "Datos reales" : "Alta local"}</p>
              <h2 className="text-3xl font-black leading-none">{title}</h2>
            </div>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={onClose} aria-label="Cerrar">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <TextField label="Nombre de instalacion" icon={Building2} value={form.name} required onChange={(value) => update("name", value)} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Tipo" value={form.type} onChange={(value) => update("type", value)} options={INSTALLATION_TYPES} />
            <SelectField label="Estado" value={form.status} onChange={(value) => update("status", value)} options={INSTALLATION_STATUSES} />
          </div>
          <TextField label="Direccion" icon={MapPin} value={form.address} required onChange={(value) => update("address", value)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Localidad" value={form.city} onChange={(value) => update("city", value)} />
            <TextField label="Provincia" value={form.province} onChange={(value) => update("province", value)} />
          </div>
          <TextField label="Responsable" icon={User} value={form.responsible} onChange={(value) => update("responsible", value)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Telefono" icon={Phone} value={form.phone} type="tel" onChange={(value) => update("phone", value)} />
            <TextField label="Email" icon={Mail} value={form.email} type="email" onChange={(value) => update("email", value)} />
          </div>
          <TextField label="Foto principal URL" icon={Camera} value={form.imageUrl} placeholder="https://..." onChange={(value) => update("imageUrl", value)} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-slate-700">Observaciones</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 font-bold outline-none focus:border-accent"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
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
