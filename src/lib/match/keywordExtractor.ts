/**
 * Extracts and ranks the most relevant keywords from a job description.
 *
 * Scoring is deterministic: weight = termFrequency * categoryBoost. Terms that
 * match the curated skills dictionary receive a strong boost (and a category),
 * while plain high-frequency words keep a baseline weight. Bigrams that match a
 * known multi-word skill are preferred over their constituent unigrams.
 */

import type { Keyword, SkillCategory } from "../types";
import { lookupSkill } from "./skills";
import { termFrequency, tokenize } from "./tokenizer";

const CATEGORY_BOOST: Record<SkillCategory, number> = {
  technology: 3,
  methodology: 2.5,
  "soft-skill": 2,
  generic: 1,
};

export interface ExtractOptions {
  /** Maximum number of keywords to return. */
  limit?: number;
  /** Minimum weight required to keep a keyword. */
  minWeight?: number;
}

/**
 * Extract ranked keywords from a job description.
 */
export function extractKeywords(
  jobDescription: string,
  options: ExtractOptions = {},
): Keyword[] {
  const { limit = 30, minWeight = 0 } = options;
  const { unigrams, bigrams } = tokenize(jobDescription);

  const unigramFreq = termFrequency(unigrams);
  const bigramFreq = termFrequency(bigrams);

  const keywords = new Map<string, Keyword>();

  // 1. Promote known multi-word skills from bigrams first.
  const consumedUnigrams = new Set<string>();
  for (const [bigram, freq] of bigramFreq) {
    const skill = lookupSkill(bigram);
    if (skill) {
      const canonical = skill.canonical;
      const boost = CATEGORY_BOOST[skill.category];
      keywords.set(canonical, {
        term: canonical,
        display: skill.display,
        frequency: freq,
        weight: freq * boost,
        category: skill.category,
      });
      // Avoid double-counting the words that formed this skill.
      for (const part of bigram.split(" ")) consumedUnigrams.add(part);
    }
  }

  // 2. Process unigrams.
  for (const [term, freq] of unigramFreq) {
    if (consumedUnigrams.has(term)) continue;
    const skill = lookupSkill(term);
    const category: SkillCategory = skill ? skill.category : "generic";
    const boost = CATEGORY_BOOST[category];
    const canonical = skill ? skill.canonical : term;

    const existing = keywords.get(canonical);
    const weight = freq * boost;
    if (existing) {
      existing.frequency += freq;
      existing.weight += weight;
    } else {
      keywords.set(canonical, {
        term: canonical,
        display: skill ? skill.display : term,
        frequency: freq,
        weight,
        category,
      });
    }
  }

  return Array.from(keywords.values())
    .filter((k) => k.weight >= minWeight)
    .sort((a, b) => {
      // Deterministic ordering: weight desc, then frequency desc, then term asc.
      if (b.weight !== a.weight) return b.weight - a.weight;
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      return a.term.localeCompare(b.term);
    })
    .slice(0, limit);
}
