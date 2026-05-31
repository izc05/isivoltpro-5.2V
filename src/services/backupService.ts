import {
  loadAssets,
  loadInstallations,
  loadSettings,
  loadTechnicians,
  loadWorkOrders,
  replaceAllData,
} from "./storage";

function backupFileName() {
  const date = new Date().toISOString().slice(0, 10);
  return `isivoltpro-mantenimiento-backup-${date}.json`;
}

export function exportBackup() {
  const payload = {
    app: "IsiVoltPro Mantenimiento",
    version: 1,
    exportedAt: new Date().toISOString(),
    installations: loadInstallations(),
    assets: loadAssets(),
    workOrders: loadWorkOrders(),
    technicians: loadTechnicians(),
    settings: loadSettings(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return payload;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo."));
    reader.readAsText(file);
  });
}

export async function importBackup(file) {
  if (!file) throw new Error("No se ha seleccionado ningun archivo.");
  const text = await readFileAsText(file);
  const payload = JSON.parse(text);
  if (!payload || typeof payload !== "object") {
    throw new Error("La copia de seguridad no tiene un formato valido.");
  }
  if (!Array.isArray(payload.installations) || !Array.isArray(payload.assets) || !Array.isArray(payload.workOrders)) {
    throw new Error("La copia no contiene instalaciones, activos u ordenes validas.");
  }
  return replaceAllData(payload);
}
