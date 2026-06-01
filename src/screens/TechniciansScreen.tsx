import { BriefcaseBusiness, Mail, Phone, Plus, ShieldCheck, Trash2, User, Wrench } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import TechniciansModal from "../components/TechniciansModal";

const specialtyLabels: Record<string, string> = {
  electricidad: "Electricidad",
  climatizacion: "Climatizacion",
  fontaneria: "Fontaneria",
  pci: "PCI",
  general: "General",
  mecanica: "Mecanica",
};

export default function TechniciansScreen({ technicians, workOrders, onSaveTechnician, onDeleteTechnician }: any) {
  const [modalOpen, setModalOpen] = useState(false);
  const openStatuses = new Set(["nueva", "pendiente", "asignada", "en_curso", "observada", "demorada"]);

  return (
    <>
      <Header
        title="Tecnicos"
        subtitle="Equipo, datos y carga de trabajo"
        actions={
          <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20" onClick={() => setModalOpen(true)} aria-label="Nuevo tecnico">
            <Plus size={24} />
          </button>
        }
      />
      <main className="space-y-5 px-5 pb-32 pt-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-5 lg:space-y-0">
        <section className="space-y-4">
          {technicians.map((tech: any) => {
            const assigned = workOrders.filter((order: any) => order.assignedTechnicianId === tech.id);
            const open = assigned.filter((order: any) => openStatuses.has(order.rawStatus || order.status));
            return (
              <Card key={tech.id} className="overflow-hidden p-0">
                <div className="grid grid-cols-[72px_minmax(0,1fr)_44px] gap-4 p-5">
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-cyan-100 text-primary">
                    <User size={32} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black text-primaryDark">{tech.name}</h2>
                    <p className="mt-1 font-semibold text-slate-500">{specialtyLabels[tech.specialty] || tech.specialty || "General"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{open.length} abiertas</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{assigned.length} total</span>
                      {tech.status ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{tech.status}</span> : null}
                    </div>
                  </div>
                  <button className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-700" onClick={() => onDeleteTechnician(tech.id)} aria-label="Eliminar tecnico">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="grid gap-2 border-t border-slate-100 bg-slate-50 p-4 md:grid-cols-2">
                  <a className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 font-bold text-slate-700" href={tech.phone ? `tel:${tech.phone}` : undefined}>
                    <Phone size={18} className="text-primary" />
                    {tech.phone || "Sin telefono"}
                  </a>
                  <a className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 font-bold text-slate-700" href={tech.email ? `mailto:${tech.email}` : undefined}>
                    <Mail size={18} className="text-primary" />
                    {tech.email || "Sin correo"}
                  </a>
                </div>
              </Card>
            );
          })}
          {!technicians.length ? (
            <Card className="py-10 text-center">
              <User className="mx-auto text-primary" size={36} />
              <h2 className="mt-3 text-xl font-black">Sin tecnicos</h2>
              <p className="mt-1 font-semibold text-slate-500">Anade el equipo para asignar OT y controlar carga.</p>
            </Card>
          ) : null}
        </section>

        <section className="space-y-4">
          <Card className="bg-[radial-gradient(circle_at_top_left,#155E75,#173B72_52%,#071426)] text-white">
            <ShieldCheck className="text-accent" size={34} />
            <h2 className="mt-4 text-2xl font-black">Control del equipo</h2>
            <p className="mt-2 font-semibold text-white/72">Usa esta pantalla para tener telefonos, especialidades y trabajos abiertos a mano.</p>
            <Button icon={Plus} className="mt-5 w-full" onClick={() => setModalOpen(true)}>
              Crear tecnico
            </Button>
          </Card>
          <Card>
            <h2 className="text-xl font-black">Resumen</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <Wrench className="text-primary" size={24} />
                <strong className="mt-2 block text-3xl font-black">{technicians.length}</strong>
                <span className="text-sm font-bold text-slate-500">tecnicos</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <BriefcaseBusiness className="text-primary" size={24} />
                <strong className="mt-2 block text-3xl font-black">{workOrders.filter((order: any) => order.assignedTechnicianId).length}</strong>
                <span className="text-sm font-bold text-slate-500">OT asignadas</span>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {modalOpen ? (
        <TechniciansModal
          technicians={technicians}
          onClose={() => setModalOpen(false)}
          onSave={onSaveTechnician}
          onDelete={onDeleteTechnician}
        />
      ) : null}
    </>
  );
}
