import type { ReactNode } from "react";

export type NavKey = "pos" | "products" | "reports" | "sales";

type NavItem = {
  key: NavKey;
  label: string;
  icon: ReactNode;
};

type Props = {
  value: NavKey;
  onChange: (next: NavKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  header?: ReactNode;
  onReset?: () => void;
  /** Mobile drawer mode */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function Icon(props: { path: string; title: string; size?: number }) {
  const size = props.size ?? 18;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="shrink-0">
      <title>{props.title}</title>
      <path d={props.path} fill="currentColor" />
    </svg>
  );
}

const items: NavItem[] = [
  {
    key: "pos",
    label: "POS (Kasir)",
    icon: (
      <Icon
        title="POS"
        path="M7 4h10a2 2 0 0 1 2 2v4H5V6a2 2 0 0 1 2-2Zm-2 8h14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6Zm3 2v2h2v-2H8Zm4 0v2h5v-2h-5Z"
      />
    ),
  },
  {
    key: "products",
    label: "Input Barang",
    icon: (
      <Icon
        title="Barang"
        path="M7 7h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Zm-3.5-7.5 1.5-1.5 1.5 1.5-1.5 1.5-1.5-1.5Zm0 4 1.5-1.5 1.5 1.5-1.5 1.5-1.5-1.5Zm0 4 1.5-1.5 1.5 1.5-1.5 1.5-1.5-1.5Z"
      />
    ),
  },
  {
    key: "reports",
    label: "Laporan",
    icon: (
      <Icon
        title="Laporan"
        path="M4 19h16v2H4v-2Zm2-2h3V10H6v7Zm5 0h3V6h-3v11Zm5 0h3V13h-3v4Z"
      />
    ),
  },
  {
    key: "sales",
    label: "Riwayat",
    icon: (
      <Icon
        title="Riwayat"
        path="M12 8v5l4 2-.75 1.86L10 14V8h2Zm0-6a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"
      />
    ),
  },
];

function itemClass(active: boolean, collapsed: boolean) {
  const base = collapsed
    ? "flex w-full items-center justify-center rounded-lg p-3 text-base"
    : "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base";

  return active
    ? `${base} bg-slate-900 text-white`
    : `${base} text-slate-700 hover:bg-slate-100`;
}

function SidebarPanel(props: {
  value: NavKey;
  onChange: (next: NavKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  header?: ReactNode;
  onReset?: () => void;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside
      className={
        props.collapsed
          ? "flex h-dvh w-[72px] flex-col gap-3 border-r border-slate-200 bg-white p-3"
          : "flex h-dvh w-[260px] flex-col gap-3 border-r border-slate-200 bg-white p-3"
      }
    >
      <div className="rounded-xl bg-slate-100 p-2">
        <div className="flex items-center justify-between gap-2">
          <div className={props.collapsed ? "hidden" : "block"}>{props.header}</div>

          <div className="flex items-center gap-2">
            {props.showClose ? (
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                onClick={props.onClose}
                aria-label="Close"
                title="Tutup"
              >
                <Icon
                  title="Close"
                  path="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3 1.42 1.42Z"
                />
              </button>
            ) : null}

            {/* Collapse toggle only for tablet+ */}
            <button
              type="button"
              className="hidden rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 md:inline-flex"
              onClick={props.onToggleCollapsed}
              aria-label={props.collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={props.collapsed ? "Perbesar" : "Perkecil"}
            >
              {props.collapsed ? (
                <Icon title="Expand" path="M9 6h9v9h-2V9.41l-9.29 9.3-1.42-1.42L14.59 8H9V6Z" />
              ) : (
                <Icon title="Collapse" path="M15 18H6V9h2v5.59l9.29-9.3 1.42 1.42L9.41 16H15v2Z" />
              )}
            </button>
          </div>
        </div>
      </div>

      <nav className="grid gap-2">
        {items.map((it) => {
          const active = it.key === props.value;
          return (
            <button
              key={it.key}
              type="button"
              className={itemClass(active, props.collapsed)}
              onClick={() => props.onChange(it.key)}
              title={it.label}
              aria-current={active ? "page" : undefined}
            >
              {it.icon}
              {props.collapsed ? null : <span className="truncate">{it.label}</span>}
            </button>
          );
        })}
      </nav>

      {props.onReset ? (
        <div className="mt-auto">
          <button
            type="button"
            className={
              props.collapsed
                ? "flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50"
                : "flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
            }
            onClick={props.onReset}
            title="Reset"
          >
            <Icon title="Reset" path="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z" />
            {props.collapsed ? null : <span>Reset</span>}
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export default function Sidebar(props: Props) {
  const mobileOpen = Boolean(props.mobileOpen);

  return (
    <>
      {/* Tablet/Desktop sidebar */}
      <div className="hidden md:block">
        <SidebarPanel
          value={props.value}
          onChange={props.onChange}
          collapsed={props.collapsed}
          onToggleCollapsed={props.onToggleCollapsed}
          header={props.header}
          onReset={props.onReset}
        />
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-slate-900/40"
            onClick={props.onMobileClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50">
            <SidebarPanel
              value={props.value}
              onChange={(next) => {
                props.onChange(next);
                props.onMobileClose?.();
              }}
              collapsed={false}
              onToggleCollapsed={() => {}}
              header={props.header}
              onReset={props.onReset}
              showClose
              onClose={props.onMobileClose}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
