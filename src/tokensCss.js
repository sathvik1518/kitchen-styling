import { tokens } from "./tokens.js";

const rem = (px) => `${px / 16}rem`;

/** Turns tokens into a Tailwind `@theme` block, so classes like `bg-brand-600` and `rounded-card` exist. */
export function toThemeCss(t = tokens) {
  const lines = [];
  for (const [name, value] of Object.entries(t.color)) {
    if (typeof value === "string") lines.push(`  --color-${name}: ${value};`);
    else for (const [shade, hex] of Object.entries(value)) lines.push(`  --color-${name}-${shade}: ${hex};`);
  }
  lines.push(`  --spacing: ${rem(t.spacingUnit)};`);
  for (const [name, px] of Object.entries(t.radius)) lines.push(`  --radius-${name}: ${rem(px)};`);
  return `/* GENERATED from src/tokens.js by scripts/build-tokens.mjs. Do not edit by hand. */\n@theme {\n${lines.join("\n")}\n}\n`;
}
