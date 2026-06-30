/**
 * Public entry point for the deterministic match module.
 */

import type { MatchResult, Profile } from "../types";
import { extractKeywords, type ExtractOptions } from "./keywordExtractor";
import { scoreProfile, type ScoreOptions } from "./scorer";

export { tokenize, normalizeTerm, termFrequency } from "./tokenizer";
export { extractKeywords } from "./keywordExtractor";
export { scoreProfile } from "./scorer";
export { lookupSkill, isKnownSkill } from "./skills";

export interface AnalyzeOptions extends ExtractOptions, ScoreOptions {}

/**
 * One-shot analysis: extract keywords from the job description and rank the
 * profile's experiences against them.
 */
export function analyze(
  profile: Profile,
  jobDescription: string,
  options: AnalyzeOptions = {},
): MatchResult {
  const keywords = extractKeywords(jobDescription, options);
  return scoreProfile(profile, keywords, options);
}
