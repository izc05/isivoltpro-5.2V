import { Building2, ChevronRight, DatabaseBackup, Download, Palette, RotateCcw, Scale, Settings, Upload, UserRoundCog, Wrench } from "lucide-react";
import { useState } from "react";
import Card from "../components/Card";
import Header from "../components/Header";
import Button from "../components/Button";
import CompanyFormModal from "../components/CompanyFormModal";
import TechniciansModal from "../components/TechniciansModal";

const settings = [
  { id: "company", title: "Datos de empresa", text: "Logo, CIF, direccion y contacto", icon: Building2, active: true },
  { id: "technicians", title: "Tecnicos", text: "Equipo, especialidades y telefonos", icon: UserRoundCog, active: true },
  { id: "backup", title: "Copia de seguridad", text: "Exportacion e importacion local", icon: DatabaseBackup, active: true },
  { id: "theme", title: "Tema", text: "Color verde mantenimiento", icon: Palette, active: false },
  { id: "legal", title: "Legal y privacidad", text: "Condiciones, permisos y datos locales", icon: Scale, active: false },
  { id: "version", title: "Version app", text: "IsiVoltPro Mantenimiento 1.0.0", icon: Wrench, active: true },
];

export default function SettingsScreen({ settings: appSettings, technicians, onExportBackup, onImportBackup, onResetAllData, onSaveCompanySettings, onSaveTechnician, onDeleteTechnician }) {
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingTechnicians, setIsEditingTechnicians] = useState(false);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await onImportBackup(file);
      alert("Copia de seguridad restaurada correctamente.");
    } catch (error) {
      alert(`No se pudo importar la copia.\n${error?.message || "Archivo no valido."}`);
    } finally {
      event.target.value = "";
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm("Se borraran todos los datos locales y se cargaran los datos iniciales. ¿Quieres continuar?");
    if (!confirmed) return;
    onResetAllData();
  };

  return (
    <>
      <Header title="Ajustes" subtitle="Configuracion local de la app" actions={<Settings size={28} />} />
      <main className="space-y-4 px-5 pb-32 pt-6">
        <Card className="space-y-3">
          <div>
            <h2 className="text-xl font-black">Copia de seguridad</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Exporta o restaura instalaciones, activos, ordenes, tecnicos y ajustes.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button icon={Download} onClick={onExportBackup} className="w-full">
              Exportar
            </Button>
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-accent bg-white px-5 py-3 text-base font-black text-primary transition active:scale-[0.98]">
              <Upload size={21} strokeWidth={2.6} />
              Importar
              <input className="hidden" type="file" accept="application/json,.json" onChange={handleImport} />
            </label>
          </div>
          <Button icon={RotateCcw} variant="danger" onClick={handleReset} className="w-full">
            Borrar todos los datos
          </Button>
        </Card>

        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-4">
              <button
                className="flex w-full items-center gap-4 text-left"
                onClick={() => {
                  if (item.id === "company") return setIsEditingCompany(true);
                  if (item.id === "technicians") return setIsEditingTechnicians(true);
                  item.active ? null : alert(`Utilidad pendiente: ${item.title.toLowerCase()} se configurara desde esta pantalla.`);
                }}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-800">
                  <Icon size={27} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-black">{item.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {item.title === "Version app" ? `IsiVoltPro Mantenimiento ${appSettings?.version || "1.0.0"}` : item.text}
                  </p>
                </div>
                <ChevronRight className="text-slate-500" />
              </button>
            </Card>
          );
        })}
      </main>
      
      {isEditingCompany && (
        <CompanyFormModal 
          companyData={appSettings?.company} 
          onClose={() => setIsEditingCompany(false)} 
          onSave={(form) => {
            onSaveCompanySettings(form);
            setIsEditingCompany(false);
          }} 
        />
      )}

      {isEditingTechnicians && (
        <TechniciansModal 
          technicians={technicians} 
          onClose={() => setIsEditingTechnicians(false)} 
          onSave={onSaveTechnician}
          onDelete={onDeleteTechnician}
        />
      )}
    </>
  );
}
