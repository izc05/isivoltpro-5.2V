import type React from "react";
import { Check, ClipboardList, Cpu, FileText, Image, MapPin, Tag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import { fileToDataUrl, fileToDocument } from "../utils/files";

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
  locationId: "",
  status: "Operativo",
  imageUrl: "",
  documents: [],
  notes: "",
};

function getInitialForm(asset) {
  if (!asset) return EMPTY_FORM;
  return {
    name: asset.name || "",
    code: asset.code || "",
    specialty: asset.specialty || "general",
    location: asset.location || "",
    locationId: asset.locationId || "",
    status: asset.status || "Operativo",
    imageUrl: asset.imageUrl || "",
    documents: asset.documents || [],
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

export default function AssetFormModal({ asset, locations = [], onClose, onSave }: any) {
  const [form, setForm] = useState(() => getInitialForm(asset));
  const isEditing = Boolean(asset?.id);

  useEffect(() => {
    setForm(getInitialForm(asset));
  }, [asset]);

  const title = useMemo(() => (isEditing ? "Editar activo" : "Nuevo activo"), [isEditing]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    update("imageUrl", await fileToDataUrl(file));
    event.target.value = "";
  };
  const addDocuments = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const docs = await Promise.all(files.map(fileToDocument));
    update("documents", [...(form.documents || []), ...docs]);
    event.target.value = "";
  };
  const deleteDocument = (id: string) => {
    update("documents", (form.documents || []).filter((document: any) => document.id !== id));
  };
  const selectLocation = (locationId: string) => {
    const selected = locations.find((location: any) => location.id === locationId);
    setForm((current: any) => ({
      ...current,
      locationId,
      location: selected?.name || current.location,
    }));
  };

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
          {locations.length ? (
            <SelectField
              label="Ubicacion QR"
              value={form.locationId}
              onChange={selectLocation}
              options={[{ value: "", label: "Sin ubicacion QR" }, ...locations.map((location: any) => ({ value: location.id, label: `${location.name}${location.code ? ` · ${location.code}` : ""}` }))]}
            />
          ) : null}
          <TextField label="Ubicacion" icon={MapPin} value={form.location} placeholder="Ej: Cuarto de calderas" required onChange={(value) => update("location", value)} />
          <TextField label="Imagen URL" icon={Image} value={form.imageUrl} placeholder="https://..." onChange={(value) => update("imageUrl", value)} />
          <label className="grid min-h-12 cursor-pointer place-items-center rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-4 text-sm font-black text-primary">
            Subir foto del activo
            <input className="hidden" type="file" accept="image/*" onChange={uploadPhoto} />
          </label>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-800">Documentos del activo</h3>
              <label className="cursor-pointer rounded-2xl bg-white px-3 py-2 text-sm font-black text-primary shadow-soft">
                Añadir
                <input className="hidden" type="file" multiple onChange={addDocuments} />
              </label>
            </div>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white">
              {(form.documents || []).map((document: any) => (
                <div key={document.id} className="grid grid-cols-[30px_minmax(0,1fr)_36px] items-center gap-2 px-3 py-3">
                  <FileText className="text-primary" size={18} />
                  <a className="truncate text-sm font-black text-primaryDark" href={document.dataUrl} download={document.name}>{document.name}</a>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-700" onClick={() => deleteDocument(document.id)} aria-label="Eliminar documento">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!form.documents?.length ? <p className="px-3 py-4 text-center text-sm font-bold text-slate-500">Sin documentos adjuntos.</p> : null}
            </div>
          </section>
          
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
