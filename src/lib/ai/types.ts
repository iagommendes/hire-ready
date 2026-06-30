/**
 * Shared types for the optional AI refinement module. These cross the
 * client <-> serverless boundary, so keep them serializable.
 */

import type { DocumentTone } from "../types";

export interface RewriteRequest {
  /** Original resume bullets to rewrite. */
  bullets: string[];
  /** Top job keywords (display form) to weave in naturally. */
  jobKeywords: string[];
  /** Desired tone for the rewrite. */
  tone: DocumentTone;
  /** Optional free-form user notes / context. */
  notes?: string;
}

export interface RewriteResponse {
  /**
   * Rewritten bullets, index-aligned with the request. On any failure the
   * server returns the originals so the client degrades gracefully.
   */
  bullets: string[];
  /** True when the rewrite came from the model (false = passthrough fallback). */
  aiUsed: boolean;
  /** Human-readable note when AI was skipped (e.g. "not configured"). */
  notice?: string;
}
