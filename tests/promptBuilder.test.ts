import { describe, expect, it } from "vitest";
import {
  buildRewritePrompt,
  parseRewriteOutput,
} from "@/lib/ai/promptBuilder";

describe("buildRewritePrompt", () => {
  it("includes keywords, notes and bullets", () => {
    const prompt = buildRewritePrompt({
      bullets: ["Built X", "Led Y"],
      jobKeywords: ["react", "typescript"],
      tone: "professional",
      notes: "Open to relocation",
    });
    expect(prompt).toContain("react, typescript");
    expect(prompt).toContain("Open to relocation");
    expect(prompt).toContain("Built X");
  });
});

describe("parseRewriteOutput", () => {
  it("parses a clean JSON array", () => {
    const out = parseRewriteOutput('["a", "b"]', 2);
    expect(out).toEqual(["a", "b"]);
  });

  it("strips markdown fences", () => {
    const out = parseRewriteOutput('```json\n["a", "b"]\n```', 2);
    expect(out).toEqual(["a", "b"]);
  });

  it("throws on length mismatch", () => {
    expect(() => parseRewriteOutput('["a"]', 2)).toThrow();
  });

  it("throws on non-array", () => {
    expect(() => parseRewriteOutput('{"x":1}', 1)).toThrow();
  });
});
