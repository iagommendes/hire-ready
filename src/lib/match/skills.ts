/**
 * Loads the curated skills dictionary and exposes fast lookup helpers.
 *
 * The dictionary maps surface forms (including aliases) to a canonical term and
 * a category. The keyword extractor uses it to (a) boost the relevance of real
 * skills over generic words and (b) tag each keyword with a category so the UI
 * can group them.
 */

import skillsData from "../../../data/skills.json";
import type { SkillCategory } from "../types";
import { normalizeTerm } from "./tokenizer";

interface SkillEntry {
  term: string;
  aliases: string[];
}

type RawSkills = Record<Exclude<SkillCategory, "generic">, SkillEntry[]>;

export interface CanonicalSkill {
  canonical: string;
  display: string;
  category: SkillCategory;
}

// Map of normalized surface form -> canonical skill.
const lookup = new Map<string, CanonicalSkill>();

for (const [category, entries] of Object.entries(skillsData as RawSkills)) {
  for (const entry of entries) {
    const canonical = entry.term;
    const surfaces = [entry.term, ...entry.aliases];
    for (const surface of surfaces) {
      const key = normalizeTerm(surface);
      if (key && !lookup.has(key)) {
        lookup.set(key, {
          canonical,
          display: canonical,
          category: category as SkillCategory,
        });
      }
    }
  }
}

/**
 * Returns the canonical skill for a normalized term, or null if it is not a
 * known skill.
 */
export function lookupSkill(normalizedTerm: string): CanonicalSkill | null {
  return lookup.get(normalizedTerm) ?? null;
}

export function isKnownSkill(normalizedTerm: string): boolean {
  return lookup.has(normalizedTerm);
}
