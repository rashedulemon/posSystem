# Build Prompt: Basic POS (Point of Sale) System

Copy everything below into Google Antigravity as your build prompt.

---

## Project Overview

Build a **basic, modern Point of Sale (POS) web application** for a small retail/shop use case. The app must be clean, fast, and easy to use on both mobile phones and desktop screens.

## Tech Stack

- **Frontend build tool:** Vite
- **Frontend framework:** React (functional components + hooks)
- **Styling:** Tailwind CSS
- **Backend / Database / Auth:** Supabase (Postgres, Supabase Auth, Row Level Security, Realtime)
- **Routing:** React Router using `HashRouter` (required for GitHub Pages compatibility)
- **Version control / Hosting (dev phase):** GitHub repo, deployed to GitHub Pages
- **Icons:** lucide-react

## Design Direction

- **Design style:** Modern, minimal, clean — generous white space, soft shadows, rounded corners (`rounded-xl`/`rounded-2xl`), no visual clutter
- **Accent color:** Indigo (`#6366F1`) as the primary accent for buttons, active states, and highlights, paired with a neutral gray/white base (background: `#F9FAFB`, text: `#111827`)
- **Typography:** A clean sans-serif (e.g. Inter), clear size hierarchy — large readable totals/prices, medium labels, small metadata text
- **Design principles to follow:**
  - Mobile-first responsive layout (design for small screens first, scale up with Tailwind's `sm:` / `md:` / `lg:` breakpoints)
  - Large, thumb-friendly tap targets (minimum ~44px height) for any button used during checkout
  - Clear visual hierarchy — price and total amounts should be the most prominent text on the checkout screen
  - Consistent spacing scale (Tailwind's default spacing) — no arbitrary/inconsistent margins
  - Subtle motion only (simple hover/active state transitions), nothing distracting
  - Empty states and loading states for every data-driven screen (no blank white screens while loading)
  - Sticky/fixed cart summary and "Complete Sale" button so the primary action is always visible without scrolling, on both mobile and desktop

## Layout Requirements

- **Mobile:** single-column, tab-based switch between "Products" and "Cart" views
- **Desktop:** two-panel layout — product grid on the left, cart/checkout panel fixed on the right
- **Navigation:** simple sidebar or top bar (collapsible on mobile) for switching between Checkout, Products, Orders, and Dashboard

## Database Schema (Supabase/Postgres)

- `users` — linked to Supabase `auth.users`, with a `role` column (`admin` | `cashier`)
- `categories` — `id`, `name`
- `products` — `id`, `name`, `price`, `cost`, `sku`, `category_id`, `stock_qty`, `image_url`
- `orders` — `id`, `cashier_id`, `customer_id` (nullable), `total`, `discount`, `tax`, `payment_method`, `status`, `created_at`
- `order_items` — `id`, `order_id`, `product_id`, `qty`, `unit_price`, `subtotal`
- `payments` — `id`, `order_id`, `method`, `amount`, `change_due`

Apply Row Level Security policies so only authenticated staff can read/write. Use a Postgres function/RPC for creating an order and decrementing stock atomically.

## Core Features (MVP — build these first)

1. **Authentication** — login/logout via Supabase Auth, with admin vs cashier roles
2. **Product management** (admin only) — add, edit, delete products and categories
3. **Checkout screen** — browse/search products, add to cart, adjust quantity, remove items, apply a discount, auto-calculate subtotal/tax/total
4. **Payment recording** — select payment method (cash/card/mobile), calculate change due for cash
5. **Order creation** — save completed sale to `orders` + `order_items`, decrement product stock
6. **Receipt view** — simple on-screen (and printable) receipt after checkout
7. **Order history** — list of past orders, filterable by date, viewable in detail
8. **Dashboard** — today's total sales, number of orders, top-selling products

## Nice-to-Have Features (only after MVP is working)

- Barcode/SKU quick search in checkout
- Low-stock warning badge on products
- Customer records with purchase history
- Sales reports with date range and CSV export
- Refund/void order with reason logging
- Dark mode toggle

## Deployment Notes

- Configure `vite.config.js` with the correct `base` path for GitHub Pages
- Use `HashRouter` so routes work correctly on GitHub Pages
- Store Supabase URL and anon key as environment variables; note that these will be visible in the built static site, so security must rely on Supabase RLS policies, not on hiding the anon key

## Deliverable

A working Vite + React + Tailwind + Supabase app, deployable to GitHub Pages, implementing the MVP feature list above with the design direction described.
