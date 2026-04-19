import type { PaymentMethod, Product, Sale } from "../types";

const PRODUCTS_KEY = "pos-mvp-products-v2";
const SALES_KEY = "pos-mvp-sales-v2";

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isPaymentMethod(x: unknown): x is PaymentMethod {
  return x === "cash" || x === "transfer" || x === "qris";
}

export function loadProducts(): Product[] {
  const parsed = safeParse(localStorage.getItem(PRODUCTS_KEY));
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((x) => x as Partial<Product>)
    .filter((p): p is Product => {
      return (
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        Array.isArray(p.ingredients) &&
        typeof p.sellPrice === "number"
      );
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      sellPrice: p.sellPrice,
      ingredients: (p.ingredients as unknown[])
        .map((x) => x as any)
        .filter(
          (i): i is { id: string; name: string; cost: number } =>
            typeof i?.id === "string" &&
            typeof i?.name === "string" &&
            typeof i?.cost === "number"
        )
        .map((i) => ({ id: i.id, name: i.name, cost: i.cost })),
    }));
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function loadSales(): Sale[] {
  const parsed = safeParse(localStorage.getItem(SALES_KEY));
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((x) => x as any)
    .filter(
      (s): s is {
        id: string;
        createdAt: number;
        lines: unknown[];
        total: number;
        paymentMethod?: unknown;
      } =>
        typeof s?.id === "string" &&
        typeof s?.createdAt === "number" &&
        Array.isArray(s?.lines) &&
        typeof s?.total === "number"
    )
    .map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      total: s.total,
      paymentMethod: isPaymentMethod(s.paymentMethod) ? s.paymentMethod : "cash",
      lines: s.lines
        .map((l) => l as any)
        .filter(
          (l): l is { productId: string; name: string; qty: number; sellPrice: number } =>
            typeof l?.productId === "string" &&
            typeof l?.name === "string" &&
            typeof l?.qty === "number" &&
            typeof l?.sellPrice === "number"
        )
        .map((l) => ({
          productId: l.productId,
          name: l.name,
          qty: l.qty,
          sellPrice: l.sellPrice,
        })),
    }));
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}
