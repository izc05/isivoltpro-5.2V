import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatShortDate } from "../utils/dates";

function getBasePdf(title, settings) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header background
  doc.setFillColor(7, 57, 107); // Primary dark blue
  doc.rect(0, 0, pageWidth, 28, "F");
  
  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.company?.name || "IsiVoltPro", 14, 18);
  
  // Header text
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Informe Operativo", pageWidth - 14, 18, { align: "right" });
  
  // Title
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 45);
  
  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Fecha de generacion: ${new Date().toLocaleDateString("es-ES")}`, 14, 52);
  
  return doc;
}

export function generateCorrectiveReport(workOrders, settings) {
  const doc = getBasePdf("Partes Correctivos", settings);
  const correctives = workOrders.filter((o) => o.type === "Correctiva");
  
  const body = correctives.map((order) => [
    order.number,
    order.installation,
    formatShortDate(order.createdAt),
    order.status,
    order.timeSpentMinutes ? `${order.timeSpentMinutes} min` : "-",
    order.title
  ]);

  doc.autoTable({
    startY: 60,
    head: [["OT", "Instalacion", "Fecha", "Estado", "Tiempo", "Asunto"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [15, 118, 110] }, // cyan-700
    styles: { fontSize: 9 }
  });

  doc.save("informe_correctivos.pdf");
}

export function generatePreventiveReport(workOrders, settings) {
  const doc = getBasePdf("Partes Preventivos", settings);
  const preventives = workOrders.filter((o) => o.type === "Preventiva");
  
  const body = preventives.map((order) => [
    order.number,
    order.installation,
    formatShortDate(order.createdAt),
    order.status,
    order.specialty,
    order.title
  ]);

  doc.autoTable({
    startY: 60,
    head: [["OT", "Instalacion", "Fecha", "Estado", "Especialidad", "Asunto"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [3, 105, 161] }, // sky-700
    styles: { fontSize: 9 }
  });

  doc.save("informe_preventivos.pdf");
}

export function generateMonthlyReport(workOrders, settings) {
  const doc = getBasePdf("Resumen Mensual", settings);
  
  const body = workOrders.map((order) => [
    order.number,
    order.type,
    order.installation,
    order.status,
    order.technician || "Sin asignar",
    formatShortDate(order.completedAt || order.createdAt)
  ]);

  doc.autoTable({
    startY: 60,
    head: [["OT", "Tipo", "Instalacion", "Estado", "Tecnico", "Fecha"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [180, 83, 9] }, // amber-700
    styles: { fontSize: 9 }
  });

  doc.save("informe_mensual.pdf");
}

export function generateInstallationReport(workOrders, installation, settings) {
  const doc = getBasePdf(`Informe de Instalacion: ${installation?.name || "General"}`, settings);
  const filtered = installation ? workOrders.filter((o) => o.installationId === installation.id) : workOrders;
  
  const body = filtered.map((order) => [
    order.number,
    order.type,
    order.status,
    order.specialty,
    order.title
  ]);

  doc.autoTable({
    startY: 60,
    head: [["OT", "Tipo", "Estado", "Especialidad", "Asunto"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [109, 40, 217] }, // violet-700
    styles: { fontSize: 9 }
  });

  doc.save(`informe_instalacion_${installation?.name?.replace(/\s+/g, "_") || "general"}.pdf`);
}
