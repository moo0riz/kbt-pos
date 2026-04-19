import { useMemo, useState } from "react";
import type { CartLine, PaymentMethod, Product, Sale } from "../types";
import { clampNonNegativeNumber, formatIDR } from "../lib/money";
import { newId } from "../lib/id";

type Props = {
  products: Product[];
  sales: Sale[];
  onChangeSales: (next: Sale[]) => void;
};

function incCartLine(lines: CartLine[], productId: string, by: number) {
  const found = lines.find((x) => x.productId === productId);
  if (!found) {
    if (by <= 0) return lines;
    return [...lines, { productId, qty: by }];
  }

  return lines
    .map((x) => (x.productId === productId ? { ...x, qty: x.qty + by } : x))
    .filter((x) => x.qty > 0);
}

function setCartLineQty(lines: CartLine[], productId: string, nextQty: number) {
  const safe = Math.max(0, Math.floor(clampNonNegativeNumber(nextQty)));
  return lines
    .map((x) => (x.productId === productId ? { ...x, qty: safe } : x))
    .filter((x) => x.qty > 0);
}

export default function PosPage(props: Props) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const productMap = useMemo(() => {
    return new Map(props.products.map((p) => [p.id, p] as const));
  }, [props.products]);

  const cart = useMemo(() => {
    const expanded = lines
      .map((l) => {
        const p = productMap.get(l.productId);
        if (!p) return null;
        return {
          ...l,
          name: p.name,
          sellPrice: p.sellPrice,
          subTotal: p.sellPrice * l.qty,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const total = expanded.reduce((acc, x) => acc + x.subTotal, 0);
    return { expanded, total };
  }, [lines, productMap]);

  function addOne(productId: string) {
    setLines((prev) => incCartLine(prev, productId, 1));
  }

  function decOne(productId: string) {
    setLines((prev) => incCartLine(prev, productId, -1));
  }

  function setQty(productId: string, nextQty: number) {
    setLines((prev) => setCartLineQty(prev, productId, nextQty));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((x) => x.productId !== productId));
  }

  function resetCart() {
    setLines([]);
    setPaymentMethod("cash");
  }

  function checkout() {
    if (cart.expanded.length === 0) return;

    const sale: Sale = {
      id: newId(),
      createdAt: Date.now(),
      total: cart.total,
      paymentMethod,
      lines: cart.expanded.map((x) => ({
        productId: x.productId,
        name: x.name,
        qty: x.qty,
        sellPrice: x.sellPrice,
      })),
    };

    props.onChangeSales([sale, ...props.sales]);
    resetCart();
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[2fr_5fr]">
      {/* Cart */}
      <section className="card flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-3 sm:p-4">
          <h2 className="text-base font-semibold">Keranjang</h2>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={resetCart}
            disabled={cart.expanded.length === 0}
          >
            Clear
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
          {cart.expanded.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
              Keranjang kosong. Klik item di bawah untuk menambahkan.
            </div>
          ) : (
            <div className="grid gap-2">
              {cart.expanded.map((x) => (
                <div
                  key={x.productId}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  {/* Mobile: stack; Desktop: 2 columns */}
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{x.name}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{formatIDR(x.sellPrice)} / item</div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="h-11 w-11 rounded-lg border border-slate-200 bg-white text-base font-semibold hover:bg-slate-50"
                          onClick={() => decOne(x.productId)}
                          aria-label="Kurangi"
                        >
                          −
                        </button>
                        <input
                          inputMode="numeric"
                          value={String(x.qty)}
                          onChange={(e) => setQty(x.productId, Number(e.target.value || 0))}
                          className="h-11 w-20 rounded-lg border border-slate-200 bg-white px-2 text-center text-base outline-none ring-slate-200 focus:ring"
                        />
                        <button
                          type="button"
                          className="h-11 w-11 rounded-lg border border-slate-200 bg-white text-base font-semibold hover:bg-slate-50"
                          onClick={() => addOne(x.productId)}
                          aria-label="Tambah"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="ml-auto text-sm font-semibold text-rose-700 hover:text-rose-800"
                          onClick={() => removeLine(x.productId)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-sm font-semibold">{formatIDR(x.subTotal)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky checkout bar on mobile */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3 sm:p-4">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Metode pembayaran</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring"
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </label>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total</span>
              <span className="text-lg font-semibold">{formatIDR(cart.total)}</span>
            </div>

            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-700"
              onClick={checkout}
              disabled={cart.expanded.length === 0}
            >
              Checkout & Simpan
            </button>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="card flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-3 sm:p-4">
          <div>
            <h2 className="text-base font-semibold">Pilih item</h2>
            <p className="mt-1 text-sm text-slate-500">Klik item untuk menambah qty ke keranjang.</p>
          </div>
          <div className="shrink-0 text-xs font-semibold text-slate-500">{props.products.length} item</div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
          {props.products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
              Belum ada barang. Tambahkan dulu di tab <b>Input Barang</b>.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {props.products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="card p-2 text-left hover:border-slate-300 hover:bg-slate-50 sm:p-3 lg:p-4"
                  onClick={() => addOne(p.id)}
                >
                  <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{formatIDR(p.sellPrice)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
