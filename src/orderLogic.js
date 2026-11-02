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
