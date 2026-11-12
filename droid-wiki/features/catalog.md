# Catalog

Active contributors: nicolasschmidt2001 (Nicolas Schmidt)

## Purpose

The catalog renders 13 products across Hot coffee, Cold, Beans, and Bakery. It is checked-in data, not a database or remote menu API (`lib/products.ts`, `components/Storefront.tsx`).

## Layout and abstractions

`lib/types.ts` defines `ProductCategory`, `Category`, and `Product`. Each product has a stable id, positive integer `priceCents`, category, description, and image path. `lib/products.ts` exports `PRODUCTS`, ordered `CATEGORIES`, `productsInCategory`, and `getProduct`; the latter throws for an unknown id.

`app/page.tsx` renders `components/Storefront.tsx`. That component builds the hero, category anchor navigation, and one section per category. `components/ProductCard.tsx` is the client-side interaction boundary: it reads the quantity from the shared cart, displays the price through `lib/currency.ts`, and renders the product photo with Next.js Image.

## Add-to-cart flow

Clicking a card calls `addItem(product.id)` from `components/CartProvider.tsx`, then sends `product_added` with the product properties and next displayed quantity (`components/ProductCard.tsx`, `lib/analytics.ts`). Adding does not automatically open the drawer. The card shows an in-cart count when that product's quantity is positive.

The menu notice is a separate optional flag-gated component, `components/MenuAnnouncement.tsx`; it does not filter or change catalog data. See [Analytics](analytics.md) for the flag and [Cart](cart.md) for shared quantities.

## Integration and modification points

Add or edit menu entries in `lib/products.ts`. Keep ids stable because saved carts, order lines, and analytics refer to them. Adding a category also requires updating the `ProductCategory` union in `lib/types.ts`. Category order follows `CATEGORIES`; product order follows `PRODUCTS`.

Product photos live under `public/products/`; `tests/products.test.ts` expects each image field to be `/products/<product-id>.jpg`. There are 13 checked-in product JPGs. The test checks path strings, not image existence. Layout and responsive styling live in `app/globals.css`, outside the measured catalog source scope.

Price changes also affect [Pricing](pricing.md) and server-created orders because `lib/pricing.ts` looks products up from this same catalog. There is no per-order product-name snapshot: `components/OrderLines.tsx` resolves names from the current catalog.

## Scope and measurements

The table below defines this scope: five source files, one dedicated unit-test file, and one unique human contributor in `origin/main` history. The test/code file-count ratio is 1/5 (0.20), not a coverage percentage. Counts exclude photos, CSS, imported integration modules, and the shared `e2e/storefront.spec.ts`.

Contributor method: query `git log origin/main` over these six paths, deduplicate human identities, and exclude `[bot]` accounts. The only human is Nicolas Schmidt; `.github/CODEOWNERS` maps the same person to nicolasschmidt2001.

## Key source files

| Repo-root path | Role |
| --- | --- |
| `app/page.tsx` | Home route |
| `components/Storefront.tsx` | Hero, categories, and menu sections |
| `components/ProductCard.tsx` | Product display and add action |
| `lib/products.ts` | Static data and lookup functions |
| `lib/types.ts` | Product, category, and shared cart types |
| `tests/products.test.ts` | Id, cents, image-path, category, and lookup checks |

`e2e/storefront.spec.ts` also checks category headings, the Drip Coffee price, and the presence of add buttons. See [Testing](../how-to-contribute/testing.md).
