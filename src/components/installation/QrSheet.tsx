import { Download, ExternalLink, QrCode, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

function safeFileName(value: string | undefined | null) {
  return String(value || "qr").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "qr";
}

function buildAppUrl(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${base}${normalizedPath}`;
}

function QrItem({ title, subtitle, payload, fileName }: any) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, { margin: 1, width: 220, color: { dark: "#071426", light: "#ffffff" } })
      .then((url) => {
        if (active) setQrUrl(url);
      })
      .catch(() => {
        if (active) setQrUrl("");
      });
    return () => {
      active = false;
    };
  }, [payload]);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft">
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
        <div className="grid h-28 w-28 place-items-center rounded-2xl bg-slate-50">
          {qrUrl ? <img className="h-24 w-24" src={qrUrl} alt="" /> : <QrCode className="text-slate-400" size={42} />}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-primaryDark">{title}</h3>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-500">{subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {qrUrl ? (
              <a className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700" href={qrUrl} download={`${safeFileName(fileName)}.png`}>
                <Download size={17} />
                PNG
              </a>
            ) : null}
            <a className="inline-flex items-center gap-2 rounded-2xl bg-primaryDark px-4 py-2 text-sm font-black text-cyan-100" href={payload}>
              <ExternalLink size={17} />
              Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QrSheet({ installation, assets, workOrders, onClose }: any) {
  const locations = useMemo(() => {
    const byName = new Map();
    [...assets.map((asset: any) => ({ name: asset.location, source: "Activo" })), ...workOrders.map((order: any) => ({ name: order.location, source: "OT" }))]
      .filter((item) => item.name)
      .forEach((item) => {
        const key = item.name.trim().toLowerCase();
        if (!byName.has(key)) byName.set(key, { name: item.name.trim(), sources: new Set() });
        byName.get(key).sources.add(item.source);
      });
    const derived = Array.from(byName.values()).map((item: any) => ({
      ...item,
      sourceLabel: Array.from(item.sources).join(" / "),
    }));
    const defined = (installation.locations || []).map((location: any) => ({
      ...location,
      sourceLabel: "Ubicacion QR",
      defined: true,
    }));
    const definedNames = new Set(defined.map((location: any) => String(location.name).toLowerCase()));
    return [...defined, ...derived.filter((location: any) => !definedNames.has(String(location.name).toLowerCase()))];
  }, [assets, workOrders]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 mx-auto flex w-full max-w-md items-end bg-black/45">
      <div className="max-h-[86vh] w-full overflow-y-auto rounded-t-[32px] bg-appBg p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">QR de instalacion</h2>
            <p className="font-semibold text-slate-500">{installation.name} · {locations.length} ubicaciones</p>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white" onClick={onClose} aria-label="Cerrar">
            <X size={23} />
          </button>
        </div>

        <div className="space-y-4">
          <QrItem
            title={installation.name}
            subtitle={installation.address}
            fileName={`qr-${installation.name}`}
            payload={buildAppUrl(`/instalaciones/${installation.id}`)}
          />
          {locations.map((location: any) => (
            <QrItem
              key={location.id || location.name}
              title={location.name}
              subtitle={`${installation.name} · ${location.code || location.sourceLabel}`}
              fileName={`qr-${installation.name}-${location.name}`}
              payload={buildAppUrl(location.id ? `/instalaciones/${installation.id}?ubicacionId=${encodeURIComponent(location.id)}` : `/instalaciones/${installation.id}?ubicacion=${encodeURIComponent(location.name)}`)}
            />
          ))}
          {assets.map((asset: any) => (
            <QrItem
              key={asset.id}
              title={asset.name}
              subtitle={`${asset.code || "Activo"} · ${asset.location || installation.name}`}
              fileName={`qr-${installation.name}-${asset.code || asset.name}`}
              payload={buildAppUrl(`/instalaciones/${installation.id}?activo=${encodeURIComponent(asset.id)}`)}
            />
          ))}
          {!locations.length ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center font-bold text-slate-500">Anade activos u ordenes con ubicacion para generar QR de zonas.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
