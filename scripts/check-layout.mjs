// A REAL-BROWSER check of the layout. jsdom has no layout, so it cannot test container queries.
// Needs Playwright with Chromium installed:  npm i -D playwright && npx playwright install chromium
// Run:  npm run build && node scripts/check-layout.mjs
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4173;
const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

const browser = await chromium.launch();
try {
  // ---- wide screen ----
  let page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector("article");
  const info = await page.evaluate(() => {
    const dir = (card) => getComputedStyle(card.firstElementChild).flexDirection;
    const shown = (card) => getComputedStyle(card.querySelector("p.hidden")).display !== "none";
    const main = document.querySelector("section[aria-labelledby=menu-title] article");
    const side = document.querySelector("aside article");
    const add = main.querySelector("button");
    return {
      mainWidth: main.getBoundingClientRect().width, sideWidth: side.getBoundingClientRect().width,
      mainDir: dir(main), sideDir: dir(side), mainBlurb: shown(main), sideBlurb: shown(side),
      addBg: getComputedStyle(add).backgroundColor, addH: add.getBoundingClientRect().height,
      radius: getComputedStyle(main).borderTopLeftRadius,
    };
  });
  check("wide screen: main card is wide (>= 24rem = 384px)", info.mainWidth >= 384, `${Math.round(info.mainWidth)}px`);
  check("wide screen: sidebar card is narrow (< 384px)", info.sideWidth < 384, `${Math.round(info.sideWidth)}px`);
  check("wide screen: main card lays out in a ROW", info.mainDir === "row", info.mainDir);
  check("wide screen: sidebar card lays out in a COLUMN (same component)", info.sideDir === "column", info.sideDir);
  check("wide screen: main card shows the description", info.mainBlurb === true);
  check("wide screen: sidebar card hides the description", info.sideBlurb === false);
  check("Add button uses the brand token (#c2410c)", info.addBg === "rgb(194, 65, 12)", info.addBg);
  check("Add button is at least 44px tall", info.addH >= 44, `${info.addH}px`);
  check("card corners use the radius token (12px)", info.radius === "12px", info.radius);
  await page.screenshot({ path: "layout-wide.png" });

  // ---- order table ----
  await page.getByRole("button", { name: "Orders" }).click();
  await page.waitForSelector('[role="grid"] [role="row"][data-id]');
  const grid = await page.evaluate(() => {
    const chip = [...document.querySelectorAll(".MuiChip-root")].find((c) => c.textContent === "ready");
    const paper = document.querySelector("main > div");
    return { rows: document.querySelectorAll('[role="row"][data-id]').length, chipColor: getComputedStyle(chip).color, padding: getComputedStyle(paper).paddingTop, tab: getComputedStyle(document.querySelector("nav button[aria-pressed=true]")).backgroundColor };
  });
  check("order table shows the 3 starting orders", grid.rows === 3, String(grid.rows));
  check("MUI 'ready' chip uses the success token (#15803d)", grid.chipColor === "rgb(21, 128, 61)", grid.chipColor);
  check("MUI padding 2 = 8px = Tailwind p-2", grid.padding === "8px", grid.padding);
  check("active tab (Tailwind) and MUI use one brand color", grid.tab === "rgb(194, 65, 12)", grid.tab);
  await page.screenshot({ path: "layout-orders.png" });
  await page.close();

  // ---- phone ----
  page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector("article");
  const phone = await page.evaluate(() => {
    const main = document.querySelector("section[aria-labelledby=menu-title] article");
    return { w: main.getBoundingClientRect().width, dir: getComputedStyle(main.firstElementChild).flexDirection, scrollW: document.documentElement.scrollWidth };
  });
  check("phone: main card is narrower than 384px (one column on a 390px screen)", phone.w < 384, `${Math.round(phone.w)}px`);
  check("phone: the SAME card switches to a column (container, not screen, decides)", phone.dir === "column", phone.dir);
  check("phone: no sideways scrolling", phone.scrollW <= 390, `${phone.scrollW}px`);
  await page.screenshot({ path: "layout-phone.png" });
} finally {
  await browser.close();
  server.kill();
}

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed === 0 ? `\nAll ${results.length} layout checks passed.` : `\n${failed} of ${results.length} FAILED.`);
process.exit(failed === 0 ? 0 : 1);
