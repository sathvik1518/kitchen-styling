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
