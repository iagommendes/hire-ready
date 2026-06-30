/**
 * Copies the pdf.js worker into /public so it can be served as a local static
 * asset. Runs automatically on `predev` and `prebuild`. Keeping it out of git
 * (it's a build artifact) means contributors always get the version that
 * matches the installed pdfjs-dist.
 */

import { copyFile, mkdir, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const CANDIDATES = [
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/build/pdf.worker.mjs",
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
];

async function resolveWorker() {
  for (const candidate of CANDIDATES) {
    const full = resolve(root, candidate);
    try {
      await access(full);
      return full;
    } catch {
      // try next
    }
  }
  throw new Error(
    "Could not locate the pdf.js worker in pdfjs-dist. Is it installed?",
  );
}

async function main() {
  const source = await resolveWorker();
  const destDir = resolve(__dirname, "../public");
  const dest = resolve(destDir, "pdf.worker.min.mjs");

  await mkdir(destDir, { recursive: true });
  await copyFile(source, dest);

  await access(dest);
  console.log(`[copy-pdf-worker] Copied worker -> public/pdf.worker.min.mjs`);
}

main().catch((err) => {
  console.error("[copy-pdf-worker] Failed:", err.message);
  process.exit(1);
});
