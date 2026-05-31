import { ClipboardList } from "lucide-react";
import Card from "./Card";

export default function EmptyState({ title = "Sin resultados", text = "No hay elementos para mostrar." }) {
  return (
    <Card className="grid place-items-center py-10 text-center">
      <ClipboardList className="mb-3 text-slate-700" size={36} />
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-1 max-w-64 text-sm font-semibold text-slate-500">{text}</p>
    </Card>
  );
}
