import { describe, expect, it } from "vitest";
import { parseLinkedInProfile } from "@/lib/parsing/linkedinParser";
import type { ExtractedDocument, ExtractedLine } from "@/lib/parsing/pdfExtractor";

function makeDoc(lines: string[]): ExtractedDocument {
  const extracted: ExtractedLine[] = lines.map((text, i) => ({
    page: 1,
    y: i * 12,
    x: 0,
    text,
    fontSize: 11,
  }));
  return { lines: extracted, rawText: lines.join("\n") };
}

describe("parseLinkedInProfile", () => {
  const doc = makeDoc([
    "Jane Doe",
    "Senior Frontend Engineer at Acme",
    "jane@example.com",
    "linkedin.com/in/janedoe",
    "Summary",
    "Frontend engineer passionate about UX.",
    "Experience",
    "Senior Frontend Engineer",
    "Acme",
    "Jan 2022 - Present",
    "• Built design systems in React",
    "• Led migration to TypeScript",
    "Frontend Developer",
    "StartupX",
    "2019 - 2022",
    "• Shipped the customer dashboard",
    "Education",
    "MIT",
    "BSc Computer Science",
    "2015 - 2019",
    "Skills",
    "React, TypeScript, Node.js",
  ]);

  const profile = parseLinkedInProfile(doc);

  it("extracts name and headline", () => {
    expect(profile.name).toBe("Jane Doe");
    expect(profile.headline).toContain("Frontend Engineer");
  });

  it("extracts contact info", () => {
    expect(profile.contact.email).toBe("jane@example.com");
    expect(profile.contact.links.some((l) => l.includes("linkedin"))).toBe(true);
  });

  it("captures the summary", () => {
    expect(profile.summary).toContain("Frontend engineer");
  });

  it("parses multiple experiences with bullets", () => {
    expect(profile.experiences.length).toBeGreaterThanOrEqual(2);
    const first = profile.experiences[0];
    expect(first.title).toBe("Senior Frontend Engineer");
    expect(first.company).toBe("Acme");
    expect(first.bullets.length).toBe(2);
    expect(first.startYear).toBe(2022);
    expect(first.endYear).toBeUndefined();
  });

  it("parses education and skills", () => {
    expect(profile.education[0]?.school).toBe("MIT");
    expect(profile.skills).toContain("React");
    expect(profile.skills).toContain("Node.js");
  });
});
