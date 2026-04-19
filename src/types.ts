export type Ingredient = {
  id: string;
  name: string;
  cost: number;
};

export type Product = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  sellPrice: number;
};

export type CartLine = {
  productId: string;
  qty: number;
};

export type PaymentMethod = "cash" | "transfer" | "qris";

export type Sale = {
  id: string;
  createdAt: number;
  lines: Array<{
    productId: string;
    name: string;
    qty: number;
    sellPrice: number;
  }>;
  total: number;
  paymentMethod: PaymentMethod;
};
