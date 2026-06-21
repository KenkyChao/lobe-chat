#!/usr/bin/env node
/**
 * Generate the macOS tray template icon set (black + alpha).
 *
 * Template images must contain only black pixels and an alpha channel;
 * macOS then recolors them automatically based on the menu bar theme.
 *
 * Renders two files in apps/desktop/resources:
 *   - trayTemplate.png       (@1x, 18x18)
 *   - trayTemplate@2x.png    (@2x, 36x36)
 *
 * Run: bun run apps/desktop/scripts/generate-tray-template.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'resources');

// Silhouette derived from the NaiYunHub cloud logo. The speech bubble is cut as
// a transparent hole so it remains visible when macOS tints the template image.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path
    fill="#000"
    fill-rule="evenodd"
    d="M17.2 48.5h31.6C56.1 48.5 62 42.8 62 35.8c0-6.6-5.1-12.1-11.7-12.7C48.2 14.3 40.6 8 31.7 8c-7.2 0-13.5 4.1-16.7 10.1C7.7 19.1 2 25.5 2 33.1c0 8.5 6.8 15.4 15.2 15.4ZM33.5 37.4c6.8 0 12.4-4.4 12.4-9.9s-5.6-9.9-12.4-9.9S21.1 22 21.1 27.5c0 2.8 1.5 5.3 3.9 7.1l-1.7 6.3 6.7-3.4c1.1.2 2.3.4 3.5.4Z"
  />
  <path
    fill="none"
    stroke="#000"
    stroke-linecap="round"
    stroke-width="4"
    d="M11.5 11.5 8 7.5M19.5 8.5 18.5 3.5"
  />
</svg>
`;

async function render(size, outFile) {
  const buf = Buffer.from(svg);
  await sharp(buf, { density: Math.max(72, size * 12) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outFile);
  console.log(`wrote ${path.relative(process.cwd(), outFile)} (${size}x${size})`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await render(18, path.join(outDir, 'trayTemplate.png'));
  await render(36, path.join(outDir, 'trayTemplate@2x.png'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
