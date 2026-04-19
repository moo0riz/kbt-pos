import { useMemo, useState } from "react";
import type { Ingredient, Product } from "../types";
import { clampNonNegativeNumber, formatIDR } from "../lib/money";
import { calcHpp, calcMargin } from "../lib/pos";
import { newId } from "../lib/id";

type DraftIngredient = { name: string; cost: string };

type DraftProduct = {
  name: string;
  sellPrice: string;
  ingredients: DraftIngredient[];
};

function toNumber(input: string) {
  const n = Number(input);
  return clampNonNegativeNumber(Number.isFinite(n) ? n : 0);
}

function toIngredient(d: DraftIngredient): Ingredient {
  return {
    id: newId(),
    name: d.name.trim(),
    cost: toNumber(d.cost),
  };
}

function toProduct(draft: DraftProduct): Omit<Product, "id"> {
  return {
    name: draft.name.trim(),
    sellPrice: toNumber(draft.sellPrice),
    ingredients: draft.ingredients
      .map(toIngredient)
      .filter((i) => i.name.length > 0 && i.cost >= 0),
  };
}

type Props = {
  products: Product[];
  onChange: (next: Product[]) => void;
};

export default function ProductsPage(props: Props) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftProduct>({
    name: "",
    sellPrice: "",
    ingredients: [{ name: "", cost: "" }],
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return props.products;
    return props.products.filter((p) => p.name.toLowerCase().includes(q));
  }, [props.products, query]);

  function resetDraft() {
    setEditingId(null);
    setDraft({
      name: "",
      sellPrice: "",
      ingredients: [{ name: "", cost: "" }],
    });
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      sellPrice: String(p.sellPrice),
      ingredients: p.ingredients.map((i) => ({
        name: i.name,
        cost: String(i.cost),
      })),
    });
  }

  function removeProduct(id: string) {
    props.onChange(props.products.filter((x) => x.id !== id));
    if (editingId === id) resetDraft();
  }

  function addIngredientRow() {
    setDraft((d) => ({
      ...d,
      ingredients: [...d.ingredients, { name: "", cost: "" }],
    }));
  }

  function removeIngredientRow(idx: number) {
    setDraft((d) => ({
      ...d,
      ingredients: d.ingredients.filter((_, i) => i !== idx),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const data = toProduct(draft);
    if (!data.name) return;

    if (editingId) {
      props.onChange(
        props.products.map((p) =>
          p.id === editingId ? { ...data, id: editingId } : p
        )
      );
      resetDraft();
      return;
    }

    props.onChange([{ ...data, id: newId() }, ...props.products]);
    resetDraft();
  }

  const preview = useMemo(() => {
    const p: Product = { ...toProduct(draft), id: "preview" };
    return {
      hpp: calcHpp(p),
      margin: calcMargin(p),
    };
  }, [draft]);

  return (
    <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="card min-w-0 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            {editingId ? "Edit barang" : "Tambah barang"}
          </h2>
          {editingId ? (
            <button
              type="button"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              onClick={resetDraft}
            >
              Batal
            </button>
          ) : null}
        </div>

        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Nama barang</span>
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring"
              placeholder="Mis. Es Kopi Susu"
            />
          </label>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">
                Bahan-bahan
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={addIngredientRow}
              >
                + Bahan
              </button>
            </div>

            <div className="grid gap-2">
              {draft.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_44px]"
                >
                  <input
                    value={ing.name}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        ingredients: d.ingredients.map((x, i) =>
                          i === idx ? { ...x, name: e.target.value } : x
                        ),
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring"
                    placeholder={
                      idx === 0 ? "Mis. SUSU / KOPI / GULA" : "Nama bahan"
                    }
                  />
                  <input
                    inputMode="numeric"
                    value={ing.cost}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        ingredients: d.ingredients.map((x, i) =>
                          i === idx ? { ...x, cost: e.target.value } : x
                        ),
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring"
                    placeholder="Harga"
                  />
                  <button
                    type="button"
                    className="h-11 rounded-lg border border-slate-200 bg-white text-base font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => removeIngredientRow(idx)}
                    disabled={draft.ingredients.length === 1}
                    title="Hapus baris"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Harga jual</span>
            <input
              inputMode="numeric"
              value={draft.sellPrice}
              onChange={(e) =>
                setDraft((d) => ({ ...d, sellPrice: e.target.value }))
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring"
              placeholder="15000"
            />
          </label>

          <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">HPP (jumlah harga bahan)</span>
              <span className="font-semibold">{formatIDR(preview.hpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Margin</span>
              <span className="font-semibold">{formatIDR(preview.margin)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-3 text-base font-semibold text-white hover:bg-slate-800"
          >
            {editingId ? "Simpan perubahan" : "Tambah"}
          </button>
        </form>
      </section>

      <section className="card min-w-0 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">List barang</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-slate-200 focus:ring sm:max-w-sm"
            placeholder="Cari barang..."
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-2">Nama</th>
                <th className="py-2 pr-2">HPP</th>
                <th className="py-2 pr-2">Harga jual</th>
                <th className="py-2 pr-2">Margin</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="py-6 text-slate-500" colSpan={5}>
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const hpp = calcHpp(p);
                  const margin = p.sellPrice - hpp;
                  return (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-3 pr-2 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3 pr-2">{formatIDR(hpp)}</td>
                      <td className="py-3 pr-2">{formatIDR(p.sellPrice)}</td>
                      <td className="py-3 pr-2">
                        <span
                          className={
                            margin >= 0 ? "text-emerald-700" : "text-rose-700"
                          }
                        >
                          {formatIDR(margin)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                            onClick={() => startEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            onClick={() => removeProduct(p.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
