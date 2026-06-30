/**
 * Shared domain types used across the parsing, match, export and AI modules.
 * Keeping them in one place makes it easy for contributors to understand the
 * data that flows through the app.
 */

export interface ExperienceItem {
  /** Job title, e.g. "Senior Frontend Engineer". */
  title: string;
  /** Company / organization name. */
  company: string;
  /** Raw period string as found in the PDF, e.g. "Jan 2021 - Present". */
  period: string;
  /** Approximate start year parsed from the period, used for recency bonus. */
  startYear?: number;
  /** Approximate end year parsed from the period (undefined if current). */
  endYear?: number;
  /** Bullet points / description lines for this experience. */
  bullets: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
}

/**
 * Structured profile extracted from a LinkedIn PDF export.
 */
export interface Profile {
  name: string;
  headline: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    links: string[];
  };
  summary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export type SkillCategory =
  | "technology"
  | "soft-skill"
  | "methodology"
  | "generic";

export interface Keyword {
  /** Normalized term (lowercase, accents stripped). */
  term: string;
  /** Original surface form for display. */
  display: string;
  /** Raw term frequency in the job description. */
  frequency: number;
  /** Final relevance weight after dictionary boosting. */
  weight: number;
  category: SkillCategory;
}

export interface ScoredExperience {
  experience: ExperienceItem;
  score: number;
  /** Keywords (normalized terms) matched within this experience. */
  matchedTerms: string[];
}

export interface MatchResult {
  /** Top keywords extracted from the job description, ranked by weight. */
  matchedKeywords: Keyword[];
  /** Keywords present in the job but absent from the whole profile. */
  missingKeywords: Keyword[];
  /** Experiences reordered by descending relevance score. */
  rankedExperiences: ScoredExperience[];
  /**
   * Fraction (0-1) of weighted job keywords covered by the profile.
   * Useful as a quick "how well do I fit" signal.
   */
  coverageScore: number;
}

export type DocumentTone = "professional" | "concise" | "enthusiastic";

export interface TailorOptions {
  tone: DocumentTone;
  /** Free-form notes dictated or typed by the user. */
  notes: string;
}
