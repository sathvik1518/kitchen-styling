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
