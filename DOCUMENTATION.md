# Kitchen Styling: Tailwind Menu with Container Queries and an MUI Order Grid, One Set of Tokens

**Day 25 Mini Capstone, Styling**  
**Project folder:** `kitchen-styling`

---

## 1. Goal

The Kitchen App gets a real look. The task (Day 25 Deep Dive, Mini Capstone) asked for:

1. A customer-facing **menu screen in Tailwind** with a **responsive grid**.
2. A **container-query-based `MenuCard`** that adapts to both a **wide main grid** and a **narrow "recently ordered" sidebar**.
3. A small internal **order-management view with MUI's DataGrid** and a **shared theme**.
4. Both parts **referencing the same underlying color and spacing tokens**.

Think of a name badge printed in one place. Tailwind and MUI are two different printers, but they read the same badge template (`src/tokens.js`). Change the template and both printers change. A *media query* is a shop that changes its layout when the **street** gets wider. A *container query* is a shelf that rearranges itself when **its own slot** gets wider, wherever you put it. That is why one `MenuCard` can sit in a roomy grid and a narrow sidebar without being told where it is.

The rules this project is built around:

- **One source for design values.** Colors, spacing and corner sizes live in `src/tokens.js`. Nothing else may contain a hex color (a test scans for it).
- **A component must not know where it lives.** `MenuCard` has no `variant` or `compact` prop. Its container's width decides its layout.
- **Use each library for what it is good at.** Tailwind for the customer screen (custom look, small pieces). MUI's DataGrid for the staff table (sorting, paging and keyboard handling are hard to rebuild).

---

## 2. Tools

| Tool | Role |
|---|---|
| React 19 (JavaScript, JSX) | Components and state |
| Vite | Dev server and build |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Utility classes, `@theme` tokens and built-in container queries (`@container`, `@sm:`) |
| MUI (`@mui/material`) and `@mui/x-data-grid` | Theme, chips and the DataGrid |
| Vitest + jsdom + React Testing Library | Logic, components, token checks |
| Playwright (Chromium), optional | A real-browser layout check (`scripts/check-layout.mjs`) |

---

## 3. Project structure

```
kitchen-styling/
├── package.json
├── vite.config.js
├── index.html
├── .gitignore
├── README.md
├── DOCUMENTATION.md
├── scripts/
│   ├── build-tokens.mjs      (writes src/tokens.css from the tokens)
│   └── check-layout.mjs      (real-browser layout check, optional)
└── src/
    ├── tokens.js             (THE source of colors, spacing, radius)
    ├── tokensCss.js          (tokens -> Tailwind @theme text)
    ├── tokens.css            (GENERATED, do not edit)
    ├── index.css             (Tailwind + tokens)
    ├── theme.js              (MUI theme, built from the tokens)
    ├── menuData.js
    ├── orderLogic.js         (total, add to cart, describe, recent dishes)
    ├── MenuCard.jsx          (the container-query card)
    ├── MenuGrid.jsx          (wide main grid)
    ├── RecentSidebar.jsx     (narrow sidebar, same MenuCard)
    ├── OrderGrid.jsx         (MUI DataGrid)
    ├── App.jsx
    ├── main.jsx
    ├── orderLogic.test.js, tokens.test.js
    ├── MenuCard.test.jsx, OrderGrid.test.jsx, App.test.jsx
    └── test/
        └── setup.js
```

---

## 4. Setup commands

```bash
npm create vite@latest kitchen-styling -- --template react
cd kitchen-styling
npm install @mui/material @mui/x-data-grid @emotion/react @emotion/styled
npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**`package.json` scripts**

```json
"tokens": "node scripts/build-tokens.mjs",
"predev": "npm run tokens",
"prebuild": "npm run tokens",
"pretest": "npm run tokens",
"dev": "vite",
"build": "vite build",
"test": "vitest run"
```

---

## 5. The idea: one set of tokens, two libraries, one card that adapts to its slot

```
 src/tokens.js  (the only place with real values)
     │
     ├──▶ scripts/build-tokens.mjs ──▶ src/tokens.css  (@theme { --color-brand-700: ... })
     │                                       └──▶ Tailwind classes:  bg-brand-700  rounded-card  p-4
     │
     └──▶ src/theme.js (createTheme)  ──▶ MUI:  palette.primary.main, spacing(2), shape.borderRadius
                                               └──▶ DataGrid, Chip, Box sx={{ p: 2 }}
```

**How Tailwind gets the tokens.** Tailwind v4 reads design values from a CSS `@theme` block. `toThemeCss()` turns `tokens.js` into that block, so `--color-brand-700` creates the classes `bg-brand-700`, `text-brand-700` and so on. The file is generated before dev, build and test, and a test fails if the file on disk is out of date.

**How MUI gets the tokens.** `theme.js` imports `tokens.js` directly and passes the values to `createTheme`. MUI's spacing is set to the same 4px unit, so `sx={{ p: 2 }}` is 8px, exactly like Tailwind's `p-2`.

**How the container query works.**

```
<article class="@container ...">          <- this card is now a "container" its children can measure
  <div class="flex flex-col ... @sm:flex-row">   <- @sm: = "when THE CARD is at least 24rem wide"
```

| Where the card sits | Card width | Result |
|---|---|---|
| Main grid on a wide screen | about 412px | Row: picture, text and description, Add button |
| "Recently ordered" sidebar | 256px | Column: small picture, name, price, full-width Add |
| Main grid on a 390px phone | 358px | Column (the card is narrow, even though the grid is "the main grid") |

The last row shows the point: a screen-width breakpoint (`sm:`) could never do that. The card follows its **slot**, not the screen.

**Why the order table uses MUI.** Sorting, paging, column sizing and keyboard use are a lot of work to build by hand. The customer screen needs a custom look, where utility classes are the faster tool. Each library does its own job and they share the tokens.

**Why the primary color is `brand-700`, not `brand-600`.** White text on `#ea580c` is about 3.6 to 1, which is too low for small text. `#c2410c` gives about 5.2 to 1.

