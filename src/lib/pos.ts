import type { Product } from "../types";

export function calcHpp(product: Product) {
  return product.ingredients.reduce((acc, ing) => acc + ing.cost, 0);
}

export function calcMargin(product: Product) {
  return product.sellPrice - calcHpp(product);
}
