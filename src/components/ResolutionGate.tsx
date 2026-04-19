import { useEffect, useMemo, useState } from "react";
import {
  getDeviceGateStatus,
  MIN_HEIGHT,
  MIN_WIDTH,
  type DeviceGateStatus,
} from "../lib/deviceGate";

type Props = {
  children: React.ReactNode;
};

function IconWarning() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="64"
      height="64"
      aria-hidden="true"
      className="text-amber-500"
    >
      <path
        fill="currentColor"
        d="M1 21h22L12 2 1 21Zm12-3h-2v2h2v-2Zm0-8h-2v6h2V10Z"
      />
    </svg>
  );
}

function prettyReason(s: DeviceGateStatus) {
  switch (s.reason) {    case "orientation":
      return "Orientasi layar harus landscape.";
    case "width":
      return `Lebar layar minimal ${MIN_WIDTH}px.`;
    case "height":
      return `Tinggi layar minimal ${MIN_HEIGHT}px.`;
    default:
      return "Spesifikasi layar belum memenuhi syarat.";
  }
}

export default function ResolutionGate(props: Props) {
  const [status, setStatus] = useState<DeviceGateStatus>(() =>
    getDeviceGateStatus()
  );

  useEffect(() => {
    function onChange() {
      setStatus(getDeviceGateStatus());
    }

    window.addEventListener("resize", onChange);

    const orient = window.matchMedia("(orientation: landscape)");
    orient.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("resize", onChange);
      orient.removeEventListener?.("change", onChange);
    };
  }, []);

  const blocked = !status.ok;

  const detail = useMemo(() => {
    return `${status.width}×${status.height}${status.landscape ? "" : " (portrait)"}`;
  }, [status.height, status.landscape, status.width]);

  if (!blocked) return <>{props.children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh w-full flex-col overflow-hidden bg-slate-50">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="card">
            <div className="flex flex-col items-center text-center">
              <div className="animate-pulse">
                <IconWarning />
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Resolusi Tidak Didukung
              </h1>

              <p className="mt-2 text-base text-slate-600">
                Website ini hanya dapat digunakan dengan resolusi minimal <b>{MIN_WIDTH}×{MIN_HEIGHT}</b> dalam mode landscape.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Silakan gunakan perangkat yang sesuai atau ubah orientasi layar Anda.
              </p>

              <div className="mt-4 w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-700">Kondisi saat ini</span>
                  <span className="font-semibold text-slate-900">{detail}</span>
                </div>
                <div className="mt-1 text-slate-600">{prettyReason(status)}</div>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-semibold text-white hover:bg-slate-800"
                onClick={() => setStatus(getDeviceGateStatus())}
              >
                Coba Lagi
              </button>

              <p className="mt-3 text-xs text-slate-500">
                Layar akan otomatis diperiksa ulang saat Anda resize atau rotasi perangkat.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            {MIN_WIDTH}×{MIN_HEIGHT} • Landscape
          </div>
        </div>
      </div>
    </div>
  );
}
