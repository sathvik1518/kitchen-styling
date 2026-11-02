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
