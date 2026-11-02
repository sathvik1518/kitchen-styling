// Writes src/tokens.css from src/tokens.js. Runs before dev, build and test.
import { writeFileSync } from "node:fs";
import { toThemeCss } from "../src/tokensCss.js";

writeFileSync(new URL("../src/tokens.css", import.meta.url), toThemeCss());
console.log("wrote src/tokens.css");
