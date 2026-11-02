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