---

## 6. The code

### `src/tokens.js` (the single source)

```js
// The ONE place where colors, spacing and corner sizes are decided.
// Tailwind gets them through src/tokens.css (generated from this file).
// MUI gets them through src/theme.js (reads this file directly).
// Change a value here and both libraries change together.

export const tokens = {
  color: {
    brand: { 50: "#fff7ed", 100: "#ffedd5", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412" },
    ink: { 900: "#1c1917", 700: "#44403c", 500: "#78716c", 200: "#e7e5e4", 100: "#f5f5f4" },
    page: "#faf7f2",
    surface: "#ffffff",
    success: { 100: "#dcfce7", 700: "#15803d" },
    warning: { 100: "#fef3c7", 700: "#b45309" },
    danger: { 100: "#fee2e2", 700: "#b91c1c" },
  },
  spacingUnit: 4, // pixels. Tailwind `p-2` and MUI `sx={{ p: 2 }}` both become 8px
  radius: { card: 12, control: 8 }, // pixels
};
```

### `src/tokensCss.js` (tokens to Tailwind)

```js
import { tokens } from "./tokens.js";

const rem = (px) => `${px / 16}rem`;

/** Turns tokens into a Tailwind `@theme` block, so classes like `bg-brand-600` and `rounded-card` exist. */
export function toThemeCss(t = tokens) {
  const lines = [];
  for (const [name, value] of Object.entries(t.color)) {
    if (typeof value === "string") lines.push(`  --color-${name}: ${value};`);
    else for (const [shade, hex] of Object.entries(value)) lines.push(`  --color-${name}-${shade}: ${hex};`);
  }
  lines.push(`  --spacing: ${rem(t.spacingUnit)};`);
  for (const [name, px] of Object.entries(t.radius)) lines.push(`  --radius-${name}: ${rem(px)};`);
  return `/* GENERATED from src/tokens.js by scripts/build-tokens.mjs. Do not edit by hand. */\n@theme {\n${lines.join("\n")}\n}\n`;
}
```

### `scripts/build-tokens.mjs`

```js
// Writes src/tokens.css from src/tokens.js. Runs before dev, build and test.
import { writeFileSync } from "node:fs";
import { toThemeCss } from "../src/tokensCss.js";

writeFileSync(new URL("../src/tokens.css", import.meta.url), toThemeCss());
console.log("wrote src/tokens.css");
```

### `src/tokens.css` (generated)

```css
/* GENERATED from src/tokens.js by scripts/build-tokens.mjs. Do not edit by hand. */
@theme {
  --color-brand-50: #fff7ed;
  --color-brand-100: #ffedd5;
  --color-brand-500: #f97316;
  --color-brand-600: #ea580c;
  --color-brand-700: #c2410c;
  --color-brand-800: #9a3412;
  --color-ink-100: #f5f5f4;
  --color-ink-200: #e7e5e4;
  --color-ink-500: #78716c;
  --color-ink-700: #44403c;
  --color-ink-900: #1c1917;
  --color-page: #faf7f2;
  --color-surface: #ffffff;
  --color-success-100: #dcfce7;
  --color-success-700: #15803d;
  --color-warning-100: #fef3c7;
  --color-warning-700: #b45309;
  --color-danger-100: #fee2e2;
  --color-danger-700: #b91c1c;
  --spacing: 0.25rem;
  --radius-card: 0.75rem;
  --radius-control: 0.5rem;
}
```

### `src/index.css`

```css
@import "tailwindcss";
@import "./tokens.css";

body {
  background: var(--color-page);
  color: var(--color-ink-900);
  font-family: system-ui, sans-serif;
}
```

### `src/theme.js` (MUI theme from the tokens)

```js
import { createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

const { color } = tokens;

// The MUI theme is built from the same tokens as the Tailwind classes.
export const theme = createTheme({
  spacing: tokens.spacingUnit,
  shape: { borderRadius: tokens.radius.control },
  palette: {
    primary: { main: color.brand[700], dark: color.brand[800], light: color.brand[100], contrastText: color.surface },
    success: { main: color.success[700], light: color.success[100] },
    warning: { main: color.warning[700], light: color.warning[100] },
    error: { main: color.danger[700], light: color.danger[100] },
    background: { default: color.page, paper: color.surface },
    text: { primary: color.ink[900], secondary: color.ink[500] },
    divider: color.ink[200],
  },
  typography: { fontFamily: "system-ui, sans-serif" },
});
```

### `src/menuData.js`

```js
export const MENU = [
  { id: 1, name: "Idli", price: 40, blurb: "Two steamed rice cakes with sambar and chutney.", emoji: "🍚" },
  { id: 2, name: "Masala Dosa", price: 90, blurb: "Crisp dosa filled with spiced potato.", emoji: "🥞" },
  { id: 3, name: "Pongal", price: 60, blurb: "Rice and lentils with pepper and ghee.", emoji: "🥣" },
  { id: 4, name: "Filter Coffee", price: 30, blurb: "Strong coffee with hot milk.", emoji: "☕" },
  { id: 5, name: "Medu Vada", price: 45, blurb: "Crunchy lentil doughnuts, served hot.", emoji: "🍩" },
  { id: 6, name: "Rava Upma", price: 50, blurb: "Roasted semolina with vegetables.", emoji: "🍛" },
];

// A few finished orders so the order view has something to show on first load.
export const INITIAL_ORDERS = [
  { id: 1001, table: 4, lines: [{ dishId: 1, qty: 2 }, { dishId: 4, qty: 2 }], total: 140, status: "ready" },
  { id: 1002, table: 7, lines: [{ dishId: 2, qty: 1 }], total: 90, status: "preparing" },
  { id: 1003, table: 2, lines: [{ dishId: 3, qty: 1 }, { dishId: 5, qty: 2 }], total: 150, status: "preparing" },
];
```

### `src/orderLogic.js`

