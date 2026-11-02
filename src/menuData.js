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
