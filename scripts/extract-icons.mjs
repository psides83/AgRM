import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputFile = path.join(process.cwd(), "public", "all.html");
const outputDir = path.join(process.cwd(), "public", "icons");

const html = await readFile(inputFile, "utf8");
await mkdir(outputDir, { recursive: true });

const svgRegex = /<svg\b[\s\S]*?<\/svg>/g;
const svgs = html.match(svgRegex) ?? [];

const toKebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

let count = 0;

for (const rawSvg of svgs) {
  const iconNameMatch = rawSvg.match(/data-icon-name="([^"]+)"/);

  if (!iconNameMatch) {
    continue;
  }

  const iconName = iconNameMatch[1];
  const fileName = `${toKebabCase(iconName)}.svg`;
  const outputFile = path.join(outputDir, fileName);

  let svg = rawSvg
    .replace(/\s*size="[^"]*"/g, "")
    .replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');

  const fileContents = `${svg.trim()}\n`;

  await writeFile(outputFile, fileContents, "utf8");
  count += 1;
}

console.log(`Extracted ${count} SVG icon files to ${outputDir}`);
