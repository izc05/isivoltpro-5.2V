export function getStatusTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("complet") || normalized.includes("prevent")) return "success";
  if (normalized.includes("curso") || normalized.includes("servicio") || normalized.includes("operacion")) return "info";
  if (normalized.includes("pend")) return "warning";
  if (normalized.includes("atras") || normalized.includes("correctiva")) return "danger";
  return "neutral";
}

export function nextWorkOrderNumber(workOrders) {
  const max = workOrders.reduce((highest, order) => {
    const number = Number(String(order.number).split("-").at(-1));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 15);
  return `OT-2025-${String(max + 1).padStart(5, "0")}`;
}
