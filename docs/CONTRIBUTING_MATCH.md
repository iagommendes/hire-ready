# Improving the Match Algorithm

The match engine is 100% deterministic and dependency-free. It lives in
[`src/lib/match/`](../src/lib/match/) and is covered by unit tests in
[`tests/`](../tests/). Same input ⇒ same output, so every change should be
backed by a test.

## How it works

```
job description ──▶ tokenize ──▶ extractKeywords ──┐
                                                   ├─▶ scoreProfile ──▶ MatchResult
profile (from PDF) ────────────────────────────────┘
```

1. **`tokenizer.ts`** — normalizes text (lowercase, strip accents), removes
   PT/EN stopwords, and emits **unigrams + bigrams**. Bigrams let us catch
   multi-word skills like `machine learning` or `scrum master`.

2. **`keywordExtractor.ts`** — counts term frequency in the job description and
   computes `weight = frequency × categoryBoost`. Terms found in the curated
   skills dictionary get a strong boost and a category; multi-word skills are
   promoted from bigrams before their constituent unigrams are counted.

3. **`scorer.ts`** — for each experience, sums the weights of the job keywords
   it contains, applies a small **recency bonus**, and ranks experiences by
   descending score. It also computes `coverageScore` (weighted fraction of job
   keywords present anywhere in the profile) and the `missingKeywords` list.

## Common contributions

### Add skills to the dictionary

Edit [`data/skills.json`](../data/skills.json). It is grouped by category
(`technology`, `methodology`, `soft-skill`). Each entry has a canonical `term`
and optional `aliases` (which are normalized on load):

```json
{ "term": "kubernetes", "aliases": ["k8s"] }
```

- Use the lowercase canonical form as `term`.
- Add real-world aliases and spellings (including PT-BR variants).
- Multi-word terms work — they are matched against bigrams.

### Tune stopwords

Edit [`data/stopwords.en.json`](../data/stopwords.en.json) or
[`data/stopwords.pt.json`](../data/stopwords.pt.json) to drop noise words that
shouldn't count as keywords.

### Adjust scoring weights

- `CATEGORY_BOOST` in `keywordExtractor.ts` controls how strongly each category
  outranks generic words.
- `RECENCY_WEIGHT` in `scorer.ts` controls how much recent roles are favored.

## Testing

Run the suite:

```bash
npm test
```

When you change behavior:

1. Add or update a test in `tests/` (e.g. `keywordExtractor.test.ts`).
2. Keep functions **pure** — pass `currentYear` into `scoreProfile` for
   deterministic recency tests instead of reading the clock.
3. Make sure existing tests still pass; the determinism tests guard against
   accidental nondeterminism.
