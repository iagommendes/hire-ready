import { describe, expect, it } from "vitest";
import { extractKeywords } from "@/lib/match/keywordExtractor";

const JOB = `
We are hiring a Senior Frontend Engineer.
You will work with React, TypeScript and Next.js every day.
Experience with React and testing is required.
Strong communication and teamwork are essential.
Familiarity with machine learning is a plus.
`;

describe("extractKeywords", () => {
  it("ranks known technologies above generic words", () => {
    const keywords = extractKeywords(JOB);
    const top = keywords[0];
    expect(["react", "typescript", "next.js"]).toContain(top.term);
  });

  it("tags skills with the right category", () => {
    const keywords = extractKeywords(JOB);
    const react = keywords.find((k) => k.term === "react");
    expect(react?.category).toBe("technology");
    const communication = keywords.find((k) => k.term === "communication");
    expect(communication?.category).toBe("soft-skill");
  });

  it("captures multi-word skills via bigrams", () => {
    const keywords = extractKeywords(JOB);
    const ml = keywords.find((k) => k.term === "machine learning");
    expect(ml).toBeDefined();
    expect(ml?.category).toBe("technology");
  });

  it("accumulates frequency for repeated terms", () => {
    const keywords = extractKeywords(JOB);
    const react = keywords.find((k) => k.term === "react");
    expect(react?.frequency).toBeGreaterThanOrEqual(2);
  });

  it("respects the limit option deterministically", () => {
    const a = extractKeywords(JOB, { limit: 5 });
    const b = extractKeywords(JOB, { limit: 5 });
    expect(a).toHaveLength(5);
    expect(a).toEqual(b);
  });
});
