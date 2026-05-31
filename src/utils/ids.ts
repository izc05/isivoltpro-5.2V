export function createId(prefix = "id") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function generateWorkOrderNumber(workOrders = [], date = new Date()) {
  const year = date.getFullYear();
  const highest = workOrders.reduce((max, order) => {
    const match = String(order.number || "").match(/^OT-(\d{4})-(\d+)$/);
    if (!match || Number(match[1]) !== year) return max;
    return Math.max(max, Number(match[2]));
  }, 0);
  return `OT-${year}-${String(highest + 1).padStart(5, "0")}`;
}
