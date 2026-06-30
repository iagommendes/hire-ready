/**
 * Builds the Gemini prompt server-side. Kept as a pure function so it can be
 * unit-tested and reasoned about independently of the network call.
 */

import type { DocumentTone } from "../types";
import type { RewriteRequest } from "./types";

const TONE_GUIDANCE: Record<DocumentTone, string> = {
  professional:
    "Use a polished, professional tone with strong action verbs and quantified impact where possible.",
  concise:
    "Be concise and direct. Prefer short, punchy bullets with concrete results.",
  enthusiastic:
    "Use an energetic, enthusiastic tone while staying credible and specific.",
};

export const SYSTEM_INSTRUCTION = [
  "You are an expert technical resume writer.",
  "Rewrite each resume bullet to be clearer, more impactful and ATS-friendly.",
  "Never invent facts, employers, metrics, or technologies that are not present.",
  "Keep each bullet to a single sentence and preserve the original meaning.",
  "Naturally incorporate the provided job keywords ONLY when they are already implied by the bullet.",
].join(" ");

/**
 * Build the user prompt. Asks the model to return a strict JSON array so the
 * response is easy and safe to parse.
 */
export function buildRewritePrompt(req: RewriteRequest): string {
  const keywords = req.jobKeywords.slice(0, 15).join(", ");
  const notes = req.notes?.trim();

  return [
    TONE_GUIDANCE[req.tone],
    keywords ? `Target job keywords: ${keywords}.` : "",
    notes ? `Candidate notes / context: ${notes}` : "",
    "",
    "Rewrite the following bullets. Return ONLY a JSON array of strings,",
    "with exactly one rewritten string per input bullet, in the same order.",
    "Do not wrap the JSON in markdown fences.",
    "",
    JSON.stringify(req.bullets, null, 2),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Defensive parser for the model output. Strips accidental markdown fences and
 * validates the shape; throws when it can't recover a usable array.
 */
export function parseRewriteOutput(
  raw: string,
  expectedLength: number,
): string[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string")) {
    throw new Error("Model did not return a JSON array of strings");
  }
  if (parsed.length !== expectedLength) {
    throw new Error("Rewrite length mismatch");
  }
  return parsed.map((s) => s.trim());
}
