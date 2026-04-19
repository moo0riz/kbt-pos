import { useEffect, useMemo, useState } from "react";
import "./App.css";
import type { Product, Sale } from "./types";
import {
  loadProducts,
  loadSales,
  saveProducts,
  saveSales,
} from "./lib/storage";
import PosPage from "./pages/PosPage";
import ProductsPage from "./pages/ProductsPage";
import ReportsPage from "./pages/ReportsPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import Sidebar from "./components/Sidebar";
import ResolutionGate from "./components/ResolutionGate";

type TabKey = "pos" | "products" | "reports" | "sales";

function renderPage(
  tab: TabKey,
  products: Product[],
  sales: Sale[],
  setSales: (s: Sale[]) => void,
  setProducts: (p: Product[]) => void
) {
  if (tab === "pos")
    return (
      <PosPage products={products} sales={sales} onChangeSales={setSales} />
    );
  if (tab === "products")
    return <ProductsPage products={products} onChange={setProducts} />;
  if (tab === "reports")
    return <ReportsPage products={products} sales={sales} />;
  return <SalesHistoryPage sales={sales} />;
}

function Icon(props: { path: string; title: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <title>{props.title}</title>
      <path d={props.path} fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabKey>("pos");
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [sales, setSales] = useState<Sale[]>(() => loadSales());

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const raw = localStorage.getItem("pos-sidebar-collapsed");
    return raw === "1";
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveSales(sales);
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("pos-sidebar-collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen]);

  const page = useMemo(() => {
    return renderPage(tab, products, sales, setSales, setProducts);
  }, [products, sales, tab]);

  return (
    <ResolutionGate>
      <div className="h-dvh overflow-hidden bg-slate-50">
      <div className="flex h-dvh overflow-hidden">
        <Sidebar
          value={tab}
          onChange={setTab}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          onReset={() => {
            if (confirm("Reset semua data (barang + transaksi)?")) {
              setProducts([]);
              setSales([]);
            }
          }}
          header={
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500">
                Dashboard POS
              </div>
              <div className="text-sm font-semibold text-slate-900">Kasir</div>
            </div>
          }
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-screen-xl px-3 py-3 sm:px-4 sm:py-4 md:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    {tab}
                  </div>
                  <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                    Kasir & Manajemen Barang
                  </h1>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 md:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Icon
                    title="Menu"
                    path="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"
                  />
                  Menu
                </button>
              </div>
            </div>
          </header>

          <main className="h-[calc(100dvh-57px)] overflow-hidden sm:h-[calc(100dvh-73px)]">
            <div className="mx-auto h-full w-full max-w-screen-xl overflow-hidden p-3 sm:p-4 md:p-6">
              <div className="h-full min-h-0 overflow-hidden">{page}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
    </ResolutionGate>
  );
}
