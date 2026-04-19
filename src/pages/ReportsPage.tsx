import { useMemo, useState } from "react";
import type { PaymentMethod, Product, Sale } from "../types";
import { formatIDR } from "../lib/money";
import { calcHpp } from "../lib/pos";

type Props = {
  products: Product[];
  sales: Sale[];
};

type RangeKey = "all" | "today" | "7d" | "30d";

function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function rangeLabel(r: RangeKey) {
  if (r === "today") return "Hari ini";
  if (r === "7d") return "7 hari";
  if (r === "30d") return "30 hari";
  return "Semua";
}

function paymentLabel(m: PaymentMethod) {
  if (m === "cash") return "Tunai";
  if (m === "transfer") return "Transfer";
  return "QRIS";
}

export default function ReportsPage(props: Props) {
  const [range, setRange] = useState<RangeKey>("all");

  const inRangeSales = useMemo(() => {
    const now = Date.now();
    const start = (() => {
      if (range === "today") return startOfTodayMs();
      if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
      if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
      return 0;
    })();

    return props.sales.filter((s) => s.createdAt >= start);
  }, [props.sales, range]);

  const productMap = useMemo(() => {
    return new Map(props.products.map((p) => [p.id, p] as const));
  }, [props.products]);

  const report = useMemo(() => {
    const totalSales = inRangeSales.reduce((acc, s) => acc + s.total, 0);
    const transactionCount = inRangeSales.length;

    const payments: Record<PaymentMethod, number> = {
      cash: 0,
      transfer: 0,
      qris: 0,
    };

    const byProduct = new Map<
      string,
      {
        productId: string;
        name: string;
        unitPrice: number;
        qty: number;
        total: number;
        hppTotal: number;
      }
    >();

    let totalHpp = 0;

    for (const s of inRangeSales) {
      payments[s.paymentMethod] += 1;

      for (const line of s.lines) {
        const key = line.productId;
        const existing = byProduct.get(key);

        const product = productMap.get(line.productId);
        const unitHpp = product ? calcHpp(product) : 0;

        const lineTotal = line.sellPrice * line.qty;
        const lineHppTotal = unitHpp * line.qty;

        totalHpp += lineHppTotal;

        if (existing) {
          existing.qty += line.qty;
          existing.total += lineTotal;
          existing.hppTotal += lineHppTotal;
        } else {
          byProduct.set(key, {
            productId: line.productId,
            name: line.name,
            unitPrice: line.sellPrice,
            qty: line.qty,
            total: lineTotal,
            hppTotal: lineHppTotal,
          });
        }
      }
    }

    const grossProfit = totalSales - totalHpp;

    const products = Array.from(byProduct.values()).sort(
      (a, b) => b.total - a.total
    );

    return {
      totalSales,
      transactionCount,
      products,
      payments,
      totalHpp,
      grossProfit,
    };
  }, [inRangeSales, productMap]);

  return (
    <div className="grid gap-4">
      <section className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Laporan</h2>
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Total Penjualan
            </div>
            <div className="mt-1 text-lg font-semibold">
              {formatIDR(report.totalSales)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Omzet periode terpilih
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Jumlah Transaksi
            </div>
            <div className="mt-1 text-lg font-semibold">
              {report.transactionCount}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Periode: {rangeLabel(range)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Laba Kotor
            </div>
            <div
              className={
                report.grossProfit >= 0
                  ? "mt-1 text-lg font-semibold text-emerald-700"
                  : "mt-1 text-lg font-semibold text-rose-700"
              }
            >
              {formatIDR(report.grossProfit)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Penjualan - total HPP
            </div>
          </div>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Metode Pembayaran
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.keys(report.payments) as PaymentMethod[]).map((k) => (
            <div
              key={k}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="text-xs font-semibold uppercase text-slate-500">
                {paymentLabel(k)}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {report.payments[k]}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                jumlah transaksi
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Rincian Produk Terjual
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-2">Produk</th>
                <th className="py-2 pr-2">Unit</th>
                <th className="py-2 pr-2">Qty</th>
                <th className="py-2 pr-2">Total Penjualan</th>
                <th className="py-2 pr-2">Total HPP</th>
                <th className="py-2 pr-2">Laba Kotor</th>
              </tr>
            </thead>
            <tbody>
              {report.products.length === 0 ? (
                <tr>
                  <td className="py-6 text-slate-500" colSpan={6}>
                    Belum ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                report.products.map((p) => (
                  <tr key={p.productId} className="border-b border-slate-100">
                    <td className="py-3 pr-2 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 pr-2">{formatIDR(p.unitPrice)}</td>
                    <td className="py-3 pr-2">{p.qty}</td>
                    <td className="py-3 pr-2">{formatIDR(p.total)}</td>
                    <td className="py-3 pr-2">{formatIDR(p.hppTotal)}</td>
                    <td className="py-3 pr-2">
                      <span
                        className={
                          p.total - p.hppTotal >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {formatIDR(p.total - p.hppTotal)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
