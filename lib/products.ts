import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  { id: "espresso", name: "Espresso", priceCents: 295, emoji: "☕" },
  { id: "drip", name: "Drip Coffee", priceCents: 350, emoji: "☕" },
  { id: "latte", name: "Latte", priceCents: 475, emoji: "🥛" },
  { id: "cold-brew", name: "Cold Brew", priceCents: 425, emoji: "🧊" },
  { id: "beans", name: "Bag of Beans (250g)", priceCents: 1500, emoji: "🫘" },
];

export function getProduct(id: string): Product {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Unknown product id: ${id}`);
  }
  return product;
}
