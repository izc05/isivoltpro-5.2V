import { Building2, CalendarDays, Camera, Check, ChevronDown, ClipboardPlus, Flag, MapPin, User, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import { toDateInputValue } from "../utils/dates";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-black text-white">{label}</span>
      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/18 bg-white/6 px-4 text-white">
        <Icon className="shrink-0 text-white/85" size={23} />
        {children}
        <ChevronDown className="shrink-0 text-white/85" size={20} />
      </div>
    </label>
  );
}

export default function NewWorkOrderScreen({ installations, technicians, defaults = {}, onBack, onCreate }) {
  const [form, setForm] = useState({
    type: "Correctiva",
    installationId: defaults.installationId || installations[0]?.id || "",
    specialty: defaults.specialty || "Mecanica",
    location: "Planta Baja - Area de Bombas",
    technician: technicians[0]?.name || "",
    priority: "Alta",
    date: toDateInputValue(new Date()),
    time: "08:45",
    title: "Incidencia en bomba principal",
    description: "Fuga de agua detectada en la conexion de la bomba principal. Requiere revision y reparacion inmediata.",
    photos: [],
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      installationId: defaults.installationId || current.installationId,
      specialty: defaults.specialty || current.specialty,
    }));
  }, [defaults.installationId, defaults.specialty]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const photos = await Promise.all(files.map(fileToDataUrl));
    setForm((current) => ({ ...current, photos: [...current.photos, ...photos] }));
    event.target.value = "";
  };

  const removePhoto = (index) => {
    setForm((current) => ({ ...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index) }));
  };

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#155E75_0%,#173B72_48%,#071426_100%)] text-white">
        <Header
          title="Nueva orden"
          subtitle="Crear OT"
          compact
          onBack={onBack}
          actions={
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-amber-300 text-slate-950" onClick={() => onCreate(form)} aria-label="Crear OT">
              <Check size={26} />
            </button>
          }
        />
      <main className="-mt-8 px-5 pb-8">
        <Card className="space-y-4 border-white/15 bg-white/5 text-white backdrop-blur">
          <Field label="Tipo de orden" icon={Wrench}>
            <select className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" value={form.type} onChange={(event) => update("type", event.target.value)}>
              <option>Correctiva</option>
              <option>Preventiva</option>
            </select>
          </Field>

          <Field label="Instalacion" icon={Building2}>
            <select className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" value={form.installationId} onChange={(event) => update("installationId", event.target.value)}>
              {installations.map((installation) => (
                <option key={installation.id} value={installation.id}>
                  {installation.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Especialidad" icon={Wrench}>
            <select className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" value={form.specialty} onChange={(event) => update("specialty", event.target.value)}>
              {["Electricidad", "Climatizacion", "Fontaneria", "PCI", "Mecanica"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Zona" icon={MapPin}>
            <input className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" value={form.location} onChange={(event) => update("location", event.target.value)} />
          </Field>

          <Field label="Tecnico asignado" icon={User}>
            <select className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" value={form.technician} onChange={(event) => update("technician", event.target.value)}>
              {technicians.map((technician) => (
                <option key={technician.id}>{technician.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Prioridad" icon={Flag}>
            <select className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              {["Alta", "Media", "Baja"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Fecha" icon={CalendarDays}>
            <input className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
          </Field>

          <Field label="Hora" icon={CalendarDays}>
            <input className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" type="time" value={form.time} onChange={(event) => update("time", event.target.value)} />
          </Field>

          <label className="block">
            <span className="mb-2 block text-base font-black text-white">Titulo corto</span>
            <input
              className="min-h-14 w-full rounded-2xl border border-white/18 bg-white/6 px-4 text-lg font-black text-white outline-none focus:border-accent"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-base font-black text-white">Descripcion</span>
            <textarea
              className="min-h-28 w-full resize-none rounded-2xl border border-white/18 bg-white/6 p-4 text-base font-semibold text-white outline-none focus:border-accent"
              maxLength={500}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
            <span className="mt-1 block text-right text-sm font-semibold text-white/60">{form.description.length}/500</span>
          </label>

          <div>
            <span className="mb-2 block text-base font-black text-white">Adjuntar fotos</span>
            <div className="grid grid-cols-2 gap-3">
              {form.photos.map((photo, index) => (
                <div key={photo} className="relative h-28 overflow-hidden rounded-2xl bg-slate-700">
                  <img className="h-full w-full object-cover" src={photo} alt="" />
                  <button
                    className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-primaryDark text-white"
                    onClick={() => removePhoto(index)}
                    type="button"
                    aria-label="Quitar foto"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <label className="grid h-28 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-accent text-accent">
                <span className="grid place-items-center gap-2 font-black">
                  <Camera size={32} />
                  Agregar foto
                </span>
                <input className="hidden" type="file" accept="image/*" multiple onChange={addPhotos} />
              </label>
            </div>
          </div>

          <Button icon={ClipboardPlus} className="w-full text-xl" onClick={() => onCreate(form)}>
            Crear OT
          </Button>
        </Card>
      </main>
      </div>
    </>
  );
}
