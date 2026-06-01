import type React from "react";
import { AlertCircle, ArrowLeft, Building2, CalendarDays, Camera, Check, ChevronDown, ClipboardCheck, ClipboardPlus, Flag, LocateFixed, MapPin, ShieldCheck, User, Wrench, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import { toDateInputValue } from "../utils/dates";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function currentTimeInput() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const presets = [
  {
    type: "Parte de visita",
    label: "Visita",
    icon: ClipboardCheck,
    title: "Parte de visita",
    description: "Visita realizada para revision, comprobaciones y seguimiento de trabajos.",
    priority: "Media",
    tone: "from-emerald-300 to-cyan-300 text-slate-950",
  },
  {
    type: "Correctiva",
    label: "Correctivo",
    icon: Wrench,
    title: "Incidencia correctiva",
    description: "Incidencia detectada. Revisar causa, reparar si procede y dejar constancia del trabajo realizado.",
    priority: "Alta",
    tone: "from-rose-300 to-amber-300 text-slate-950",
  },
  {
    type: "Preventiva",
    label: "Preventivo",
    icon: ShieldCheck,
    title: "Preventivo programado",
    description: "Mantenimiento preventivo programado segun plan: revision, limpieza, comprobaciones y registro de estado.",
    priority: "Media",
    tone: "from-sky-300 to-cyan-300 text-slate-950",
  },
];

function isPresetText(value: string, key: "title" | "description") {
  return presets.some((preset) => preset[key] === value);
}

function SelectField({ label, icon: Icon, value, onChange, children }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span>
      <div className="relative flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-cyan-300">
        <Icon className="shrink-0 text-primary" size={21} />
        <select className="min-h-[52px] min-w-0 flex-1 appearance-none bg-transparent py-3 pr-7 text-base font-black text-slate-900 outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 text-slate-500" size={20} />
      </div>
    </label>
  );
}