```js
/** Total for a list of { dishId, qty } using the menu's prices. */
export function orderTotal(lines, menu) {
  return lines.reduce((sum, { dishId, qty }) => {
    const dish = menu.find((d) => d.id === dishId);
    return dish ? sum + dish.price * qty : sum;
  }, 0);
}

/** Adds one of a dish to a list of cart lines, without changing the old list. */
export function addToCart(lines, dishId) {
  const found = lines.find((l) => l.dishId === dishId);
  if (!found) return [...lines, { dishId, qty: 1 }];
  return lines.map((l) => (l.dishId === dishId ? { ...l, qty: l.qty + 1 } : l));
}

/** How the items of an order read in one cell: "2 × Idli, 1 × Pongal". */
export function describeLines(lines, menu) {
  return lines
    .map(({ dishId, qty }) => `${qty} × ${menu.find((d) => d.id === dishId)?.name ?? "Unknown dish"}`)
    .join(", ");
}

/**
 * Dishes from the newest orders, each once, newest first, up to `limit`.
 * (Derived from the orders every time. Nothing is stored separately.)
 */
export function recentDishes(orders, menu, limit = 3) {
  const seen = new Set();
  const result = [];
  for (const order of [...orders].sort((a, b) => b.id - a.id)) {
    for (const { dishId } of order.lines) {
      if (seen.has(dishId)) continue;
      const dish = menu.find((d) => d.id === dishId);
      if (!dish) continue;
      seen.add(dishId);
      result.push(dish);
      if (result.length === limit) return result;
    }
  }
  return result;
}
```

### `src/MenuCard.jsx` (container query, the heart of the capstone)

```jsx
/**
 * One dish. It does NOT know where it is placed.
 *
 * `@container` makes this card the thing its own children measure against.
 * The `@sm:` classes below look at the CARD'S width (24rem and up), not the screen's.
 *   - in the wide main grid the card has room, so the picture sits beside the text
 *   - in the narrow sidebar the card is tight, so everything stacks
 * The same component works in both places with no `variant` prop.
 */
export default function MenuCard({ dish, onAdd }) {
  return (
    <article className="@container rounded-card border border-ink-200 bg-surface shadow-sm">
      <div className="flex flex-col gap-3 p-4 @sm:flex-row @sm:items-center">
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-control bg-brand-100 text-2xl @sm:size-20 @sm:text-4xl"
        >
          {dish.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink-900">{dish.name}</h3>
          <p className="hidden text-sm text-ink-500 @sm:block">{dish.blurb}</p>
          <p className="font-medium text-brand-700">₹{dish.price}</p>
        </div>

        <button
          type="button"
          aria-label={`Add ${dish.name} to cart`}
          onClick={() => onAdd(dish)}
          className="min-h-11 rounded-control bg-brand-700 px-4 font-medium text-surface hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          Add
        </button>
      </div>
    </article>
  );
}
```

### `src/MenuGrid.jsx`

```jsx
import MenuCard from "./MenuCard";

export default function MenuGrid({ dishes, onAdd }) {
  if (dishes.length === 0) return <p className="text-ink-500">The menu is empty.</p>;
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {dishes.map((dish) => (
        <li key={dish.id}>
          <MenuCard dish={dish} onAdd={onAdd} />
        </li>
      ))}
    </ul>
  );
}
```

### `src/RecentSidebar.jsx`

```jsx
import MenuCard from "./MenuCard";

// The same MenuCard, in a narrow column. The card adapts by itself.
export default function RecentSidebar({ dishes, onAdd }) {
  return (
    <aside aria-labelledby="recent-title" className="w-full lg:w-64 lg:shrink-0">
      <h2 id="recent-title" className="mb-3 text-lg font-semibold">
        Recently ordered
      </h2>
      {dishes.length === 0 ? (
        <p className="text-sm text-ink-500">Nothing ordered yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {dishes.map((dish) => (
            <li key={dish.id}>
              <MenuCard dish={dish} onAdd={onAdd} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
```

### `src/OrderGrid.jsx` (MUI DataGrid)

```jsx
import { Box, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { describeLines } from "./orderLogic";

const STATUS_COLOR = { preparing: "warning", ready: "success" };

function StatusChip({ value }) {
  return <Chip size="small" label={value} color={STATUS_COLOR[value] ?? "default"} variant="outlined" sx={{ textTransform: "capitalize" }} />;
}

/**
 * The internal order-management table. MUI's DataGrid gives sorting, filtering and
 * pagination for free. Its colors and spacing come from the shared theme (src/theme.js).
 * `virtualize={false}` is for tests only: jsdom has no layout, so a virtual grid would show no rows.
 */
export default function OrderGrid({ orders, menu, virtualize = true }) {
  const rows = orders.map((o) => ({ id: o.id, table: o.table, items: describeLines(o.lines, menu), total: o.total, status: o.status }));

  const columns = [
    { field: "id", headerName: "Order #", width: 100 },
    { field: "table", headerName: "Table", type: "number", width: 90 },
    { field: "items", headerName: "Items", flex: 1, minWidth: 200 },
    { field: "total", headerName: "Total", type: "number", width: 110, valueFormatter: (value) => `₹${value}` },
    { field: "status", headerName: "Status", width: 130, renderCell: ({ value }) => <StatusChip value={value} /> },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 3 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableVirtualization={!virtualize}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } }, sorting: { sortModel: [{ field: "id", sort: "desc" }] } }}
        localeText={{ noRowsLabel: "No orders yet" }}
        aria-label="Orders"
      />
    </Box>
  );
}
```

### `src/App.jsx`

