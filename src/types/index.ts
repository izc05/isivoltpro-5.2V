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
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  installationId: string;
  name: string;
  type: string;
  location: string;
  specialty: string;
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
  priority: string; // 'baja', 'media', 'alta', 'urgente'
  assignedTechnicianId: string;
  description: string;
  actionTaken: string;
  materials: { type: string; quantity: string }[];
  timeSpentMinutes: number;
  observations: string;
  initialPhotos: string[];
  finalPhotos: string[];
  createdAt: string;
  scheduledAt: string;
  completedAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    logoUrl: string;
  };
}
