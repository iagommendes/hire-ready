/**
 * Client-side PDF text extraction using pdfjs-dist.
 *
 * Everything here runs in the browser: the user's PDF bytes never leave the
 * machine. We reconstruct text lines from the positioned text items so that the
 * downstream LinkedIn parser can rely on reading order and vertical grouping.
 */

import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Configure the worker. We serve a copy of the pdf.js worker as a static asset
// from /public (see scripts/copy-pdf-worker.mjs, run on predev/prebuild) so the
// browser loads it locally — no third-party CDN, no data leaving the device.
// On a GitHub Pages project site the app lives under a base path, so prefix it.
if (typeof window !== "undefined") {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  pdfjs.GlobalWorkerOptions.workerSrc = `${basePath}/pdf.worker.min.mjs`;
}

export interface ExtractedLine {
  page: number;
  /** Vertical position from the top of the page (smaller = higher). */
  y: number;
  /** Left-most x of the line, useful to detect indentation. */
  x: number;
  text: string;
  /** Max font height seen on the line, a hint for headings. */
  fontSize: number;
}

export interface ExtractedDocument {
  lines: ExtractedLine[];
  /** Full plain-text dump (lines joined with newlines), handy for fallback. */
  rawText: string;
}

const LINE_GROUPING_TOLERANCE = 3; // px difference in y treated as same line.

function isTextItem(item: unknown): item is TextItem {
  return typeof (item as TextItem)?.str === "string";
}

/**
 * Extract structured lines from a PDF file (provided as an ArrayBuffer).
 */
export async function extractPdf(
  data: ArrayBuffer,
): Promise<ExtractedDocument> {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
  const pdf = await loadingTask.promise;
  const lines: ExtractedLine[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    // Bucket text items by their vertical position to rebuild lines.
    type Bucket = { y: number; items: { x: number; str: string; h: number }[] };
    const buckets: Bucket[] = [];

    for (const item of content.items) {
      if (!isTextItem(item) || item.str.trim() === "") continue;
      // transform = [a, b, c, d, e, f]; e = x, f = y (PDF bottom-left origin).
      const x = item.transform[4];
      const yFromBottom = item.transform[5];
      const yFromTop = viewport.height - yFromBottom;
      const height = Math.abs(item.transform[3]) || item.height || 10;

      const bucket = buckets.find(
        (b) => Math.abs(b.y - yFromTop) <= LINE_GROUPING_TOLERANCE,
      );
      if (bucket) {
        bucket.items.push({ x, str: item.str, h: height });
      } else {
        buckets.push({ y: yFromTop, items: [{ x, str: item.str, h: height }] });
      }
    }

    buckets.sort((a, b) => a.y - b.y);
    for (const bucket of buckets) {
      bucket.items.sort((a, b) => a.x - b.x);
      const text = bucket.items
        .map((i) => i.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) continue;
      lines.push({
        page: pageNum,
        y: bucket.y,
        x: Math.min(...bucket.items.map((i) => i.x)),
        text,
        fontSize: Math.max(...bucket.items.map((i) => i.h)),
      });
    }
  }

  await pdf.cleanup();

  return {
    lines,
    rawText: lines.map((l) => l.text).join("\n"),
  };
}

/**
 * Convenience wrapper that reads a File (from an <input type="file">) and
 * extracts its content. Kept separate so the core `extractPdf` stays testable
 * with plain ArrayBuffers.
 */
export async function extractPdfFromFile(
  file: File,
): Promise<ExtractedDocument> {
  const buffer = await file.arrayBuffer();
  return extractPdf(buffer);
}
