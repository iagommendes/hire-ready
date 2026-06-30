/**
 * Browser-side client for the optional AI refinement. It ONLY calls our own
 * serverless proxy (`/api/rewrite`); it never talks to Google directly and
 * never sees the API key. It is only invoked when the user explicitly opts in.
 */

import type { RewriteRequest, RewriteResponse } from "./types";

export async function rewriteBullets(
  req: RewriteRequest,
): Promise<RewriteResponse> {
  const res = await fetch("/api/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const fallback: RewriteResponse = {
      bullets: req.bullets,
      aiUsed: false,
      notice: `AI request failed (${res.status}). Showing original text.`,
    };
    try {
      const data = (await res.json()) as Partial<RewriteResponse>;
      return { ...fallback, ...data, aiUsed: false };
    } catch {
      return fallback;
    }
  }

  return (await res.json()) as RewriteResponse;
}

/**
 * Maps a list of original bullets to a record of original -> rewritten, so the
 * resume builder can swap them in by text.
 */
export function toRewriteMap(
  originals: string[],
  rewritten: string[],
): Record<string, string> {
  const map: Record<string, string> = {};
  originals.forEach((original, i) => {
    if (rewritten[i]) map[original] = rewritten[i];
  });
  return map;
}
