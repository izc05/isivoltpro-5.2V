export interface Installation {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  responsible?: string;
  contact?: string;
  phone?: string;
  email?: string;
  gpsLat?: string;
  gpsLng?: string;
  locations?: InstallationLocation[];
  documents?: AppDocument[];
  notes?: string;
}

export interface Asset {
  id: string;
  installationId: string;
  name: string;
  type: string;
  location: string;
  specialty: string;
  code?: string;
  criticality?: string;
  status?: string;
  imageUrl?: string;
  gpsLat?: string;
  gpsLng?: string;
  locationId?: string;
  documents?: AppDocument[];
  notes?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  type: string; // 'visita', 'preventiva', 'correctiva'
  status: string; // 'nueva', 'pendiente', 'asignada', 'en_curso', 'observada', 'demorada', 'completada', 'cerrada'
  installationId: string;
  assetId?: string;
  specialty: string;
  location: string;
  locationId?: string;
  priority: string; // 'baja', 'media', 'alta', 'urgente'
  assignedTechnicianId: string;
  description: string;
  actionTaken: string;
  materials: { id?: string; type: string; quantity: string; photoUrl?: string }[];
  timeSpentMinutes: number;
  observations: string;
  initialPhotos: string[];
  finalPhotos: string[];
  gpsLat?: string;
  gpsLng?: string;
  visitSignature?: WorkOrderSignature;
  closureSignature?: WorkOrderSignature;
  createdAt: string;
  scheduledAt: string;
  completedAt: string;
  updatedAt: string;
}

export interface WorkOrderSignature {
  name: string;
  dataUrl: string;
  signedAt: string;
}

export interface InstallationLocation {
  id: string;
  name: string;
  code?: string;
  description?: string;
  gpsLat?: string;
  gpsLng?: string;
  createdAt?: string;
}

export interface AppDocument {
  id: string;
  name: string;
  type?: string;
  dataUrl: string;
  addedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  role?: string;
  specialty?: string;
  shift?: string;
  status?: string;
  notes?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  companyName?: string;
  theme?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    logoUrl: string;
  };
}

export type AppData = {
  installations: Installation[];
  assets: Asset[];
  workOrders: WorkOrder[];
  technicians: Technician[];
  settings: Settings;
};

export type WorkOrderForm = Partial<WorkOrder> & {
  type?: string;
  technician?: string;
  date?: string;
  time?: string;
  photos?: string[];
};

export type DisplayInstallation = Installation & {
  rawAddress?: string;
  rawStatus?: string;
  visual?: string;
  assetsCount?: number;
  lastUpdate?: string;
  summary: {
    assets: number;
    preventive: number;
    corrective: number;
    openOrders: number;
    technicians: number;
  };
  specialties: { name: string; assets: number }[];
};

export type DisplayWorkOrder = Omit<WorkOrder, "type" | "status" | "priority" | "specialty"> & {
  rawType: string;
  rawStatus: string;
  rawPriority: string;
  rawSpecialty: string;
  type: string;
  status: string;
  priority: string;
  specialty: string;
  installation: string;
  installationImageUrl: string;
  installationAddress: string;
  assetName: string;
  technician: string;
  photos: string[];
  time: string;
};
