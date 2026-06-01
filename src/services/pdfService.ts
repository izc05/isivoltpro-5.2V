import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
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

function materialSummary(materials = []) {
  const items = materials
    .map((item) => [item.quantity, item.type || item.name].filter(Boolean).join(" x "))
    .filter(Boolean);
  return items.length ? items.join(", ") : "-";
}

function safeName(value) {
  return String(value || "informe").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function generateWorkOrderReport(order, settings) {
  const doc = getBasePdf(`Parte ${order.number}`, settings);
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  const rows = [
    ["Tipo", order.type],
    ["Estado", order.status],
    ["Instalacion", order.installation],
    ["Ubicacion", order.location || "-"],
    ["Especialidad", order.specialty],
    ["Prioridad", order.priority],
    ["Tecnico", order.technician || "Sin asignar"],
    ["Fecha", formatShortDate(order.scheduledAt || order.createdAt)],
    ["Material instalado", materialSummary(order.materials)],
  ];
  if (order.gpsLat && order.gpsLng) rows.push(["GPS", `${order.gpsLat}, ${order.gpsLng}`]);

  autoTable(doc, {
    startY: 60,
    head: [["Campo", "Detalle"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [7, 57, 107] },
    styles: { fontSize: 10 },
  });

  let y = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.text("Descripcion", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(order.description || "-", 180), 14, y + 7);
  y += 28;

  if (order.actionTaken) {
    doc.setFont("helvetica", "bold");
    doc.text("Trabajo realizado", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(order.actionTaken, 180), 14, y + 7);
    y += 28;
  }

  const signatures = [
    ["Firma parte de visita", order.visitSignature],
    ["Firma cierre OT", order.closureSignature],
  ].filter(([, signature]) => signature?.dataUrl);
  signatures.forEach(([label, signature]: any) => {
    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${signature.name || "Firmado"} · ${new Date(signature.signedAt).toLocaleString("es-ES")}`, 14, y + 7);
    try {
      doc.addImage(signature.dataUrl, "PNG", 14, y + 12, 70, 28);
    } catch {
      doc.text("Firma adjunta no disponible en PDF.", 14, y + 14);
    }
    y += 48;
  });

  doc.save(`parte_${safeName(order.number)}.pdf`);
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
    materialSummary(order.materials),
    order.title
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["OT", "Instalacion", "Fecha", "Estado", "Tiempo", "Material", "Asunto"]],
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
    materialSummary(order.materials),
    order.title
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["OT", "Instalacion", "Fecha", "Estado", "Especialidad", "Material", "Asunto"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [3, 105, 161] }, // sky-700
    styles: { fontSize: 9 }
  });

  doc.save("informe_preventivos.pdf");
}

export function generateVisitReport(workOrders, settings) {
  const doc = getBasePdf("Partes de Visita", settings);
  const visits = workOrders.filter((o) => o.type === "Parte de visita");

  const body = visits.map((order) => [
    order.number,
    order.installation,
    formatShortDate(order.createdAt),
    order.status,
    order.technician || "Sin asignar",
    materialSummary(order.materials),
    order.title
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["OT", "Instalacion", "Fecha", "Estado", "Tecnico", "Material", "Asunto"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [4, 120, 87] },
    styles: { fontSize: 9 }
  });

  doc.save("partes_visita.pdf");
}

export function generateMonthlyReport(workOrders, settings) {
  const doc = getBasePdf("Resumen Mensual", settings);
  
  const body = workOrders.map((order) => [
    order.number,
    order.type,
    order.installation,
    order.status,
    order.technician || "Sin asignar",
    materialSummary(order.materials),
    formatShortDate(order.completedAt || order.createdAt)
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["OT", "Tipo", "Instalacion", "Estado", "Tecnico", "Material", "Fecha"]],
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
    materialSummary(order.materials),
    order.title
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["OT", "Tipo", "Estado", "Especialidad", "Material", "Asunto"]],
    body,
    theme: "striped",
    headStyles: { fillColor: [109, 40, 217] }, // violet-700
    styles: { fontSize: 9 }
  });

  doc.save(`informe_instalacion_${installation?.name?.replace(/\s+/g, "_") || "general"}.pdf`);
}
