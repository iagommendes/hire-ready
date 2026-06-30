/**
 * Deterministic, dependency-free text tokenizer shared by the keyword
 * extractor and the scorer.
 *
 * Pipeline: lowercase -> strip accents -> split on non-word chars ->
 * drop stopwords (PT + EN) and very short tokens -> emit unigrams and
 * bigrams. Bigrams let us capture multi-word skills like "machine learning"
 * or "scrum master".
 */

import stopwordsEn from "../../../data/stopwords.en.json";
import stopwordsPt from "../../../data/stopwords.pt.json";

const STOPWORDS = new Set<string>([...stopwordsEn, ...stopwordsPt]);

// Characters we keep inside tokens so that "node.js", "ci/cd" and "c#" survive.
const TOKEN_KEEP = "a-z0-9+#./-";

/**
 * Normalize a single term: lowercase + remove diacritics + trim punctuation.
 */
export function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isStopword(token: string): boolean {
  return STOPWORDS.has(token);
}

function isMeaningful(token: string): boolean {
  if (!token) return false;
  if (isStopword(token)) return false;
  // Keep short tokens only if they look like a real tech token (c#, go, ml).
  if (token.length < 2) return false;
  // Drop pure punctuation leftovers.
  if (!/[a-z0-9]/.test(token)) return false;
  return true;
}

export interface TokenizeResult {
  /** Cleaned single tokens, in reading order. */
  unigrams: string[];
  /** Adjacent token pairs joined by a space. */
  bigrams: string[];
}

/**
 * Tokenize free text into unigrams and bigrams.
 */
export function tokenize(text: string): TokenizeResult {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const rawTokens = normalized
    .split(new RegExp(`[^${TOKEN_KEEP}]+`))
    .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter(Boolean);

  const unigrams = rawTokens.filter(isMeaningful);

  const bigrams: string[] = [];
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const a = rawTokens[i];
    const b = rawTokens[i + 1];
    // Only build bigrams from meaningful tokens so we don't create noise like
    // "the team" -> the stopwords are skipped individually but a bigram such as
    // "machine learning" survives.
    if (isMeaningful(a) && isMeaningful(b)) {
      bigrams.push(`${a} ${b}`);
    }
  }

  return { unigrams, bigrams };
}

/**
 * Count occurrences of each term, returning a Map preserving first-seen order
 * via insertion order (deterministic for the same input).
 */
export function termFrequency(terms: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const term of terms) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }
  return counts;
}
