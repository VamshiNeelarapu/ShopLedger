# ShopLedger Agent Guide

## Stack
- Node.js CommonJS application using Express 4 and body-parser.
- Browser UI is static content in `public/`; JSON data is stored in `data/db.json` by `lib/store.js`.

## Module map
- `routes/customers.js` — lists customers and settlements; records Khata settlements.
- `routes/orders.js` — lists, reads, creates, and cancels orders.
- `routes/products.js` — lists/searches products and active coupons.
- `routes/reports.js` — dashboard and GST reconciliation, pricing preview, admin export.
- `lib/coupons.js` — normalizes, validates, lists, and calculates coupon discounts.
- `lib/dates.js` — formats today’s date and normalizes dates for filtering.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, reservations, and summary.
- `lib/invoice.js` — computes invoice figures and renders printable HTML invoices.
- `lib/ledger.js` — customer balances, Khata debits/reversals, and settlements.
- `lib/orders.js` — adds, finds, cancels, and filters orders.
- `lib/pricing.js` — computes checkout subtotal, coupon discount, GST, and totals.
- `lib/reports.js` — dashboard summary and comparison of stored order totals with invoice figures.
- `lib/store.js` — reads/writes `data/db.json` and appends audit entries.
- `lib/tax.js` — resolves GST rates and splits tax into CGST and SGST.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` (Node’s built-in test runner; no test files are currently present).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
