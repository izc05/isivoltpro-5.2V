import { create } from 'zustand';
import { initializeData } from '../services/storage';
import { createId, generateWorkOrderNumber, nowIso } from '../utils/ids';
import { buildLocalDateTime } from '../utils/dates';

const TYPE_VALUES = {
  "Parte de visita": "visita",
  Visita: "visita",
  visita: "visita",
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

const FINISHED_WORK_ORDER_STATUSES = new Set(["completada", "cerrada"]);

const initialData = initializeData();

export const useStore = create((set, get) => ({
  installations: initialData.installations,
  assets: initialData.assets,
  workOrders: initialData.workOrders,
  technicians: initialData.technicians,
  settings: initialData.settings,

  setInstallations: (installations) => set({ installations }),
  setAssets: (assets) => set({ assets }),
  setWorkOrders: (workOrders) => set({ workOrders }),
  setTechnicians: (technicians) => set({ technicians }),
  setSettings: (settings) => set({ settings }),

  createWorkOrder: (form) => {
    const { installations, technicians, workOrders } = get();
    const installation = installations.find((item) => item.id === form.installationId) || installations[0];
    const technician = technicians.find((item) => item.name === form.technician || item.id === form.technician);
    const scheduledAt = buildLocalDateTime(form.date, form.time);
    const createdAt = nowIso();
    const description = form.description || "";
    const title = form.title || description.split(".")[0] || "Nueva orden de trabajo";
    const created = {
      id: createId("ot"),
      number: generateWorkOrderNumber(workOrders),
      title,
      type: TYPE_VALUES[form.type] || "correctiva",
      status: "pendiente",
      installationId: installation?.id || "",
      assetId: "",
      specialty: SPECIALTY_VALUES[form.specialty] || "general",
      location: form.location || "",
      priority: PRIORITY_VALUES[form.priority] || "media",
      assignedTechnicianId: technician?.id || "",
      description,
      actionTaken: "",
      materials: Array.isArray(form.materials) ? form.materials : [],
      timeSpentMinutes: 0,
      observations: "",
      initialPhotos: form.photos?.length ? form.photos : [],
      finalPhotos: [],
      createdAt,
      scheduledAt,
      completedAt: "",
      updatedAt: createdAt,
    };
    
    set({ workOrders: [created, ...workOrders] });
    return created.id;
  },

  saveAsset: (id, form) => {
    const { assets } = get();
    const timestamp = nowIso();
    if (id) {
      set({
        assets: assets.map((asset) =>
          asset.id === id ? { ...asset, ...form, updatedAt: timestamp } : asset
        )
      });
      return id;
    }

    const created = {
      id: createId("ast"),
      ...form,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    set({ assets: [created, ...assets] });
    return created.id;
  },

  saveCompanySettings: (form) => {
    const { settings } = get();
    set({ settings: { ...settings, company: form } });
  },

  saveTechnician: (id, form) => {
    const { technicians } = get();
    const timestamp = nowIso();
    if (id) {
      set({
        technicians: technicians.map((t) => (t.id === id ? { ...t, ...form, updatedAt: timestamp } : t))
      });
      return id;
    }
    const created = { id: createId("tech"), ...form, createdAt: timestamp, updatedAt: timestamp };
    set({ technicians: [created, ...technicians] });
    return created.id;
  },

  deleteTechnician: (id) => {
    const { technicians } = get();
    set({ technicians: technicians.filter((t) => t.id !== id) });
  },

  saveInstallation: (id, form) => {
    const { installations } = get();
    const timestamp = nowIso();
    if (id) {
      set({
        installations: installations.map((installation) =>
          installation.id === id
            ? { ...installation, ...form, updatedAt: timestamp }
            : installation
        )
      });
      return id;
    }

    const created = {
      id: createId("inst"),
      ...form,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    set({ installations: [created, ...installations] });
    return created.id;
  },

  deleteInstallation: (id) => {
    const { installations, assets, workOrders } = get();
    set({
      installations: installations.filter((installation) => installation.id !== id),
      assets: assets.filter((asset) => asset.installationId !== id),
      workOrders: workOrders.filter((order) => order.installationId !== id)
    });
  },

  updateWorkOrderStatus: (id, status) => {
    const { workOrders } = get();
    const normalizedStatus = STATUS_VALUES[status] || status;
    set({
      workOrders: workOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: normalizedStatus,
              completedAt: FINISHED_WORK_ORDER_STATUSES.has(normalizedStatus) ? order.completedAt || nowIso() : "",
              updatedAt: nowIso(),
            }
          : order
      )
    });
  },

  saveWorkOrder: (id, form) => {
    const { workOrders, technicians } = get();
    const technician = technicians.find((item) => item.name === form.technician || item.id === form.technician);
    set({
      workOrders: workOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              title: form.title || order.title,
              type: TYPE_VALUES[form.type] || order.type,
              status: STATUS_VALUES[form.status] || order.status,
              installationId: form.installationId || order.installationId,
              specialty: SPECIALTY_VALUES[form.specialty] || order.specialty,
              location: form.location ?? order.location,
              priority: PRIORITY_VALUES[form.priority] || order.priority,
              assignedTechnicianId: technician?.id || form.assignedTechnicianId || order.assignedTechnicianId,
              description: form.description ?? order.description,
              actionTaken: form.actionTaken ?? order.actionTaken,
              observations: form.observations ?? order.observations,
              materials: Array.isArray(form.materials)
                ? form.materials
                    .map((item) => ({
                      type: String(item.type || "").trim(),
                      quantity: String(item.quantity || "").trim(),
                    }))
                    .filter((item) => item.type || item.quantity)
                : order.materials || [],
              timeSpentMinutes: Number(form.timeSpentMinutes || order.timeSpentMinutes || 0),
              scheduledAt: form.date ? buildLocalDateTime(form.date, form.time) : order.scheduledAt,
              initialPhotos: form.initialPhotos || order.initialPhotos || [],
              finalPhotos: form.finalPhotos || order.finalPhotos || [],
              completedAt: FINISHED_WORK_ORDER_STATUSES.has(STATUS_VALUES[form.status] || order.status) ? order.completedAt || nowIso() : "",
              updatedAt: nowIso(),
            }
          : order
      )
    });
  },

  deleteWorkOrder: (id) => {
    const { workOrders } = get();
    set({
      workOrders: workOrders.filter((order) => order.id !== id)
    });
  },

  reloadData: (nextData) => {
    set({
      installations: nextData.installations,
      assets: nextData.assets,
      workOrders: nextData.workOrders,
      technicians: nextData.technicians,
      settings: nextData.settings,
    });
  },
}));