```jsx
import { ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import MenuGrid from "./MenuGrid";
import OrderGrid from "./OrderGrid";
import RecentSidebar from "./RecentSidebar";
import { INITIAL_ORDERS, MENU } from "./menuData";
import { addToCart, orderTotal, recentDishes } from "./orderLogic";
import { theme } from "./theme";

const tabClass = (active) =>
  `min-h-11 rounded-control px-4 font-medium ${active ? "bg-brand-700 text-surface" : "bg-surface text-ink-700 border border-ink-200 hover:bg-ink-100"}`;

export default function App({ menu = MENU, initialOrders = INITIAL_ORDERS, virtualizeGrid = true }) {
  const [view, setView] = useState("menu"); // "menu" | "orders"
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(initialOrders);

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const recents = recentDishes(orders, menu); // worked out, not stored

  function placeOrder() {
    if (cart.length === 0) return;
    const id = Math.max(1000, ...orders.map((o) => o.id)) + 1;
    setOrders([...orders, { id, table: 5, lines: cart, total: orderTotal(cart, menu), status: "preparing" }]);
    setCart([]);
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-brand-700">Kitchen</h1>
          <nav aria-label="Main" className="flex gap-2">
            <button type="button" className={tabClass(view === "menu")} aria-pressed={view === "menu"} onClick={() => setView("menu")}>
              Menu
            </button>
            <button type="button" className={tabClass(view === "orders")} aria-pressed={view === "orders"} onClick={() => setView("orders")}>
              Orders
            </button>
          </nav>
        </header>

        {view === "menu" ? (
          <main>
            <div className="mb-4 flex items-center justify-between rounded-card border border-ink-200 bg-surface p-3">
              <p role="status">Cart: {cartCount} {cartCount === 1 ? "item" : "items"}</p>
              <button
                type="button"
                onClick={placeOrder}
                disabled={cart.length === 0}
                className="min-h-11 rounded-control bg-brand-700 px-4 font-medium text-surface hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
              >
                Place order
              </button>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row">
              <section aria-labelledby="menu-title" className="min-w-0 flex-1">
                <h2 id="menu-title" className="mb-3 text-lg font-semibold">
                  Menu
                </h2>
                <MenuGrid dishes={menu} onAdd={(dish) => setCart((c) => addToCart(c, dish.id))} />
              </section>
              <RecentSidebar dishes={recents} onAdd={(dish) => setCart((c) => addToCart(c, dish.id))} />
            </div>
          </main>
        ) : (
          <main>
            <h2 className="mb-3 text-lg font-semibold">Order management</h2>
            <OrderGrid orders={orders} menu={menu} virtualize={virtualizeGrid} />
          </main>
        )}
      </div>
    </ThemeProvider>
  );
}
```

### `src/main.jsx`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `vite.config.js`

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
  },
});
```

### `scripts/check-layout.mjs` (real-browser check)

```js
// A REAL-BROWSER check of the layout. jsdom has no layout, so it cannot test container queries.
// Needs Playwright with Chromium installed:  npm i -D playwright && npx playwright install chromium
// Run:  npm run build && node scripts/check-layout.mjs
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4173;
const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

