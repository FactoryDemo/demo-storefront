"use client";

import { useState } from "react";
import { PRODUCTS, getProduct } from "../lib/products";
import { calculateLineTotal, calculateCartTotal } from "../lib/pricing";
import { formatCurrency } from "../lib/currency";
import type { CartItem } from "../lib/types";

export default function Storefront() {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(productId: string) {
    setCart((current) => {
      const existing = current.find((i) => i.productId === productId);
      if (existing) {
        return current.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  const total = calculateCartTotal(cart);

  return (
    <>
      <div className="header">
        <h1>☕ Bean &amp; Byte</h1>
        <span className="tagline">
          Buy 3+ of any one item and that line is 10% off
        </span>
      </div>

      <div className="grid">
        {PRODUCTS.map((product) => (
          <div className="product-card" key={product.id}>
            <div style={{ fontSize: 30 }}>{product.emoji}</div>
            <div className="name">{product.name}</div>
            <div className="price">{formatCurrency(product.priceCents)}</div>
            <button onClick={() => addToCart(product.id)}>Add to cart</button>
          </div>
        ))}
      </div>

      <div className="cart-panel">
        <h2>Your cart</h2>
        {cart.length === 0 ? (
          <div className="cart-empty">Nothing here yet. The coffee awaits.</div>
        ) : (
          <>
            {cart.map((item) => {
              const product = getProduct(item.productId);
              return (
                <div className="cart-line" key={item.productId}>
                  <span>
                    {product.emoji} {product.name}
                  </span>
                  <span className="qty-controls">
                    <button
                      onClick={() => changeQuantity(item.productId, -1)}
                      aria-label={`Remove one ${product.name}`}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item.productId, 1)}
                      aria-label={`Add one ${product.name}`}
                    >
                      +
                    </button>
                    <span style={{ minWidth: 72, textAlign: "right" }}>
                      {formatCurrency(
                        calculateLineTotal(product, item.quantity)
                      )}
                    </span>
                  </span>
                </div>
              );
            })}
            <div className="cart-total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
