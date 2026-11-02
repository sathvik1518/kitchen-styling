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
