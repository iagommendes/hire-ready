import { describe, expect, it } from "vitest";
import { extractKeywords } from "@/lib/match/keywordExtractor";
import { scoreProfile } from "@/lib/match/scorer";
import type { Profile } from "@/lib/types";

const profile: Profile = {
  name: "Jane Doe",
  headline: "Frontend Engineer",
  contact: { links: [] },
  summary: "Frontend engineer who loves clean UI.",
  experiences: [
    {
      title: "Senior Frontend Engineer",
      company: "Acme",
      period: "2022 - Present",
      startYear: 2022,
      endYear: undefined,
      bullets: [
        "Built design systems in React and TypeScript.",
        "Improved testing coverage with Jest.",
      ],
    },
    {
      title: "Backend Developer",
      company: "OldCorp",
      period: "2010 - 2012",
      startYear: 2010,
      endYear: 2012,
      bullets: ["Maintained legacy PHP services."],
    },
  ],
  education: [],
  skills: ["React", "TypeScript", "Jest"],
};

const JOB = "Looking for a React and TypeScript engineer with testing skills.";

describe("scoreProfile", () => {
  it("ranks the most relevant experience first", () => {
    const keywords = extractKeywords(JOB);
    const result = scoreProfile(profile, keywords, { currentYear: 2024 });
    expect(result.rankedExperiences[0].experience.title).toBe(
      "Senior Frontend Engineer",
    );
    expect(result.rankedExperiences[0].score).toBeGreaterThan(
      result.rankedExperiences[1].score,
    );
  });

  it("identifies matched and missing keywords", () => {
    const keywords = extractKeywords(JOB);
    const result = scoreProfile(profile, keywords, { currentYear: 2024 });
    const matchedTerms = result.matchedKeywords.map((k) => k.term);
    expect(matchedTerms).toContain("react");
    expect(matchedTerms).toContain("typescript");
  });

  it("computes a coverage score between 0 and 1", () => {
    const keywords = extractKeywords(JOB);
    const result = scoreProfile(profile, keywords, { currentYear: 2024 });
    expect(result.coverageScore).toBeGreaterThan(0);
    expect(result.coverageScore).toBeLessThanOrEqual(1);
  });

  it("is deterministic", () => {
    const keywords = extractKeywords(JOB);
    const a = scoreProfile(profile, keywords, { currentYear: 2024 });
    const b = scoreProfile(profile, keywords, { currentYear: 2024 });
    expect(a).toEqual(b);
  });
});
