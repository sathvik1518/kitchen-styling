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