const browser = await chromium.launch();
try {
  // ---- wide screen ----
  let page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector("article");
  const info = await page.evaluate(() => {
    const dir = (card) => getComputedStyle(card.firstElementChild).flexDirection;
    const shown = (card) => getComputedStyle(card.querySelector("p.hidden")).display !== "none";
    const main = document.querySelector("section[aria-labelledby=menu-title] article");
    const side = document.querySelector("aside article");
    const add = main.querySelector("button");
    return {
      mainWidth: main.getBoundingClientRect().width, sideWidth: side.getBoundingClientRect().width,
      mainDir: dir(main), sideDir: dir(side), mainBlurb: shown(main), sideBlurb: shown(side),
      addBg: getComputedStyle(add).backgroundColor, addH: add.getBoundingClientRect().height,
      radius: getComputedStyle(main).borderTopLeftRadius,
    };
  });
  check("wide screen: main card is wide (>= 24rem = 384px)", info.mainWidth >= 384, `${Math.round(info.mainWidth)}px`);
  check("wide screen: sidebar card is narrow (< 384px)", info.sideWidth < 384, `${Math.round(info.sideWidth)}px`);
  check("wide screen: main card lays out in a ROW", info.mainDir === "row", info.mainDir);
  check("wide screen: sidebar card lays out in a COLUMN (same component)", info.sideDir === "column", info.sideDir);
  check("wide screen: main card shows the description", info.mainBlurb === true);
  check("wide screen: sidebar card hides the description", info.sideBlurb === false);
  check("Add button uses the brand token (#c2410c)", info.addBg === "rgb(194, 65, 12)", info.addBg);
  check("Add button is at least 44px tall", info.addH >= 44, `${info.addH}px`);
  check("card corners use the radius token (12px)", info.radius === "12px", info.radius);
  await page.screenshot({ path: "layout-wide.png" });

  // ---- order table ----
  await page.getByRole("button", { name: "Orders" }).click();
  await page.waitForSelector('[role="grid"] [role="row"][data-id]');
  const grid = await page.evaluate(() => {
    const chip = [...document.querySelectorAll(".MuiChip-root")].find((c) => c.textContent === "ready");
    const paper = document.querySelector("main > div");
    return { rows: document.querySelectorAll('[role="row"][data-id]').length, chipColor: getComputedStyle(chip).color, padding: getComputedStyle(paper).paddingTop, tab: getComputedStyle(document.querySelector("nav button[aria-pressed=true]")).backgroundColor };
  });
  check("order table shows the 3 starting orders", grid.rows === 3, String(grid.rows));
  check("MUI 'ready' chip uses the success token (#15803d)", grid.chipColor === "rgb(21, 128, 61)", grid.chipColor);
  check("MUI padding 2 = 8px = Tailwind p-2", grid.padding === "8px", grid.padding);
  check("active tab (Tailwind) and MUI use one brand color", grid.tab === "rgb(194, 65, 12)", grid.tab);
  await page.screenshot({ path: "layout-orders.png" });
  await page.close();

  // ---- phone ----
  page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector("article");
  const phone = await page.evaluate(() => {
    const main = document.querySelector("section[aria-labelledby=menu-title] article");
    return { w: main.getBoundingClientRect().width, dir: getComputedStyle(main.firstElementChild).flexDirection, scrollW: document.documentElement.scrollWidth };
  });
  check("phone: main card is narrower than 384px (one column on a 390px screen)", phone.w < 384, `${Math.round(phone.w)}px`);
  check("phone: the SAME card switches to a column (container, not screen, decides)", phone.dir === "column", phone.dir);
  check("phone: no sideways scrolling", phone.scrollW <= 390, `${phone.scrollW}px`);
  await page.screenshot({ path: "layout-phone.png" });
} finally {
  await browser.close();
  server.kill();
}

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed === 0 ? `\nAll ${results.length} layout checks passed.` : `\n${failed} of ${results.length} FAILED.`);
process.exit(failed === 0 ? 0 : 1);
```

### Design decisions

| Decision | Reason |
|---|---|
| All design values live in `tokens.js` | Two libraries with two copies of a color will drift. One source cannot. |
| `tokens.css` is generated, committed, and tested for being up to date | Tailwind needs a CSS file at build time. A test fails if someone edits a token and forgets to regenerate. |
| MUI spacing is set to 4px | MUI defaults to 8px per step. Tailwind's step is 4px. Matching them makes `p-2` and `sx={{ p: 2 }}` the same size. |
| `MenuCard` has no `variant` prop | If the parent had to say "compact", the card would need to know where it lives. The container query removes that. |
| `@container` on the card, `@sm:` on its children | `@sm:` measures the nearest container, not the screen. |
| The description is hidden in a narrow card | A narrow slot has no room for it. Hidden with `hidden @sm:block`, so it shows again when there is room. |
| The emoji picture is `aria-hidden` | It repeats the name. A screen reader should not read an emoji. |
| Buttons are named `Add Idli to cart` | Every button says Add. Screen readers read buttons out of context. |
| Buttons are at least 44px tall (`min-h-11`) | A thumb-sized target for phones. |
| Primary color is `brand-700` | Enough contrast for white button text. `brand-600` was too light. |
| The grid is one column on small screens and two from `md` | A responsive grid at the page level. The card adapts separately at the component level. |
| The sidebar is full width on small screens and 16rem from `lg` | On a phone it stacks under the menu instead of squeezing the menu. |
| "Recently ordered" is worked out from the orders | `recentDishes(orders, menu)` runs on each render. There is no second list to keep in step. |
| `recentDishes` sorts a copy | Sorting the original would change the order list the table shows. |
| The status chip color comes from the MUI theme (`warning`, `success`) | Same tokens as everything else, so no hex color is typed in the component. |
| The table starts newest-first | The order you just placed is the one staff want at the top. |
| The DataGrid has `virtualize={false}` in tests only | jsdom has no layout, so a virtual grid shows no rows. The real app keeps virtualisation on. |
| A test scans `src` for hex colors | This turns "nobody types a color" from a promise into a rule. |
| A separate real-browser check | jsdom cannot measure a container. Only a real browser can prove the card changes layout. |
| Tailwind and MUI are both used on purpose | The task asked for both. Using two styling systems has a cost: two sets of rules. The shared tokens keep that cost small. |

---

## 7. Tests (44 tests)

Logic is tested with plain function calls (frozen inputs, so a hidden change throws). The token tests read the real files and the real MUI theme. Components are tested like a person uses them. **jsdom cannot measure layout**, so it cannot test a container query. The unit tests only check that the markup is wired for it (`@container` on the card, `@sm:flex-row` and no screen breakpoint). The real behavior is checked separately in Chromium with `scripts/check-layout.mjs`, which measures real widths and real computed styles (16 checks, below). Any `console.error` fails a test.

| # | Test | What it proves |
|---|---|---|
| 1 to 12 | `orderLogic`: totals, add to cart, no mutation, item text, recent dishes (newest first, each once, limit, empty, unknown dish, no reorder) | Rules |
| 13 to 22 | `tokens`: `tokens.css` is up to date; every color becomes a variable; spacing and radius in rem; changing a token changes the CSS; the MUI primary, status, background, text and divider colors are the tokens; MUI spacing equals Tailwind's; radius matches; no stray hex colors in `src` | One set of tokens |
| 23 to 27 | `MenuCard`: content; Add calls back with the dish; emoji hidden from screen readers; container wiring with no screen breakpoint; 44px target | Card |
| 28 to 34 | `OrderGrid`: one row per order with readable text and money; column headers; status chips; newest first; sorts on header click; empty message; chip colors come from the theme | MUI grid |
| 35 to 44 | `App`: all dishes; Recently ordered content and empty text; Add in the menu and in the sidebar; Place order disabled when empty; placing an order empties the cart and updates the sidebar; switching views; active view marked; a placed order appears in the table with the right total | Everything together |

### `src/test/setup.js`

```js
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, vi } from "vitest";

// React reports mistakes (a missing key, a bad update) with console.error.
// Any console.error fails the test, so mistakes cannot hide in the output.
let errorSpy;
beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  const calls = errorSpy.mock.calls.map((c) => c.join(" "));
  errorSpy.mockRestore();
  expect(calls, "console.error was called during the test").toEqual([]);
});
```

### `src/orderLogic.test.js`

```js
import { describe, expect, it } from "vitest";
import { MENU } from "./menuData";
import { addToCart, describeLines, orderTotal, recentDishes } from "./orderLogic";

const o = (id, ...dishIds) => ({ id, table: 1, lines: dishIds.map((dishId) => ({ dishId, qty: 1 })), total: 0, status: "ready" });

describe("orderTotal", () => {
  it("adds price x quantity", () => {
    expect(orderTotal([{ dishId: 1, qty: 2 }, { dishId: 4, qty: 1 }], MENU)).toBe(110);
  });
  it("is 0 for no lines and skips unknown dishes", () => {
    expect(orderTotal([], MENU)).toBe(0);
    expect(orderTotal([{ dishId: 999, qty: 5 }], MENU)).toBe(0);
  });
});

