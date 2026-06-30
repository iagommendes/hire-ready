import { describe, expect, it } from "vitest";
import { coverLetterToTxt, resumeToTxt } from "@/lib/export/txtExporter";
import type { ResumeModel } from "@/lib/resume";

const model: ResumeModel = {
  name: "Jane Doe",
  headline: "Frontend Engineer",
  contact: { email: "jane@example.com", links: ["linkedin.com/in/jane"] },
  summary: "Engineer focused on UX.",
  experiences: [
    {
      title: "Senior Frontend Engineer",
      company: "Acme",
      period: "2022 - Present",
      bullets: ["Built design systems", "Led TypeScript migration"],
    },
  ],
  education: [{ school: "MIT", degree: "BSc CS", period: "2015 - 2019" }],
  skills: ["React", "TypeScript"],
  highlightTerms: ["react", "typescript"],
  notes: "Available immediately.",
  coverageScore: 0.8,
};

describe("resumeToTxt", () => {
  it("includes all major sections", () => {
    const txt = resumeToTxt(model);
    expect(txt).toContain("Jane Doe");
    expect(txt).toContain("SUMMARY");
    expect(txt).toContain("EXPERIENCE");
    expect(txt).toContain("Senior Frontend Engineer — Acme");
    expect(txt).toContain("- Built design systems");
    expect(txt).toContain("EDUCATION");
    expect(txt).toContain("SKILLS");
    expect(txt).toContain("React, TypeScript");
  });
});

describe("coverLetterToTxt", () => {
  it("greets and references top experience and notes", () => {
    const letter = coverLetterToTxt(model, "professional");
    expect(letter).toContain("Dear Hiring Manager");
    expect(letter).toContain("Senior Frontend Engineer");
    expect(letter).toContain("Available immediately.");
    expect(letter).toContain("Jane Doe");
  });

  it("varies the opener by tone", () => {
    const enthusiastic = coverLetterToTxt(model, "enthusiastic");
    expect(enthusiastic).toContain("thrilled");
  });
});
