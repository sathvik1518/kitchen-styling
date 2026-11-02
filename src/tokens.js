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
