import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import AgendaScreen from "./screens/AgendaScreen";
import HomeScreen from "./screens/HomeScreen";
import InstallationDetailScreen from "./screens/InstallationDetailScreen";
import InstallationsScreen from "./screens/InstallationsScreen";
import NewWorkOrderScreen from "./screens/NewWorkOrderScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import WorkOrderDetailScreen from "./screens/WorkOrderDetailScreen";
import WorkOrdersScreen from "./screens/WorkOrdersScreen";
import { exportBackup, importBackup } from "./services/backupService";
import { resetAllData, saveAssets, saveInstallations, saveSettings, saveTechnicians, saveWorkOrders } from "./services/storage";
import { useStore } from "./store/useStore";
import type { Asset, DisplayInstallation, DisplayWorkOrder, Installation, Technician, WorkOrder } from "./types";

const TYPE_LABELS: Record<string, string> = {
  visita: "Parte de visita",
  preventiva: "Preventiva",
  correctiva: "Correctiva",
};

const STATUS_LABELS: Record<string, string> = {
  nueva: "Nueva",
  pendiente: "Pendiente",
  asignada: "Asignada",
  en_curso: "En curso",
  observada: "Observada",
  demorada: "Demorada",
  completada: "Completada",
  cerrada: "Cerrada",
  en_servicio: "En servicio",
  mantenimiento: "Mantenimiento",
  fuera_servicio: "Fuera servicio",
  activo: "Activo",
  en_revision: "En revision",
  averiado: "Averiado",
};

const SPECIALTY_LABELS: Record<string, string> = {
  electricidad: "Electricidad",
  fontaneria: "Fontaneria",
  climatizacion: "Climatizacion",
  pci: "PCI",
  general: "General",
  mecanica: "Mecanica",
};

const PRIORITY_LABELS: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const OPEN_WORK_ORDER_STATUSES = new Set(["nueva", "pendiente", "asignada", "en_curso", "observada", "demorada"]);

function labelFrom(map: Record<string, string>, value?: string) {
  return value ? map[value] || value : "";
}

function formatAddress(installation: Installation) {
  return [installation.address, installation.city, installation.province].filter(Boolean).join(", ");
}

function getVisualByType(type: string) {
  if (type === "hospital") return "hospital";
  if (type === "centro_especialidades") return "clinic";
  if (type === "residencia") return "residence";
  if (type === "polideportivo") return "sports";
  if (type === "colegio") return "school";
  return "clinic";
}

function enrichInstallations(installations: Installation[], assets: Asset[], workOrders: WorkOrder[]): DisplayInstallation[] {
  return installations.map((installation) => {
    const installationAssets = assets.filter((asset) => asset.installationId === installation.id);
    const installationOrders = workOrders.filter((order) => order.installationId === installation.id);
    const specialties = Object.entries(
      installationAssets.reduce<Record<string, number>>((groups, asset) => {
        groups[asset.specialty] = (groups[asset.specialty] || 0) + 1;
        return groups;
      }, {})
    ).map(([specialty, count]) => ({ name: labelFrom(SPECIALTY_LABELS, specialty), assets: count }));

    return {
      ...installation,
      address: formatAddress(installation),
      rawAddress: installation.address,
      status: labelFrom(STATUS_LABELS, installation.status),
      rawStatus: installation.status,
      visual: getVisualByType(installation.type),
      assetsCount: installationAssets.length,
      lastUpdate: installation.updatedAt,
      summary: {
        assets: installationAssets.length,
        preventive: installationOrders.filter((order) => order.type === "preventiva").length,
        corrective: installationOrders.filter((order) => order.type === "correctiva").length,
        openOrders: installationOrders.filter((order) => OPEN_WORK_ORDER_STATUSES.has(order.status)).length,
        technicians: new Set(installationOrders.map((order) => order.assignedTechnicianId).filter(Boolean)).size,
      },
      specialties: specialties.length ? specialties : [{ name: "General", assets: installationAssets.length }],
    };
  });
}