function TextField({ label, icon: Icon, value, onChange, placeholder = "", type = "text" }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span>
      <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-cyan-300">
        <Icon className="shrink-0 text-primary" size={21} />
        <input className="min-h-[52px] min-w-0 flex-1 bg-transparent py-3 text-base font-black text-slate-900 outline-none placeholder:text-slate-400" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

export default function NewWorkOrderScreen({ installations, technicians, defaults = {}, onBack, onCreate }: any) {
  const [form, setForm] = useState({
    type: "Correctiva",
    installationId: defaults.installationId || installations[0]?.id || "",
    specialty: defaults.specialty || "Electricidad",
    locationId: defaults.locationId || "",
    location: defaults.location || "",
    technician: technicians[0]?.name || "",
    priority: "Media",
    date: toDateInputValue(new Date()),
    time: currentTimeInput(),
    title: "",
    description: "",
    photos: [],
    gpsLat: defaults.gpsLat || "",
    gpsLng: defaults.gpsLng || "",
  });
  const [error, setError] = useState("");

  const selectedInstallation = useMemo(
    () => installations.find((installation) => installation.id === form.installationId) || installations[0],
    [form.installationId, installations]
  );
  const installationLocations = selectedInstallation?.locations || [];
  const selectedPreset = presets.find((preset) => preset.type === form.type) || presets[1];
  const HeroIcon = selectedPreset.icon;
  const heroImage = selectedInstallation?.imageUrl || "";

  useEffect(() => {
    setForm((current) => ({
      ...current,
      installationId: defaults.installationId || current.installationId,
      specialty: defaults.specialty || current.specialty,
      locationId: defaults.locationId || current.locationId,
      location: defaults.location || current.location,
      gpsLat: defaults.gpsLat || current.gpsLat,
      gpsLng: defaults.gpsLng || current.gpsLng,
    }));
  }, [defaults.gpsLat, defaults.gpsLng, defaults.installationId, defaults.location, defaults.locationId, defaults.specialty]);

  const update = (key: string, value: string) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (preset: any) => {
    setError("");
    setForm((current) => ({
      ...current,
      type: preset.type,
      title: !current.title || isPresetText(current.title, "title") ? preset.title : current.title,
      description: !current.description || isPresetText(current.description, "description") ? preset.description : current.description,
      priority: preset.priority,
    }));
  };

  const changeType = (type: string) => {
    const preset = presets.find((item) => item.type === type);
    if (preset) applyPreset(preset);
  };

  const create = () => {
    if (!form.installationId) {
      setError("Selecciona una instalacion antes de crear la OT.");
      return;
    }
    if (!form.title.trim() && !form.description.trim()) {
      setError("Indica un titulo o una descripcion para crear la OT.");
      return;
    }
    onCreate({ ...form, title: form.title.trim(), description: form.description.trim() });
  };
  const selectLocation = (locationId: string) => {
    const selected = installationLocations.find((location: any) => location.id === locationId);
    setError("");
    setForm((current) => ({
      ...current,
      locationId,
      location: selected?.name || current.location,
    }));
  };

  const captureGps = () => {
    if (!navigator.geolocation) {
      setError("Este dispositivo no permite obtener GPS desde el navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError("");
        setForm((current) => ({
          ...current,
          gpsLat: String(position.coords.latitude),
          gpsLng: String(position.coords.longitude),
        }));
      },
      () => setError("No se ha podido obtener la ubicacion GPS."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const photos = await Promise.all(files.map(fileToDataUrl));
    setForm((current) => ({ ...current, photos: [...current.photos, ...photos] }));
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setForm((current) => ({ ...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index) }));
  };

  return (
    <div className="min-h-screen bg-appBg text-appText">
      <section className="relative min-h-[300px] overflow-hidden bg-primaryDark text-white">
        {heroImage ? <img className="absolute inset-0 h-full w-full object-cover" src={heroImage} alt="" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-primaryDark/65 via-primaryDark/60 to-appBg" />
        <div className="relative px-5 pb-8 pt-5">
          <div className="flex items-center justify-between gap-3">
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/20" onClick={onBack} aria-label="Volver">
              <ArrowLeft size={24} />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-amber-300 text-slate-950 shadow-soft" onClick={create} aria-label="Crear OT">
              <Check size={25} />
            </button>
          </div>

          <div className="mt-9">
            <div className={`mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br ${selectedPreset.tone} shadow-soft`}>
              <HeroIcon size={32} />
            </div>
            <p className="font-black uppercase tracking-wide text-cyan-200">Nueva orden</p>
            <h1 className="mt-1 text-4xl font-black leading-none">{selectedPreset.type}</h1>
            <div className="mt-4 flex items-start gap-3 rounded-3xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
              <Building2 className="mt-0.5 shrink-0 text-cyan-200" size={22} />
              <div className="min-w-0">
                <strong className="block truncate text-lg">{selectedInstallation?.name || "Sin instalacion"}</strong>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-white/78">{selectedInstallation?.address || "Selecciona instalacion"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="-mt-10 space-y-5 px-5 pb-10">
        <section className="relative rounded-[30px] bg-white p-4 shadow-soft">
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const selected = form.type === preset.type;
              return (
                <button
                  key={preset.type}
                  type="button"
                  className={selected ? `rounded-3xl bg-gradient-to-br ${preset.tone} px-2 py-4 text-sm font-black shadow-soft` : "rounded-3xl border border-slate-200 bg-slate-50 px-2 py-4 text-sm font-black text-slate-600"}
                  onClick={() => applyPreset(preset)}
                >
                  <Icon className="mx-auto mb-2" size={24} />
                  {preset.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-[30px] bg-white p-5 shadow-soft">
          {error ? (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800">
              <AlertCircle className="mt-0.5 shrink-0" size={21} />
              <p className="text-sm font-black leading-snug">{error}</p>
            </div>
          ) : null}

          <SelectField label="Tipo de orden" icon={Wrench} value={form.type} onChange={changeType}>
            {presets.map((preset) => <option key={preset.type}>{preset.type}</option>)}
          </SelectField>

          <SelectField label="Instalacion" icon={Building2} value={form.installationId} onChange={(value) => update("installationId", value)}>
            {installations.map((installation) => (
              <option key={installation.id} value={installation.id}>
                {installation.name}
              </option>
            ))}
          </SelectField>

          {installationLocations.length ? (
            <SelectField label="Ubicacion QR" icon={MapPin} value={form.locationId} onChange={selectLocation}>
              <option value="">Sin ubicacion QR</option>
              {installationLocations.map((location: any) => (
                <option key={location.id} value={location.id}>
                  {location.name}{location.code ? ` · ${location.code}` : ""}
                </option>
              ))}
            </SelectField>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Especialidad" icon={Wrench} value={form.specialty} onChange={(value) => update("specialty", value)}>
              {["Electricidad", "Climatizacion", "Fontaneria", "PCI", "Mecanica", "General"].map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <SelectField label="Prioridad" icon={Flag} value={form.priority} onChange={(value) => update("priority", value)}>
              {["Urgente", "Alta", "Media", "Baja"].map((item) => <option key={item}>{item}</option>)}
            </SelectField>
          </div>

          <TextField label="Zona" icon={MapPin} value={form.location} placeholder="Ej: Sala tecnica, cubierta, planta 1" onChange={(value) => update("location", value)} />

          <button type="button" className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-50 px-4 font-black text-primary" onClick={captureGps}>
            <LocateFixed size={21} />
            {form.gpsLat && form.gpsLng ? "GPS guardado" : "Usar ubicacion GPS"}
          </button>

          <SelectField label="Tecnico asignado" icon={User} value={form.technician} onChange={(value) => update("technician", value)}>
            {technicians.map((technician) => <option key={technician.id}>{technician.name}</option>)}
          </SelectField>

          <div className="grid grid-cols-2 gap-3">
            <TextField label="Fecha" icon={CalendarDays} type="date" value={form.date} onChange={(value) => update("date", value)} />
            <TextField label="Hora" icon={CalendarDays} type="time" value={form.time} onChange={(value) => update("time", value)} />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-slate-700">Titulo corto</span>
            <input
              className="min-h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-black text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-300"
              value={form.title}
              placeholder="Resumen del parte"
              onChange={(event) => update("title", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-slate-700">Descripcion</span>
            <textarea
              className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-base font-semibold text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-300"
              maxLength={500}
              value={form.description}
              placeholder="Que se visita, revisa o repara..."
              onChange={(event) => update("description", event.target.value)}
            />
            <span className="mt-1 block text-right text-sm font-semibold text-slate-400">{form.description.length}/500</span>
          </label>
        </section>

        <section className="space-y-3 rounded-[30px] bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Fotos del parte</h2>
              <p className="text-sm font-semibold text-slate-500">La foto superior identifica la instalacion; aqui van evidencias del trabajo.</p>
            </div>
            <Camera className="text-primary" size={26} />
          </div>
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
            <label className="grid h-28 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50 text-primary">
              <span className="grid place-items-center gap-2 font-black">
                <Camera size={30} />
                Agregar foto
              </span>
              <input className="hidden" type="file" accept="image/*" multiple onChange={addPhotos} />
            </label>
          </div>
        </section>

        <Button icon={ClipboardPlus} className="w-full text-xl" onClick={create}>
          Crear OT
        </Button>
      </main>
    </div>
  );
}
