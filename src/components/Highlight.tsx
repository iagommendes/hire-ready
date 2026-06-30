"use client";

import { Fragment, useMemo } from "react";

interface HighlightProps {
  text: string;
  terms: string[];
}

/**
 * Highlights occurrences of `terms` within `text` (case-insensitive). Terms are
 * the normalized keyword strings; we build a single regex from them.
 */
export function Highlight({ text, terms }: HighlightProps) {
  const regex = useMemo(() => {
    const escaped = terms
      .filter((t) => t.length >= 2)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length);
    if (escaped.length === 0) return null;
    return new RegExp(`(${escaped.join("|")})`, "gi");
  }, [terms]);

  if (!regex) return <>{text}</>;

  // Splitting on a single capturing group yields matches at odd indices.
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-amber-100 px-0.5 font-medium text-amber-900"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
