import { describe, expect, it } from "vitest";
import { normalizeTerm, termFrequency, tokenize } from "@/lib/match/tokenizer";

describe("normalizeTerm", () => {
  it("lowercases and strips accents", () => {
    expect(normalizeTerm("Comunicação")).toBe("comunicacao");
    expect(normalizeTerm("Águia DevOps")).toBe("aguia devops");
  });

  it("preserves tech punctuation", () => {
    expect(normalizeTerm("Node.js")).toBe("node.js");
  });
});

describe("tokenize", () => {
  it("removes stopwords and keeps meaningful unigrams", () => {
    const { unigrams } = tokenize("We are looking for a React developer");
    expect(unigrams).toContain("react");
    expect(unigrams).toContain("developer");
    expect(unigrams).not.toContain("we");
    expect(unigrams).not.toContain("for");
  });

  it("builds bigrams for multi-word skills", () => {
    const { bigrams } = tokenize("strong machine learning background");
    expect(bigrams).toContain("machine learning");
  });

  it("is deterministic for the same input", () => {
    const a = tokenize("Python and SQL and Python");
    const b = tokenize("Python and SQL and Python");
    expect(a).toEqual(b);
  });
});

describe("termFrequency", () => {
  it("counts occurrences", () => {
    const freq = termFrequency(["a", "b", "a", "a"]);
    expect(freq.get("a")).toBe(3);
    expect(freq.get("b")).toBe(1);
  });
});
