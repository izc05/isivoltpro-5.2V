function downloadTextFile(fileName, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function csvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function materialSummary(materials = []) {
  const items = materials
    .map((item) => [item.quantity, item.type || item.name].filter(Boolean).join(" x "))
    .filter(Boolean);
  return items.length ? items.join(", ") : "";
}

export function exportReportJson({ workOrders, installations, filters, stats }) {
  const payload = {
    app: "IsiVoltPro Mantenimiento",
    exportedAt: new Date().toISOString(),
    filters,
    stats,
    workOrders,
    installations,
  };
  downloadTextFile(`informe-mantenimiento-${todayStamp()}.json`, "application/json;charset=utf-8", JSON.stringify(payload, null, 2));
  return payload;
}

export function exportWorkOrdersCsv(workOrders) {
  const headers = ["Numero", "Tipo", "Estado", "Prioridad", "Instalacion", "Ubicacion", "Especialidad", "Tecnico", "Fecha", "Material instalado", "Titulo", "Trabajo realizado"];
  const rows = workOrders.map((order) => [
    order.number,
    order.type,
    order.status,
    order.priority,
    order.installation,
    order.location,
    order.specialty,
    order.technician,
    order.scheduledAt || order.createdAt,
    materialSummary(order.materials),
    order.title,
    order.actionTaken,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvValue).join(";")).join("\n");
  downloadTextFile(`ordenes-mantenimiento-${todayStamp()}.csv`, "text/csv;charset=utf-8", csv);
  return csv;
}
