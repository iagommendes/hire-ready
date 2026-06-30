/**
 * Deterministic relevance scorer.
 *
 * For each experience we count how strongly its text overlaps with the job's
 * keywords, weighting each match by the keyword weight produced by the keyword
 * extractor and adding a small recency bonus so that recent, relevant roles
 * float to the top. Pure functions only: identical input => identical output.
 */

import type {
  ExperienceItem,
  Keyword,
  MatchResult,
  Profile,
  ScoredExperience,
} from "../types";
import { tokenize } from "./tokenizer";

const RECENCY_WEIGHT = 0.15;

/** Build the set of normalized terms (unigrams + bigrams) present in a text. */
function termSet(text: string): Set<string> {
  const { unigrams, bigrams } = tokenize(text);
  return new Set<string>([...unigrams, ...bigrams]);
}

function experienceText(exp: ExperienceItem): string {
  return [exp.title, exp.company, ...exp.bullets].join(" \n ");
}

/**
 * Recency bonus in [0, 1]. Current roles (no endYear) score highest; older
 * roles decay. Returns 0 when no year information is available.
 */
function recencyBonus(exp: ExperienceItem, currentYear: number): number {
  const reference = exp.endYear ?? (exp.startYear ? currentYear : undefined);
  if (reference === undefined) return exp.endYear === undefined && exp.startYear ? 1 : 0;
  const age = currentYear - reference;
  if (age <= 0) return 1;
  if (age >= 15) return 0;
  return 1 - age / 15;
}

export interface ScoreOptions {
  /** Override the "current year" for deterministic tests. */
  currentYear?: number;
}

/**
 * Score and rank the experiences of a profile against job keywords.
 */
export function scoreProfile(
  profile: Profile,
  keywords: Keyword[],
  options: ScoreOptions = {},
): MatchResult {
  const currentYear = options.currentYear ?? new Date().getFullYear();
  const keywordByTerm = new Map(keywords.map((k) => [k.term, k]));

  const totalKeywordWeight = keywords.reduce((sum, k) => sum + k.weight, 0) || 1;

  // Track which keywords are matched anywhere in the profile (for coverage).
  const matchedProfileTerms = new Set<string>();

  const scored: ScoredExperience[] = profile.experiences.map((exp) => {
    const terms = termSet(experienceText(exp));
    let score = 0;
    const matchedTerms: string[] = [];

    for (const keyword of keywords) {
      if (terms.has(keyword.term)) {
        score += keyword.weight;
        matchedTerms.push(keyword.term);
        matchedProfileTerms.add(keyword.term);
      }
    }

    const bonus = recencyBonus(exp, currentYear) * RECENCY_WEIGHT;
    // Recency only amplifies experiences that already have some relevance.
    score = score * (1 + bonus);

    return { experience: exp, score: round(score), matchedTerms };
  });

  // Also consider skills + summary for coverage (not just experiences).
  const profileExtraTerms = termSet(
    [profile.summary, ...profile.skills].join(" "),
  );
  for (const keyword of keywords) {
    if (profileExtraTerms.has(keyword.term)) {
      matchedProfileTerms.add(keyword.term);
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tiebreak: more matched terms, then title alphabetically.
    if (b.matchedTerms.length !== a.matchedTerms.length) {
      return b.matchedTerms.length - a.matchedTerms.length;
    }
    return a.experience.title.localeCompare(b.experience.title);
  });

  const matchedKeywords = keywords.filter((k) =>
    matchedProfileTerms.has(k.term),
  );
  const missingKeywords = keywords.filter(
    (k) => !matchedProfileTerms.has(k.term),
  );

  const coveredWeight = matchedKeywords.reduce((sum, k) => sum + k.weight, 0);
  const coverageScore = round(coveredWeight / totalKeywordWeight);

  return {
    matchedKeywords: matchedKeywords.map((k) => keywordByTerm.get(k.term) ?? k),
    missingKeywords,
    rankedExperiences: scored,
    coverageScore,
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
