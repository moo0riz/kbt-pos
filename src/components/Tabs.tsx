type TabKey = "pos" | "products" | "reports" | "sales";

type Props = {
  value: TabKey;
  onChange: (next: TabKey) => void;
};

const tabs: Array<{ key: TabKey; label: string; shortLabel: string }> = [
  { key: "pos", label: "POS (Kasir)", shortLabel: "POS" },
  { key: "products", label: "Input Barang", shortLabel: "Barang" },
  { key: "reports", label: "Laporan", shortLabel: "Laporan" },
  { key: "sales", label: "Riwayat", shortLabel: "Riwayat" },
];

function activeTabClass(active: boolean) {
  return active
    ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
    : "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900";
}

export default function Tabs(props: Props) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="inline-flex min-w-max rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => {
          const active = t.key === props.value;
          return (
            <button
              key={t.key}
              type="button"
              className={activeTabClass(active)}
              onClick={() => props.onChange(t.key)}
            >
              <span className="sm:hidden">{t.shortLabel}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