describe("addToCart", () => {
  it("adds a new line with quantity 1", () => {
    expect(addToCart([], 3)).toEqual([{ dishId: 3, qty: 1 }]);
  });
  it("raises the quantity of an existing line", () => {
    expect(addToCart([{ dishId: 3, qty: 1 }], 3)).toEqual([{ dishId: 3, qty: 2 }]);
  });
  it("never changes the list it was given", () => {
    const lines = Object.freeze([Object.freeze({ dishId: 3, qty: 1 })]);
    expect(() => addToCart(lines, 3)).not.toThrow();
    expect(() => addToCart(lines, 4)).not.toThrow();
  });
});

describe("describeLines", () => {
  it("reads naturally", () => {
    expect(describeLines([{ dishId: 1, qty: 2 }, { dishId: 3, qty: 1 }], MENU)).toBe("2 × Idli, 1 × Pongal");
  });
  it("does not crash on an unknown dish", () => {
    expect(describeLines([{ dishId: 999, qty: 1 }], MENU)).toBe("1 × Unknown dish");
  });
});

describe("recentDishes", () => {
  it("takes dishes from the newest order first", () => {
    const result = recentDishes([o(1, 1), o(3, 2), o(2, 3)], MENU, 3);
    expect(result.map((d) => d.id)).toEqual([2, 3, 1]);
  });
  it("lists each dish once", () => {
    expect(recentDishes([o(1, 1), o(2, 1, 2)], MENU, 5).map((d) => d.id)).toEqual([1, 2]);
  });
  it("respects the limit", () => {
    expect(recentDishes([o(1, 1, 2, 3, 4)], MENU, 2)).toHaveLength(2);
  });
  it("is empty with no orders, and skips unknown dishes", () => {
    expect(recentDishes([], MENU)).toEqual([]);
    expect(recentDishes([o(1, 999)], MENU)).toEqual([]);
  });
  it("does not reorder the orders it was given", () => {
    const orders = Object.freeze([o(1, 1), o(2, 2)]);
    expect(() => recentDishes(orders, MENU)).not.toThrow();
  });
});
```

### `src/tokens.test.js`

```js
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { theme } from "./theme";
import { tokens } from "./tokens";
import { toThemeCss } from "./tokensCss";

const read = (p) => readFileSync(join(import.meta.dirname, p), "utf8");

describe("tokens -> Tailwind", () => {
  it("tokens.css on disk matches what the tokens produce (it was regenerated)", () => {
    expect(read("./tokens.css")).toBe(toThemeCss(tokens));
  });
  it("every color token becomes a Tailwind --color-* variable with the same value", () => {
    const css = toThemeCss(tokens);
    expect(css).toContain(`--color-brand-700: ${tokens.color.brand[700]};`);
    expect(css).toContain(`--color-page: ${tokens.color.page};`);
    expect(css).toContain(`--color-danger-700: ${tokens.color.danger[700]};`);
  });
  it("spacing and radius become rem values", () => {
    const css = toThemeCss(tokens);
    expect(css).toContain("--spacing: 0.25rem;");
    expect(css).toContain("--radius-card: 0.75rem;");
    expect(css).toContain("--radius-control: 0.5rem;");
  });
  it("changing a token changes the CSS (it is not hard-coded)", () => {
    const changed = { ...tokens, color: { ...tokens.color, brand: { ...tokens.color.brand, 700: "#123456" } }, spacingUnit: 8 };
    const css = toThemeCss(changed);
    expect(css).toContain("--color-brand-700: #123456;");
    expect(css).toContain("--spacing: 0.5rem;");
  });
});

describe("tokens -> MUI theme", () => {
  it("the primary color is the brand token", () => {
    expect(theme.palette.primary.main).toBe(tokens.color.brand[700]);
    expect(theme.palette.primary.dark).toBe(tokens.color.brand[800]);
  });
  it("status colors are the same tokens the chips and Tailwind use", () => {
    expect(theme.palette.success.main).toBe(tokens.color.success[700]);
    expect(theme.palette.warning.main).toBe(tokens.color.warning[700]);
    expect(theme.palette.error.main).toBe(tokens.color.danger[700]);
  });
  it("page and card backgrounds and text are the same tokens", () => {
    expect(theme.palette.background.default).toBe(tokens.color.page);
    expect(theme.palette.background.paper).toBe(tokens.color.surface);
    expect(theme.palette.text.primary).toBe(tokens.color.ink[900]);
    expect(theme.palette.divider).toBe(tokens.color.ink[200]);
  });
  it("one spacing step is the same size in MUI as in Tailwind", () => {
    expect(theme.spacing(1)).toBe(`${tokens.spacingUnit}px`);
    expect(theme.spacing(2)).toBe(`${tokens.spacingUnit * 2}px`); // Tailwind p-2 = 2 x 0.25rem = 8px
  });
  it("corner size matches", () => {
    expect(theme.shape.borderRadius).toBe(tokens.radius.control);
  });
});

