# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Type-check then build for production
npm run lint       # Run ESLint with auto-fix
npm run preview    # Preview production build locally
```

No test suite is currently configured.

## Environment Setup

Create `.env` in the project root with Firebase credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Architecture Overview

**Mobile-first order management PWA** for Vietnamese e-commerce shops, built with React 19 + Vite + Firebase.

### Auth & Multi-tenancy Flow

```
BrowserRouter
  └── Provider (AuthProvider > ShopProvider)
        └── App (routes)
              └── ProtectedRoute  →  redirects to /login (no user) or /setup (no shop)
```

- `AuthContext` wraps Firebase `onAuthStateChanged` — provides `user`.
- `ShopContext` resolves which shop the authenticated user belongs to (owner or editor role). The shop's `shopId` equals the owner's Firebase UID. Members join via a `shop_members` Firestore collection.
- Every authenticated page must be wrapped in `<ProtectedRoute>` to enforce both auth and shop checks.

### Firestore Data Model

All shop data lives under `shops/{shopId}/{collection}`:

| Collection | Key fields |
|---|---|
| `orders` | `uuid` (uuidv7), `deliveryStatus`, `deleted` (soft-delete) |
| `orderItems` | `uuid`, `orderId`, `productId` |
| `customers` | `uuid`, `name`, `phone` |
| `products` | `uuid`, `name`, `sellPrice` |
| `shippers` | `uuid`, `name` |

Top-level collections: `shops/{shopId}`, `shop_members/{shopId}_{userId}`.

Soft-delete pattern: records are never removed; set `deleted: true` and filter client-side. IDs use `uuidv7()` for time-ordered uniqueness.

### Service Layer (`src/services/firestore/`)

- `base.ts` — `getShopCollection(shopId, col)` helper used by every other service.
- Each entity file exposes: subscribe* (real-time `onSnapshot`), get*, create*, update*, delete* functions.
- All writes set `updatedAt` automatically.

### Hooks (`src/hooks/`)

Each hook (`useOrders`, `useProducts`, `useCustomers`, `useShippers`) subscribes to real-time Firestore data scoped to the current `shopId` from `useShop()`. They return `{ data, loading }`.

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`). CSS custom properties defined in `src/styles/globals.css` provide the design tokens:

- Semantic utility classes: `bg-app`, `bg-surface`, `text-text`, `text-muted`, `text-primary`, `text-danger`, etc.
- Component classes: `input-field`, `btn-primary`, `btn-secondary`, `shadow-card`, `main-content`, `scroll-tabs`.
- Dark mode via `.dark` class on `<html>`.

HeroUI v3 (`@heroui/react`) is available but most UI is built with custom Tailwind classes for the mobile-first design.

### Path Aliases

`@/` maps to `src/` (configured via `vite-tsconfig-paths`).

### Key Types (`src/types/`)

- `DeliveryStatus`: `'pending' | 'assigned' | 'shipping' | 'completed'` — Vietnamese labels in `DELIVERY_STATUS_LABELS`.
- `OrderSource`: `'manual' | 'facebook' | 'messenger'`.
- `Shop` / `ShopMember` — multi-tenancy entities.