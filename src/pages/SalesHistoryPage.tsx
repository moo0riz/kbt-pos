import { useMemo, useState } from "react";
import type { PaymentMethod, Sale } from "../types";
import { formatIDR } from "../lib/money";

type Props = {
  sales: Sale[];
};

type RangeKey = "today" | "7d" | "30d" | "all";

function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function paymentLabel(m: PaymentMethod) {
  if (m === "cash") return "Tunai";
  if (m === "transfer") return "Transfer";
  return "QRIS";
}

function rangeLabel(r: RangeKey) {
  if (r === "today") return "Hari ini";
  if (r === "7d") return "7 hari";
  if (r === "30d") return "30 hari";
  return "Semua";
}

function calcSaleTotalQty(sale: Sale) {
  return sale.lines.reduce((acc, l) => acc + l.qty, 0);
}

function calcLineSubtotal(sellPrice: number, qty: number) {
  return sellPrice * qty;
}

export default function SalesHistoryPage(props: Props) {
  const [range, setRange] = useState<RangeKey>("all");
  const [openSaleId, setOpenSaleId] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    const now = Date.now();
    const start = (() => {
      if (range === "today") return startOfTodayMs();
      if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
      if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
      return 0;
    })();

    return props.sales.filter((s) => s.createdAt >= start);
  }, [props.sales, range]);

  const rows = useMemo(() => {
    return filteredSales.map((s) => {
      const totalQty = calcSaleTotalQty(s);
      const itemsText = s.lines.map((l) => `${l.name} x${l.qty}`).join(", ");
      return { ...s, totalQty, itemsText };
    });
  }, [filteredSales]);

  const openSale = useMemo(() => {
    if (!openSaleId) return null;
    return filteredSales.find((x) => x.id === openSaleId) ?? null;
  }, [filteredSales, openSaleId]);

  return (
    <div className="grid h-full min-h-0 gap-4 overflow-hidden">
      <section className="card flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Riwayat penjualan</h2>
              <div className="mt-1 text-xs text-slate-500">
                {rows.length} transaksi ({rangeLabel(range)})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-slate-600">Periode</div>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as RangeKey)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring"
              >
                <option value="all">Semua</option>
                <option value="today">Hari ini</option>
                <option value="7d">7 hari terakhir</option>
                <option value="30d">30 hari terakhir</option>
              </select>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs font-semibold uppercase text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-2">Waktu</th>
                  <th className="py-2 pr-2">Ringkasan</th>
                  <th className="py-2 pr-2">Metode</th>
                  <th className="py-2 pr-2 text-right">Total</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={5}>
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-2 text-slate-700">
                        {new Date(s.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 pr-2 text-slate-700">
                        <div className="font-medium text-slate-900">{s.totalQty} item</div>
                        <div className="mt-0.5 text-xs text-slate-600">{s.itemsText || "-"}</div>
                      </td>
                      <td className="py-3 pr-2 text-slate-700">{paymentLabel(s.paymentMethod)}</td>
                      <td className="py-3 pr-2 text-right font-semibold">{formatIDR(s.total)}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                          onClick={() => setOpenSaleId(s.id)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {openSale ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenSaleId(null)}
        >
          <div
            className="card flex h-full w-full min-h-0 flex-col overflow-hidden rounded-none sm:h-auto sm:max-h-[80dvh] sm:max-w-2xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 border-b border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Detail transaksi</h3>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(openSale.createdAt).toLocaleString("id-ID")} • {paymentLabel(openSale.paymentMethod)}
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  onClick={() => setOpenSaleId(null)}
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-left text-sm">
                  <thead className="text-xs font-semibold uppercase text-slate-500">
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-2">Produk</th>
                      <th className="py-2 pr-2">Harga</th>
                      <th className="py-2 pr-2">Qty</th>
                      <th className="py-2 pr-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openSale.lines.map((l, idx) => (
                      <tr key={`${openSale.id}-${idx}`} className="border-b border-slate-100">
                        <td className="py-3 pr-2 font-medium text-slate-900">{l.name}</td>
                        <td className="py-3 pr-2 text-slate-700">{formatIDR(l.sellPrice)}</td>
                        <td className="py-3 pr-2 text-slate-700">{l.qty}</td>
                        <td className="py-3 pr-2 text-right font-semibold">
                          {formatIDR(calcLineSubtotal(l.sellPrice, l.qty))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-end justify-between gap-3">
                <div className="text-xs text-slate-500">{calcSaleTotalQty(openSale)} item total</div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase text-slate-500">Total</div>
                  <div className="text-lg font-semibold">{formatIDR(openSale.total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