function enrichWorkOrders(workOrders: WorkOrder[], installations: Installation[], assets: Asset[], technicians: Technician[]): DisplayWorkOrder[] {
  return workOrders.map((order) => {
    const installation = installations.find((item) => item.id === order.installationId);
    const asset = assets.find((item) => item.id === order.assetId);
    const technician = technicians.find((item) => item.id === order.assignedTechnicianId);
    return {
      ...order,
      rawType: order.type,
      rawStatus: order.status,
      rawPriority: order.priority,
      rawSpecialty: order.specialty,
      type: labelFrom(TYPE_LABELS, order.type),
      status: labelFrom(STATUS_LABELS, order.status),
      priority: labelFrom(PRIORITY_LABELS, order.priority),
      specialty: labelFrom(SPECIALTY_LABELS, order.specialty),
      installation: installation?.name || "Sin instalacion",
      installationImageUrl: installation?.imageUrl || "",
      installationAddress: installation ? formatAddress(installation) : "",
      assetName: asset?.name || "",
      technician: technician?.name || "Sin asignar",
      photos: [...(order.initialPhotos || []), ...(order.finalPhotos || [])],
      time: new Date(order.scheduledAt || order.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
  });
}

function InstallationRoute({
  installations,
  assets,
  workOrders,
  onBack,
  onSaveInstallation,
  onDeleteInstallation,
  onSaveAsset,
  onOpenWorkOrder,
  onCreateWorkOrder,
}: any) {
  const { id } = useParams();
  const routeLocation = useLocation();
  const search = new URLSearchParams(routeLocation.search);
  const highlightedLocation = search.get("ubicacion") || "";
  const highlightedAssetId = search.get("activo") || "";
  const installation = installations.find((item: DisplayInstallation) => item.id === id);
  if (!installation) return <Navigate to="/instalaciones" replace />;

  return (
    <InstallationDetailScreen
      installation={installation}
      assets={assets.filter((asset: Asset) => asset.installationId === installation.id)}
      workOrders={workOrders.filter((order: DisplayWorkOrder) => order.installationId === installation.id)}
      onBack={onBack}
      onSaveInstallation={onSaveInstallation}
      onDeleteInstallation={onDeleteInstallation}
      onSaveAsset={onSaveAsset}
      onOpenWorkOrder={onOpenWorkOrder}
      onCreateWorkOrder={onCreateWorkOrder}
      highlightedLocation={highlightedLocation}
      highlightedAssetId={highlightedAssetId}
    />
  );
}

function WorkOrderRoute({ workOrders, installations, technicians, settings, onBack, onUpdateStatus, onSaveWorkOrder, onDeleteWorkOrder }: any) {
  const { id } = useParams();
  const order = workOrders.find((item: DisplayWorkOrder) => item.id === id);
  if (!order) return <Navigate to="/ordenes" replace />;

  return (
    <WorkOrderDetailScreen
      order={order}
      installations={installations}
      technicians={technicians}
      settings={settings}
      onBack={onBack}
      onUpdateStatus={onUpdateStatus}
      onSaveWorkOrder={onSaveWorkOrder}
      onDeleteWorkOrder={onDeleteWorkOrder}
    />
  );
}

export default function App() {
  const {
    installations, assets, workOrders, technicians, settings,
    createWorkOrder, saveAsset, saveCompanySettings, saveTechnician, deleteTechnician,
    saveInstallation, deleteInstallation, updateWorkOrderStatus, saveWorkOrder, deleteWorkOrder, reloadData
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedInstallationId, setSelectedInstallationId] = useState(installations[0]?.id || "");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(workOrders[1]?.id || workOrders[0]?.id || "");
  const [newWorkOrderDefaults, setNewWorkOrderDefaults] = useState<Record<string, string>>({});
  const [workOrderFilter, setWorkOrderFilter] = useState("Todas");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => saveInstallations(installations), [installations]);
  useEffect(() => saveAssets(assets), [assets]);
  useEffect(() => saveWorkOrders(workOrders), [workOrders]);
  useEffect(() => saveTechnicians(technicians), [technicians]);
  useEffect(() => saveSettings(settings), [settings]);

  const displayInstallations = useMemo(() => enrichInstallations(installations, assets, workOrders), [installations, assets, workOrders]);
  const displayWorkOrders = useMemo(() => enrichWorkOrders(workOrders, installations, assets, technicians), [workOrders, installations, assets, technicians]);

  const navigateTo = (target: string) => {
    const paths = {
      home: "/",
      installations: "/instalaciones",
      workOrders: "/ordenes",
      agenda: "/agenda",
      reports: "/informes",
      settings: "/ajustes",
      newWorkOrder: "/ordenes/nueva",
      installationDetail: `/instalaciones/${selectedInstallationId || displayInstallations[0]?.id || ""}`,
      workOrderDetail: `/ordenes/${selectedWorkOrderId || displayWorkOrders[0]?.id || ""}`,
    };
    if (target === "newWorkOrder") setNewWorkOrderDefaults({});
    navigate(paths[target] || "/");
  };

  const openInstallation = (id: string) => {
    setSelectedInstallationId(id);
    navigate(`/instalaciones/${id}`);
  };

  const openWorkOrder = (id: string) => {
    setSelectedWorkOrderId(id);
    navigate(`/ordenes/${id}`);
  };

  const handleCreateWorkOrder = (form: any) => {
    const id = createWorkOrder(form);
    setSelectedWorkOrderId(id);
    navigate(`/ordenes/${id}`);
  };

  const handleSaveInstallation = (id: string | null | undefined, form: any) => {
    const newId = saveInstallation(id, form);
    if (!id) setSelectedInstallationId(newId);
  };

  const handleDeleteInstallation = (id: string) => {
    deleteInstallation(id);
    if (selectedInstallationId === id) {
      const nextInstallation = installations.find((installation) => installation.id !== id);
      setSelectedInstallationId(nextInstallation?.id || "");
      navigate("/instalaciones");
    }
  };

  const handleDeleteWorkOrder = (id: string) => {
    deleteWorkOrder(id);
    const next = workOrders.filter((order) => order.id !== id);
    setSelectedWorkOrderId(next[0]?.id || "");
    navigate("/ordenes");
  };

  const handleImportBackup = async (file: File) => {
    const restored = await importBackup(file);
    reloadData(restored);
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/instalaciones")) return "installations";
    if (path.startsWith("/ordenes")) return "workOrders";
    if (path.startsWith("/agenda")) return "agenda";
    if (path.startsWith("/informes")) return "reports";
    if (path.startsWith("/ajustes")) return "settings";
    return "home";
  };

  return (
    <div className="min-h-screen bg-slate-200 text-appText">
      <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-appBg pb-16 shadow-2xl md:max-w-3xl lg:max-w-6xl">
        <Routes>
          <Route path="/" element={<HomeScreen installations={displayInstallations} workOrders={displayWorkOrders} onNavigate={navigateTo} onOpenInstallation={openInstallation} onOpenWorkOrder={openWorkOrder} />} />
          <Route path="/instalaciones" element={<InstallationsScreen installations={displayInstallations} assets={assets} workOrders={workOrders} onOpenInstallation={openInstallation} onSaveInstallation={handleSaveInstallation} onDeleteInstallation={handleDeleteInstallation} />} />
          <Route path="/instalaciones/:id" element={<InstallationRoute installations={displayInstallations} assets={assets} workOrders={displayWorkOrders} onBack={() => navigate("/instalaciones")} onSaveInstallation={handleSaveInstallation} onDeleteInstallation={handleDeleteInstallation} onSaveAsset={saveAsset} onOpenWorkOrder={openWorkOrder} onCreateWorkOrder={(installationId: string, defaults = {}) => { setNewWorkOrderDefaults({ installationId, ...defaults }); navigate("/ordenes/nueva"); }} />} />
          <Route path="/ordenes" element={<WorkOrdersScreen workOrders={displayWorkOrders} filter={workOrderFilter} setFilter={setWorkOrderFilter} onOpenWorkOrder={openWorkOrder} onNewWorkOrder={() => { setNewWorkOrderDefaults({}); navigate("/ordenes/nueva"); }} />} />
          <Route path="/ordenes/nueva" element={<NewWorkOrderScreen installations={displayInstallations} technicians={technicians} defaults={newWorkOrderDefaults} onBack={() => navigate(-1)} onCreate={handleCreateWorkOrder} />} />
          <Route path="/ordenes/:id" element={<WorkOrderRoute workOrders={displayWorkOrders} installations={displayInstallations} technicians={technicians} settings={settings} onBack={() => navigate(-1)} onUpdateStatus={updateWorkOrderStatus} onSaveWorkOrder={saveWorkOrder} onDeleteWorkOrder={handleDeleteWorkOrder} />} />
          <Route path="/agenda" element={<AgendaScreen workOrders={displayWorkOrders} onOpenWorkOrder={openWorkOrder} onNewWorkOrder={() => { setNewWorkOrderDefaults({}); navigate("/ordenes/nueva"); }} />} />
          <Route path="/informes" element={<ReportsScreen workOrders={displayWorkOrders} installations={displayInstallations} settings={settings} />} />
          <Route path="/ajustes" element={<SettingsScreen settings={settings} technicians={technicians} onExportBackup={exportBackup} onImportBackup={handleImportBackup} onResetAllData={() => { reloadData(resetAllData()); navigate("/"); }} onSaveCompanySettings={saveCompanySettings} onSaveTechnician={saveTechnician} onDeleteTechnician={deleteTechnician} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {!location.pathname.includes("/ordenes/nueva") && <BottomNav current={getActiveTab()} onNavigate={navigateTo} />}
      </div>
    </div>
  );
}
