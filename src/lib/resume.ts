/**
 * Builds the tailored resume model that templates and exporters consume.
 *
 * This is the bridge between the deterministic match output and the rendering
 * layer: it reorders experiences by relevance, surfaces the keywords to
 * highlight, and optionally swaps in AI-rewritten bullets.
 */

import type {
  EducationItem,
  ExperienceItem,
  MatchResult,
  Profile,
  TailorOptions,
} from "./types";

export interface ResumeModel {
  name: string;
  headline: string;
  contact: Profile["contact"];
  summary: string;
  /** Experiences already ordered by relevance (most relevant first). */
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  /** Normalized keyword terms worth highlighting in the document. */
  highlightTerms: string[];
  /** Free-form user notes carried into the cover letter. */
  notes: string;
  /** Job-fit coverage score (0-1). */
  coverageScore: number;
}

export interface BuildResumeArgs {
  profile: Profile;
  match: MatchResult;
  options: TailorOptions;
  /**
   * Optional map of original bullet text -> AI-rewritten bullet. When present,
   * the matching bullets are replaced. Falls back to the original text.
   */
  rewrittenBullets?: Record<string, string>;
}

export function buildResumeModel({
  profile,
  match,
  options,
  rewrittenBullets,
}: BuildResumeArgs): ResumeModel {
  const experiences = match.rankedExperiences.map((scored) => {
    const exp = scored.experience;
    const bullets = rewrittenBullets
      ? exp.bullets.map((b) => rewrittenBullets[b] ?? b)
      : exp.bullets;
    return { ...exp, bullets };
  });

  return {
    name: profile.name,
    headline: profile.headline,
    contact: profile.contact,
    summary: profile.summary,
    experiences,
    education: profile.education,
    // Surface skills matched by the job first.
    skills: prioritizeSkills(profile.skills, match),
    highlightTerms: match.matchedKeywords.map((k) => k.term),
    notes: options.notes,
    coverageScore: match.coverageScore,
  };
}

function prioritizeSkills(skills: string[], match: MatchResult): string[] {
  const matched = new Set(match.matchedKeywords.map((k) => k.term.toLowerCase()));
  return [...skills].sort((a, b) => {
    const aMatch = matched.has(a.toLowerCase()) ? 0 : 1;
    const bMatch = matched.has(b.toLowerCase()) ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return a.localeCompare(b);
  });
}