describe("no stray colors", () => {
  it("no hex color appears anywhere in src except the token files", () => {
    const allowed = new Set(["tokens.js", "tokens.css"]);
    const files = readdirSync(import.meta.dirname).filter((f) => /\.(jsx?|css)$/.test(f) && !allowed.has(f) && !f.endsWith(".test.js") && !f.endsWith(".test.jsx"));
    expect(files.length).toBeGreaterThan(5);
    const offenders = files.filter((f) => /#[0-9a-fA-F]{3,8}\b/.test(read(`./${f}`)));
    expect(offenders).toEqual([]);
  });
});
```

### `src/MenuCard.test.jsx`

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MenuCard from "./MenuCard";

const dish = { id: 1, name: "Idli", price: 40, blurb: "Two steamed rice cakes.", emoji: "🍚" };

describe("MenuCard", () => {
  it("shows name, price and description", () => {
    render(<MenuCard dish={dish} onAdd={() => {}} />);
    expect(screen.getByRole("heading", { name: "Idli" })).toBeInTheDocument();
    expect(screen.getByText("₹40")).toBeInTheDocument();
    expect(screen.getByText("Two steamed rice cakes.")).toBeInTheDocument();
  });
  it("calls onAdd with the dish", async () => {
    const onAdd = vi.fn();
    render(<MenuCard dish={dish} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "Add Idli to cart" }));
    expect(onAdd).toHaveBeenCalledWith(dish);
  });
  it("hides the decorative emoji from screen readers", () => {
    render(<MenuCard dish={dish} onAdd={() => {}} />);
    expect(screen.getByText("🍚")).toHaveAttribute("aria-hidden", "true");
  });
  // jsdom has no layout, so it cannot MEASURE a container. These check the markup that makes
  // the container query work. The real layout is checked in a browser (see the layout check).
  it("is a query container, and its layout changes are tied to the container, not the screen", () => {
    const { container } = render(<MenuCard dish={dish} onAdd={() => {}} />);
    const card = container.querySelector("article");
    expect(card.className).toMatch(/(^|\s)@container(\s|$)/);
    const row = card.firstElementChild;
    expect(row.className).toMatch(/@sm:flex-row/);
    expect(row.className).not.toMatch(/(^|\s)(sm|md|lg):flex-row/); // no screen-width breakpoint
  });
  it("the touch target is at least 44px tall", () => {
    render(<MenuCard dish={dish} onAdd={() => {}} />);
    expect(screen.getByRole("button").className).toMatch(/min-h-11/);
  });
});
```

### `src/OrderGrid.test.jsx`

```jsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { INITIAL_ORDERS, MENU } from "./menuData";
import OrderGrid from "./OrderGrid";
import { theme } from "./theme";

const renderGrid = (orders = INITIAL_ORDERS) =>
  render(
    <ThemeProvider theme={theme}>
      <OrderGrid orders={orders} menu={MENU} virtualize={false} />
    </ThemeProvider>,
  );

describe("OrderGrid (MUI DataGrid)", () => {
  it("shows one row per order with readable items and money", async () => {
    renderGrid();
    const grid = await screen.findByRole("grid");
    const rows = within(grid).getAllByRole("row");
    expect(rows).toHaveLength(1 + INITIAL_ORDERS.length); // header + orders
    expect(within(grid).getByText("2 × Idli, 2 × Filter Coffee")).toBeInTheDocument();
    expect(within(grid).getByText("₹140")).toBeInTheDocument();
  });
  it("shows the column headers", async () => {
    renderGrid();
    for (const name of ["Order #", "Table", "Items", "Total", "Status"]) {
      expect(await screen.findByRole("columnheader", { name: new RegExp(name) })).toBeInTheDocument();
    }
  });
  it("shows the status as a chip", async () => {
    renderGrid();
    const grid = await screen.findByRole("grid");
    expect(within(grid).getByText("ready")).toBeInTheDocument();
    expect(within(grid).getAllByText("preparing")).toHaveLength(2);
  });
  it("starts with the newest order first", async () => {
    renderGrid();
    const grid = await screen.findByRole("grid");
    const firstDataRow = within(grid).getAllByRole("row")[1];
    expect(within(firstDataRow).getByText("1003")).toBeInTheDocument();
  });
  it("sorts when a header is clicked", async () => {
    renderGrid();
    const header = await screen.findByRole("columnheader", { name: /Order #/ });
    // starts descending (newest first). One click moves it to ascending.
    await userEvent.click(within(header).getByText("Order #"));
    const grid = screen.getByRole("grid");
    expect(within(within(grid).getAllByRole("row")[1]).getByText("1001")).toBeInTheDocument();
  });
  it("says so when there are no orders", async () => {
    renderGrid([]);
    expect(await screen.findByText("No orders yet")).toBeInTheDocument();
  });
  it("uses the theme: the status chips take their colors from it", async () => {
    renderGrid();
    const chip = (await screen.findByText("ready")).closest(".MuiChip-root");
    expect(chip.className).toMatch(/MuiChip-colorSuccess/);
    const preparing = screen.getAllByText("preparing")[0].closest(".MuiChip-root");
    expect(preparing.className).toMatch(/MuiChip-colorWarning/);
  });
});
```

### `src/App.test.jsx`

```jsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

const setup = (props) => ({ user: userEvent.setup(), ...render(<App virtualizeGrid={false} {...props} />) });
const mainMenu = () => within(screen.getByRole("region", { name: "Menu" }));

describe("menu screen", () => {
  it("shows every dish in the main menu", () => {
    setup();
    expect(mainMenu().getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });
  it("has a Recently ordered sidebar built from the newest orders", () => {
    setup();
    const side = within(screen.getByRole("complementary", { name: "Recently ordered" }));
    const names = side.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["Pongal", "Medu Vada", "Masala Dosa"]); // order 1003 first, then 1002
  });
  it("says so when nothing has been ordered", () => {
    setup({ initialOrders: [] });
    expect(screen.getByText("Nothing ordered yet.")).toBeInTheDocument();
  });
  it("Add in the main menu raises the cart count", async () => {
    const { user } = setup();
    expect(screen.getByRole("status")).toHaveTextContent("Cart: 0 items");
    await user.click(mainMenu().getByRole("button", { name: "Add Idli to cart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cart: 1 item");
  });
  it("Add in the sidebar works the same way", async () => {
    const { user } = setup();
    const side = within(screen.getByRole("complementary", { name: "Recently ordered" }));
    await user.click(side.getByRole("button", { name: "Add Pongal to cart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cart: 1 item");
  });
  it("Place order is disabled with an empty cart", () => {
    setup();
    expect(screen.getByRole("button", { name: "Place order" })).toBeDisabled();
  });
  it("placing an order empties the cart and puts the dish in Recently ordered", async () => {
    const { user } = setup();
    await user.click(mainMenu().getByRole("button", { name: "Add Rava Upma to cart" }));
    await user.click(screen.getByRole("button", { name: "Place order" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cart: 0 items");
    const side = within(screen.getByRole("complementary", { name: "Recently ordered" }));
    expect(side.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent("Rava Upma");
  });
});

describe("order management view", () => {
  it("switches to the orders table and back", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Orders" }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Menu" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("region", { name: "Menu" })).toBeInTheDocument();
  });
  it("marks which view is active", async () => {
    const { user } = setup();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Orders" }));
    expect(screen.getByRole("button", { name: "Orders" })).toHaveAttribute("aria-pressed", "true");
  });
  it("an order placed on the menu screen appears in the table with the right total", async () => {
    const { user } = setup();
    await user.click(mainMenu().getByRole("button", { name: "Add Idli to cart" }));
    await user.click(mainMenu().getByRole("button", { name: "Add Idli to cart" }));
    await user.click(mainMenu().getByRole("button", { name: "Add Filter Coffee to cart" }));
    await user.click(screen.getByRole("button", { name: "Place order" }));
    await user.click(screen.getByRole("button", { name: "Orders" }));
    const grid = await screen.findByRole("grid");
    expect(within(grid).getByText("2 × Idli, 1 × Filter Coffee")).toBeInTheDocument();
    expect(within(grid).getByText("₹110")).toBeInTheDocument();
  });
});
```

---

## 8. Results

| Check | Command | Result |
|---|---|---|
| Tests | `npm test` | **44 passed** (5 files), stable over 3 runs |
| Build | `npm run build` | Built successfully |
| Real-browser layout check | `node scripts/check-layout.mjs` (Chromium) | **16 of 16 passed**: at 1280px the main card is 412px wide and lays out as a row with the description; the sidebar card is 256px and lays out as a column with no description; at 390px the same main card is 358px and switches to a column; no sideways scroll; the Add button is 44px tall and `rgb(194, 65, 12)` (the brand token); the MUI "ready" chip is `rgb(21, 128, 61)` (the success token); MUI padding 2 is 8px; the active Tailwind tab and the MUI primary are the same color |
| Break-it check 1 | `tokens.css` edited by hand | **1 test failed** |
| Break-it check 2 | A hex color typed into the MUI theme | **1 test failed** |
| Break-it check 3 | MUI kept its own 8px spacing | **1 test failed** |
| Break-it check 4 | `sm:` (screen) used instead of `@sm:` (container) | **1 test and 1 layout check failed** |
| Break-it check 5 | `@container` removed | **1 test and 2 layout checks failed** |
| Break-it check 6 | Recent dishes not sorted newest first | **4 tests failed** |
| Break-it check 7 | Adding the same dish did not raise its quantity | **2 tests failed** |
| Break-it check 8 | The "ready" chip had the wrong color | **1 test failed** |
| Break-it check 9 | Order total ignored the quantity | **2 tests failed** |
| Break-it check 10 | The cart was not emptied after an order | **1 test failed** |
| Break-it check 11 | The table had no newest-first sort | **1 test failed** |
| Break-it check 12 | The 44px minimum height removed | **1 test and 1 layout check failed** |
| Break-it check 13 | A token changed but the CSS not regenerated | **1 test failed** |
| Break-it check 14 | A hex color typed into a component | **1 test failed** |
| Restored original | `npm test` and the layout check | **44 passed**, **16 of 16 layout checks passed** |

---

## 9. Problems avoided

| Problem | Cause | Fix |
|---|---|---|
| jsdom cannot test container queries | It has no layout, so every element is 0 wide | Unit tests check the wiring. A real-browser script checks the behavior. The break check on `sm:` was caught by both |
| Tailwind and MUI drifting apart | Two systems, two copies of each color | One `tokens.js`, a generated `tokens.css`, and tests that compare both outputs to it |
| Different spacing in the two libraries | MUI uses 8px per step, Tailwind 4px | MUI `spacing` set to the token unit, and a browser check that MUI padding 2 is 8px |
| Button text too faint | `brand-600` with white text is about 3.6 to 1 | Primary moved to `brand-700` (about 5.2 to 1) |
| DataGrid shows no rows in tests | jsdom has no size, so the virtual grid renders nothing | A `virtualize` prop, off in tests, on in the real app |
| Column header not found by name | The sorted column's accessible name is more than its label | Tests match with a pattern instead of an exact name |
| `npm run tokens` failing in plain Node | `tokensCss.js` imported `./tokens` without the `.js` ending | Added the ending. Vite does not need it, plain Node does |
| A path error in the hex-scan test | `new URL()` in the jsdom environment is not a file URL | Use `import.meta.dirname` |

---

## 10. What was practiced

- Setting up Tailwind v4 with a custom `@theme` made from tokens.
- Building a component that adapts to its container with `@container` and `@sm:`.
- Knowing when a container query is right and a screen breakpoint is not.
- Using MUI's DataGrid and theme next to Tailwind, and keeping both on one set of design values.
- Turning "no stray colors" into a test.
- Testing what jsdom cannot (layout) with a real browser.
- Checking that tests are real by breaking the code on purpose.

---

## 11. Known limit

The data is a fixed menu and three sample orders in memory (no server). The table is a view only: orders cannot be edited or have their status changed (that is the next kind of work). "Place order" always uses table 5. Pictures are emojis, not photos. The real-browser check needs Playwright, which is **not** in `package.json` (`npm i -D playwright && npx playwright install chromium`); it is optional and `npm test` does not need it. There is no dark mode (the task did not ask for it). The built JavaScript is over 500 kB because MUI's DataGrid is large; splitting it into its own file would be the next step if load time mattered.

---

## 12. How to run it

```bash
cd kitchen-styling
npm install
npm test        # 44 tests (regenerates src/tokens.css first)
npm run dev     # open the link
```

In the page: make the browser window narrow and wide and watch the cards. The cards in the main grid have the picture beside the text, while the same card in the Recently ordered column stacks. On a phone-width window, the main cards stack too. Add dishes, press Place order, then open Orders to see the MUI table (click a column title to sort). To change the look, edit a color in `src/tokens.js`: both the Tailwind parts and the MUI table change together.
