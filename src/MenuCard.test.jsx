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
