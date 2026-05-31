import { Check, Mail, Phone, Plus, Trash2, User, Wrench, X } from "lucide-react";
import { useState } from "react";
import Button from "./Button";
import { createId } from "../utils/ids";

const SPECIALTIES = [
  { value: "electricidad", label: "Electricidad" },
  { value: "climatizacion", label: "Climatizacion" },
  { value: "fontaneria", label: "Fontaneria" },
  { value: "pci", label: "PCI" },
  { value: "general", label: "General" },
];

function TextField({ label, icon: Icon, value, onChange, type = "text", required = false }) {
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

export default function TechniciansModal({ technicians, onClose, onSave, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "general", phone: "", email: "" });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSave(null, form);
    setIsAdding(false);
    setForm({ name: "", specialty: "general", phone: "", email: "" });
  };

  const askDelete = (tech) => {
    if (window.confirm(`¿Seguro que quieres eliminar a ${tech.name}?`)) {
      onDelete(tech.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primaryDark/60 px-3 pb-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[34px] bg-appBg shadow-2xl">
        <div className="sticky top-0 z-10 rounded-b-[28px] bg-[radial-gradient(circle_at_top_left,#07396B_0%,#001B3D_48%,#000D24_100%)] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-accent">Equipo de trabajo</p>
              <h2 className="text-3xl font-black leading-none">Tecnicos</h2>
            </div>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={onClose} aria-label="Cerrar">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {!isAdding ? (
            <>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100 bg-white">
                {technicians.map((tech) => (
                  <div key={tech.id} className="flex items-center justify-between gap-3 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                        <User size={22} />
                      </div>
                      <div>
                        <strong className="block text-lg">{tech.name}</strong>
                        <p className="text-sm font-semibold text-slate-500 capitalize">{tech.specialty}</p>
                      </div>
                    </div>
                    <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-400 active:bg-red-50" onClick={() => askDelete(tech)}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                {technicians.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm font-semibold text-slate-500">No hay tecnicos registrados</p>
                )}
              </div>
              <Button icon={Plus} className="w-full" onClick={() => setIsAdding(true)}>
                Añadir tecnico
              </Button>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-black text-primaryDark">Nuevo tecnico</h3>
              <TextField label="Nombre" icon={User} value={form.name} required onChange={(value) => update("name", value)} />
              <SelectField label="Especialidad" value={form.specialty} onChange={(value) => update("specialty", value)} options={SPECIALTIES} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Telefono" icon={Phone} type="tel" value={form.phone} onChange={(value) => update("phone", value)} />
                <TextField label="Correo" icon={Mail} type="email" value={form.email} onChange={(value) => update("email", value)} />
              </div>
              <div className="grid grid-cols-[1fr_1.3fr] gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button type="submit" icon={Check}>
                  Añadir
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
