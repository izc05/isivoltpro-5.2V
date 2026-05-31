import { useEffect, useMemo, useState } from "react";
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
import {
  initializeData,
  resetAllData,
  saveAssets,
  saveInstallations,
  saveSettings,
  saveTechnicians,
  saveWorkOrders,
} from "./services/storage";
import { createId, generateWorkOrderNumber, nowIso } from "./utils/ids";
import { buildLocalDateTime } from "./utils/dates";

const tabScreens = ["home", "installations", "workOrders", "agenda", "reports", "settings"];

const TYPE_LABELS = {
  preventiva: "Preventiva",
  correctiva: "Correctiva",
};

const STATUS_LABELS = {
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

const SPECIALTY_LABELS = {
  electricidad: "Electricidad",
  fontaneria: "Fontaneria",
  climatizacion: "Climatizacion",
  pci: "PCI",
  general: "General",
  mecanica: "Mecanica",
};

const PRIORITY_LABELS = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const TYPE_VALUES = {
  Preventiva: "preventiva",
  Correctiva: "correctiva",
  preventiva: "preventiva",
  correctiva: "correctiva",
};

const STATUS_VALUES = {
  Nueva: "nueva",
  Pendiente: "pendiente",
  Asignada: "asignada",
  "En curso": "en_curso",
  Observada: "observada",
  Demorada: "demorada",
  Completada: "completada",
  Cerrada: "cerrada",
};

const SPECIALTY_VALUES = {
  Electricidad: "electricidad",
  Fontaneria: "fontaneria",
  Climatizacion: "climatizacion",
  PCI: "pci",
  General: "general",
  Mecanica: "mecanica",
};

const PRIORITY_VALUES = {
  Baja: "baja",
  Media: "media",
  Alta: "alta",
  Urgente: "urgente",
};

const OPEN_WORK_ORDER_STATUSES = new Set(["nueva", "pendiente", "asignada", "en_curso", "observada", "demorada"]);

function labelFrom(map, value) {
  return map[value] || value || "";
}

function formatAddress(installation) {
  return [installation.address, installation.city, installation.province].filter(Boolean).join(", ");
}

function getVisualByType(type) {
  if (type === "hospital") return "hospital";
  if (type === "centro_especialidades") return "clinic";
  if (type === "residencia") return "residence";
  if (type === "polideportivo") return "sports";
  if (type === "colegio") return "school";
  return "clinic";
}

function enrichInstallations(installations, assets, workOrders) {
  return installations.map((installation) => {
    const installationAssets = assets.filter((asset) => asset.installationId === installation.id);
    const installationOrders = workOrders.filter((order) => order.installationId === installation.id);
    const specialties = Object.entries(
      installationAssets.reduce((groups, asset) => {
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

function enrichWorkOrders(workOrders, installations, assets, technicians) {
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

export default function App() {
  const [initialData] = useState(() => initializeData());
  const [screen, setScreen] = useState("home");
  const [previousScreen, setPreviousScreen] = useState("home");
  const [installations, setInstallations] = useState(initialData.installations);
  const [assets, setAssets] = useState(initialData.assets);
  const [workOrders, setWorkOrders] = useState(initialData.workOrders);
  const [technicians, setTechnicians] = useState(initialData.technicians);
  const [settings, setSettings] = useState(initialData.settings);
  const [selectedInstallationId, setSelectedInstallationId] = useState(initialData.installations[0]?.id || "");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(initialData.workOrders[1]?.id || initialData.workOrders[0]?.id || "");
  const [newWorkOrderDefaults, setNewWorkOrderDefaults] = useState({});
  const [workOrderFilter, setWorkOrderFilter] = useState("Todas");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);

  useEffect(() => saveInstallations(installations), [installations]);
  useEffect(() => saveAssets(assets), [assets]);
  useEffect(() => saveWorkOrders(workOrders), [workOrders]);
  useEffect(() => saveTechnicians(technicians), [technicians]);
  useEffect(() => saveSettings(settings), [settings]);

  const displayInstallations = useMemo(() => enrichInstallations(installations, assets, workOrders), [installations, assets, workOrders]);
  const displayWorkOrders = useMemo(() => enrichWorkOrders(workOrders, installations, assets, technicians), [workOrders, installations, assets, technicians]);

  const selectedInstallation = useMemo(
    () => displayInstallations.find((installation) => installation.id === selectedInstallationId) || displayInstallations[0],
    [displayInstallations, selectedInstallationId]
  );

  const selectedWorkOrder = useMemo(
    () => displayWorkOrders.find((order) => order.id === selectedWorkOrderId) || displayWorkOrders[0],
    [displayWorkOrders, selectedWorkOrderId]
  );

  const navigate = (target) => {
    if (target === "newWorkOrder") setNewWorkOrderDefaults({});
    if (tabScreens.includes(target)) setPreviousScreen(target);
    setScreen(target);
  };

  const openInstallation = (id) => {
    setSelectedInstallationId(id);
    setPreviousScreen("installations");
    setScreen("installationDetail");
  };

  const openWorkOrder = (id) => {
    setSelectedWorkOrderId(id);
    setPreviousScreen(screen === "agenda" ? "agenda" : "workOrders");
    setScreen("workOrderDetail");
  };

  const createWorkOrder = (form) => {
    const installation = installations.find((item) => item.id === form.installationId) || installations[0];
    const technician = technicians.find((item) => item.name === form.technician || item.id === form.technician);
    const scheduledAt = buildLocalDateTime(form.date, form.time);
    const createdAt = nowIso();
    const created = {
      id: createId("ot"),
      number: generateWorkOrderNumber(workOrders),
      title: form.title || form.description.split(".")[0] || "Nueva orden de trabajo",
      type: TYPE_VALUES[form.type] || "correctiva",
      status: "pendiente",
      installationId: installation.id,
      assetId: "",
      specialty: SPECIALTY_VALUES[form.specialty] || "general",
      location: form.location,
      priority: PRIORITY_VALUES[form.priority] || "media",
      assignedTechnicianId: technician?.id || "",
      description: form.description,
      actionTaken: "",
      materials: [],
      timeSpentMinutes: 0,
      observations: "",
      initialPhotos: form.photos?.length ? form.photos : [],
      finalPhotos: [],
      createdAt,
      scheduledAt,
      completedAt: "",
      updatedAt: createdAt,
    };
    setWorkOrders((current) => [created, ...current]);
    setSelectedWorkOrderId(created.id);
    setPreviousScreen("workOrders");
    setScreen("workOrderDetail");
  };

  const saveAsset = (id, form) => {
    const timestamp = nowIso();
    if (id) {
      setAssets((current) =>
        current.map((asset) =>
          asset.id === id ? { ...asset, ...form, updatedAt: timestamp } : asset
        )
      );
      return;
    }

    const created = {
      id: createId("ast"),
      ...form,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setAssets((current) => [created, ...current]);
  };

  const saveCompanySettings = (form) => {
    setSettings((current) => ({ ...current, company: form }));
  };

  const saveTechnician = (id, form) => {
    const timestamp = nowIso();
    if (id) {
      setTechnicians((current) =>
        current.map((t) => (t.id === id ? { ...t, ...form, updatedAt: timestamp } : t))
      );
      return;
    }
    const created = { id: createId("tech"), ...form, createdAt: timestamp, updatedAt: timestamp };
    setTechnicians((current) => [created, ...current]);
  };

  const deleteTechnician = (id) => {
    setTechnicians((current) => current.filter((t) => t.id !== id));
  };

  const saveInstallation = (id, form) => {
    const timestamp = nowIso();
    if (id) {
      setInstallations((current) =>
        current.map((installation) =>
          installation.id === id
            ? {
                ...installation,
                ...form,
                updatedAt: timestamp,
              }
            : installation
        )
      );
      return;
    }

    const created = {
      id: createId("inst"),
      ...form,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setInstallations((current) => [created, ...current]);
    setSelectedInstallationId(created.id);
  };

  const deleteInstallation = (id) => {
    setInstallations((current) => current.filter((installation) => installation.id !== id));
    setAssets((current) => current.filter((asset) => asset.installationId !== id));
    setWorkOrders((current) => current.filter((order) => order.installationId !== id));
    if (selectedInstallationId === id) {
      const nextInstallation = installations.find((installation) => installation.id !== id);
      setSelectedInstallationId(nextInstallation?.id || "");
      setScreen("installations");
    }
  };

  const updateWorkOrderStatus = (id, status) => {
    const normalizedStatus = STATUS_VALUES[status] || status;
    setWorkOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status: normalizedStatus,
              completedAt: normalizedStatus === "completada" ? nowIso() : order.completedAt,
              updatedAt: nowIso(),
            }
          : order
      )
    );
  };

  const saveWorkOrder = (id, form) => {
    const technician = technicians.find((item) => item.name === form.technician || item.id === form.technician);
    setWorkOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              title: form.title || order.title,
              type: TYPE_VALUES[form.type] || order.type,
              status: STATUS_VALUES[form.status] || order.status,
              installationId: form.installationId || order.installationId,
              specialty: SPECIALTY_VALUES[form.specialty] || order.specialty,
              location: form.location || order.location,
              priority: PRIORITY_VALUES[form.priority] || order.priority,
              assignedTechnicianId: technician?.id || form.assignedTechnicianId || order.assignedTechnicianId,
              description: form.description || order.description,
              actionTaken: form.actionTaken ?? order.actionTaken,
              observations: form.observations ?? order.observations,
              timeSpentMinutes: Number(form.timeSpentMinutes || order.timeSpentMinutes || 0),
              scheduledAt: form.date ? buildLocalDateTime(form.date, form.time) : order.scheduledAt,
              initialPhotos: form.initialPhotos || order.initialPhotos || [],
              finalPhotos: form.finalPhotos || order.finalPhotos || [],
              completedAt: (STATUS_VALUES[form.status] || order.status) === "completada" ? order.completedAt || nowIso() : order.completedAt,
              updatedAt: nowIso(),
            }
          : order
      )
    );
  };

  const deleteWorkOrder = (id) => {
    setWorkOrders((current) => {
      const next = current.filter((order) => order.id !== id);
      setSelectedWorkOrderId(next[0]?.id || "");
      return next;
    });
    setScreen(previousScreen === "agenda" ? "agenda" : "workOrders");
  };

  const reloadData = (nextData) => {
    setInstallations(nextData.installations);
    setAssets(nextData.assets);
    setWorkOrders(nextData.workOrders);
    setTechnicians(nextData.technicians);
    setSettings(nextData.settings);
    setSelectedInstallationId(nextData.installations[0]?.id || "");
    setSelectedWorkOrderId(nextData.workOrders[0]?.id || "");
    setScreen("home");
  };

  const handleImportBackup = async (file) => {
    const restored = await importBackup(file);
    reloadData(restored);
  };

  const activeTab = tabScreens.includes(screen)
    ? screen
    : screen === "installationDetail"
      ? "installations"
      : screen === "newWorkOrder" || screen === "workOrderDetail"
        ? "workOrders"
        : "home";

  return (
    <div className="min-h-screen bg-slate-200 text-appText">
      <div className="mx-auto min-h-screen w-full max-w-md overflow-hidden bg-appBg shadow-2xl">
        {screen === "home" && (
          <HomeScreen
            installations={displayInstallations}
            workOrders={displayWorkOrders}
            onNavigate={navigate}
            onOpenInstallation={openInstallation}
            onOpenWorkOrder={openWorkOrder}
          />
        )}
        {screen === "installations" && (
          <InstallationsScreen
            installations={displayInstallations}
            assets={assets}
            workOrders={workOrders}
            onOpenInstallation={openInstallation}
            onSaveInstallation={saveInstallation}
            onDeleteInstallation={deleteInstallation}
          />
        )}
        {screen === "installationDetail" && (
          <InstallationDetailScreen
            installation={selectedInstallation}
            assets={assets.filter((asset) => asset.installationId === selectedInstallation?.id)}
            workOrders={displayWorkOrders.filter((order) => order.installationId === selectedInstallation?.id)}
            onBack={() => setScreen("installations")}
            onSaveInstallation={saveInstallation}
            onDeleteInstallation={deleteInstallation}
            onSaveAsset={saveAsset}
            onCreateWorkOrder={(defaults = {}) => {
              setNewWorkOrderDefaults({ installationId: selectedInstallation?.id || "", ...defaults });
              setPreviousScreen("installationDetail");
              setScreen("newWorkOrder");
            }}
          />
        )}
        {screen === "workOrders" && (
          <WorkOrdersScreen
            workOrders={displayWorkOrders}
            filter={workOrderFilter}
            setFilter={setWorkOrderFilter}
            onOpenWorkOrder={openWorkOrder}
            onNewWorkOrder={() => {
              setNewWorkOrderDefaults({});
              setPreviousScreen("workOrders");
              setScreen("newWorkOrder");
            }}
          />
        )}
        {screen === "workOrderDetail" && (
          <WorkOrderDetailScreen
            order={selectedWorkOrder}
            installations={displayInstallations}
            technicians={technicians}
            onBack={() => setScreen(previousScreen)}
            onUpdateStatus={updateWorkOrderStatus}
            onSaveWorkOrder={saveWorkOrder}
            onDeleteWorkOrder={deleteWorkOrder}
          />
        )}
        {screen === "newWorkOrder" && (
          <NewWorkOrderScreen
            installations={displayInstallations}
            technicians={technicians}
            defaults={newWorkOrderDefaults}
            onBack={() => setScreen(previousScreen)}
            onCreate={createWorkOrder}
          />
        )}
        {screen === "agenda" && (
          <AgendaScreen
            workOrders={displayWorkOrders}
            onOpenWorkOrder={openWorkOrder}
            onNewWorkOrder={() => {
              setNewWorkOrderDefaults({});
              setScreen("newWorkOrder");
            }}
          />
        )}
        {screen === "reports" && <ReportsScreen workOrders={displayWorkOrders} installations={displayInstallations} settings={settings} />}
        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            technicians={technicians}
            onExportBackup={exportBackup}
            onImportBackup={handleImportBackup}
            onResetAllData={() => reloadData(resetAllData())}
            onSaveCompanySettings={saveCompanySettings}
            onSaveTechnician={saveTechnician}
            onDeleteTechnician={deleteTechnician}
          />
        )}
        {screen !== "newWorkOrder" && <BottomNav current={activeTab} onNavigate={navigate} />}
      </div>
    </div>
  );
}
