import { Building2, Check, Globe, Image, Mail, MapPin, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";

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

export default function CompanyFormModal({ companyData, onClose, onSave }) {
  const [form, setForm] = useState(companyData || {
    name: "",
    cif: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (companyData) setForm(companyData);
  }, [companyData]);

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
              <p className="text-sm font-black text-accent">Configuracion local</p>
              <h2 className="text-3xl font-black leading-none">Datos de empresa</h2>
            </div>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={onClose} aria-label="Cerrar">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <TextField label="Nombre de la empresa" icon={Building2} value={form.name} required onChange={(value) => update("name", value)} />
          <TextField label="CIF/NIF" value={form.cif} onChange={(value) => update("cif", value)} />
          <TextField label="Direccion" icon={MapPin} value={form.address} onChange={(value) => update("address", value)} />
          
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Telefono" icon={Phone} type="tel" value={form.phone} onChange={(value) => update("phone", value)} />
            <TextField label="Correo" icon={Mail} type="email" value={form.email} onChange={(value) => update("email", value)} />
          </div>

          <TextField label="Sitio web" icon={Globe} value={form.website} placeholder="https://..." onChange={(value) => update("website", value)} />
          <TextField label="Logo URL" icon={Image} value={form.logoUrl} placeholder="https://..." onChange={(value) => update("logoUrl", value)} />
          
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
