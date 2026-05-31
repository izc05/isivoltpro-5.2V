import { defaultAssets, defaultInstallations, defaultSettings, defaultTechnicians, defaultWorkOrders } from "../data/defaultData";

const STORAGE_KEYS = {
  installations: "isivoltpro_mantenimiento_installations",
  assets: "isivoltpro_mantenimiento_assets",
  workOrders: "isivoltpro_mantenimiento_work_orders",
  technicians: "isivoltpro_mantenimiento_technicians",
  settings: "isivoltpro_mantenimiento_settings",
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`No se pudo leer ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error guardando ${key}`, error);
    if (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") {
      alert("Error: El almacenamiento local esta lleno. Has subido demasiadas fotos de alta resolucion y la memoria del navegador se ha agotado. Elimina algunas fotos antiguas o usa imagenes mas pequeñas.");
    }
  }
}

function seedIfMissing(key, value) {
  if (localStorage.getItem(key) !== null) return;
  writeJson(key, value);
}

export function initializeData() {
  seedIfMissing(STORAGE_KEYS.installations, defaultInstallations);
  seedIfMissing(STORAGE_KEYS.assets, defaultAssets);
  seedIfMissing(STORAGE_KEYS.workOrders, defaultWorkOrders);
  seedIfMissing(STORAGE_KEYS.technicians, defaultTechnicians);
  seedIfMissing(STORAGE_KEYS.settings, defaultSettings);

  return {
    installations: loadInstallations(),
    assets: loadAssets(),
    workOrders: loadWorkOrders(),
    technicians: loadTechnicians(),
    settings: loadSettings(),
  };
}

export function loadInstallations() {
  return readJson(STORAGE_KEYS.installations, defaultInstallations);
}

export function saveInstallations(installations) {
  writeJson(STORAGE_KEYS.installations, installations);
}

export function loadAssets() {
  return readJson(STORAGE_KEYS.assets, defaultAssets);
}

export function saveAssets(assets) {
  writeJson(STORAGE_KEYS.assets, assets);
}

export function loadWorkOrders() {
  return readJson(STORAGE_KEYS.workOrders, defaultWorkOrders);
}

export function saveWorkOrders(workOrders) {
  writeJson(STORAGE_KEYS.workOrders, workOrders);
}

export function loadTechnicians() {
  return readJson(STORAGE_KEYS.technicians, defaultTechnicians);
}

export function saveTechnicians(technicians) {
  writeJson(STORAGE_KEYS.technicians, technicians);
}

export function loadSettings() {
  return readJson(STORAGE_KEYS.settings, defaultSettings);
}

export function saveSettings(settings) {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  return initializeData();
}

export function replaceAllData({ installations, assets, workOrders, technicians, settings }) {
  saveInstallations(Array.isArray(installations) ? installations : defaultInstallations);
  saveAssets(Array.isArray(assets) ? assets : defaultAssets);
  saveWorkOrders(Array.isArray(workOrders) ? workOrders : defaultWorkOrders);
  saveTechnicians(Array.isArray(technicians) ? technicians : defaultTechnicians);
  saveSettings(settings && typeof settings === "object" ? settings : defaultSettings);
  return initializeData();
}
