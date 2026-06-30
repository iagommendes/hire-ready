/**
 * Heuristic parser that turns the lines extracted from a LinkedIn PDF export
 * into a structured `Profile`.
 *
 * LinkedIn's "Save to PDF" export is fairly consistent: a name + headline at
 * the top, followed by uppercase-ish section headers ("Summary", "Experience",
 * "Education", "Skills", ...). We rely on those headers plus simple line shape
 * heuristics (dates, bullet markers) to segment the document.
 *
 * The parser is intentionally pure and works on a plain list of text lines so
 * it can be unit-tested without a real PDF.
 */

import type { EducationItem, ExperienceItem, Profile } from "../types";
import type { ExtractedDocument, ExtractedLine } from "./pdfExtractor";

const SECTION_HEADERS: Record<string, string[]> = {
  summary: ["summary", "about", "resumo", "sobre"],
  experience: ["experience", "experiência", "experiencia", "work experience"],
  education: ["education", "educação", "educacao", "formação", "formacao"],
  skills: [
    "skills",
    "top skills",
    "competências",
    "competencias",
    "habilidades",
  ],
};

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /((https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,}(\/[\w#?%&=./-]*)?)/i;
const DATE_RANGE_RE =
  /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[a-z]*\.?\s*\d{4}|\d{4}|present|atual|presente)\b.*\b(present|atual|presente|\d{4})\b/i;
const YEAR_RE = /\b(19|20)\d{2}\b/g;

type SectionName = keyof typeof SECTION_HEADERS;

function normalizeHeader(text: string): SectionName | null {
  const cleaned = text.trim().toLowerCase().replace(/[:•·]/g, "").trim();
  if (cleaned.length > 30) return null;
  for (const [section, aliases] of Object.entries(SECTION_HEADERS)) {
    if (aliases.includes(cleaned)) return section as SectionName;
  }
  return null;
}

function extractYears(period: string): { startYear?: number; endYear?: number } {
  const matches = period.match(YEAR_RE);
  if (!matches || matches.length === 0) return {};
  const years = matches.map(Number).sort((a, b) => a - b);
  const isCurrent = /present|atual|presente/i.test(period);
  return {
    startYear: years[0],
    endYear: isCurrent ? undefined : years[years.length - 1],
  };
}

function looksLikeDateRange(text: string): boolean {
  return DATE_RANGE_RE.test(text);
}

function groupBySection(
  lines: ExtractedLine[],
): { header: SectionName | "head"; lines: string[] }[] {
  const groups: { header: SectionName | "head"; lines: string[] }[] = [
    { header: "head", lines: [] },
  ];
  for (const line of lines) {
    const header = normalizeHeader(line.text);
    if (header) {
      groups.push({ header, lines: [] });
    } else {
      groups[groups.length - 1].lines.push(line.text);
    }
  }
  return groups;
}

function parseContact(headLines: string[]): Profile["contact"] {
  const links: string[] = [];
  let email: string | undefined;
  let phone: string | undefined;
  let location: string | undefined;

  for (const line of headLines) {
    const emailMatch = line.match(EMAIL_RE);
    if (emailMatch && !email) email = emailMatch[0];

    const phoneMatch = line.match(PHONE_RE);
    if (phoneMatch && !phone && !emailMatch) phone = phoneMatch[0].trim();

    const urlMatch = line.match(URL_RE);
    if (urlMatch && /linkedin|github|gitlab|\.dev|portfolio|http/i.test(line)) {
      links.push(urlMatch[0]);
    }

    if (/,\s*[A-Z]/.test(line) && /\b(area|região|region|brazil|brasil|states|kingdom|, )/i.test(line) && !location) {
      location = line.trim();
    }
  }

  return { email, phone, location, links: Array.from(new Set(links)) };
}

function parseExperiences(lines: string[]): ExperienceItem[] {
  const experiences: ExperienceItem[] = [];
  let current: ExperienceItem | null = null;
  let sawDate = false;

  const push = () => {
    if (current && (current.title || current.company)) {
      experiences.push(current);
    }
  };

  for (const raw of lines) {
    const text = raw.trim();
    if (!text) continue;

    const isBullet = /^[•·\-–*]/.test(text);

    if (looksLikeDateRange(text)) {
      // A date range usually sits right under the title/company of a role.
      if (current) {
        current.period = text;
        Object.assign(current, extractYears(text));
        sawDate = true;
      }
      continue;
    }

    if (isBullet) {
      if (current) {
        current.bullets.push(text.replace(/^[•·\-–*]\s*/, "").trim());
      }
      continue;
    }

    // A non-bullet, non-date line after we've already captured a date range is
    // treated as the start of a new role.
    if (!current || sawDate) {
      push();
      current = {
        title: text,
        company: "",
        period: "",
        bullets: [],
      };
      sawDate = false;
    } else if (!current.company) {
      current.company = text;
    } else {
      // Extra descriptive line before any bullet markers.
      current.bullets.push(text);
    }
  }
  push();

  return experiences;
}

function parseEducation(lines: string[]): EducationItem[] {
  const education: EducationItem[] = [];
  let current: EducationItem | null = null;

  const push = () => {
    if (current && current.school) education.push(current);
  };

  for (const raw of lines) {
    const text = raw.trim();
    if (!text) continue;

    if (looksLikeDateRange(text) || /^\(?\d{4}/.test(text)) {
      if (current) current.period = text;
      continue;
    }

    if (!current || current.degree) {
      push();
      current = { school: text, degree: "", period: "" };
    } else {
      current.degree = text;
    }
  }
  push();

  return education;
}

function parseSkills(lines: string[]): string[] {
  const skills: string[] = [];
  for (const raw of lines) {
    // Skills may be comma-separated or one-per-line.
    const parts = raw.split(/[,•·|]/).map((s) => s.trim());
    for (const part of parts) {
      if (part && part.length <= 40) skills.push(part);
    }
  }
  return Array.from(new Set(skills));
}

/**
 * Parse a structured `Profile` from extracted PDF lines.
 */
export function parseLinkedInProfile(doc: ExtractedDocument): Profile {
  const groups = groupBySection(doc.lines);
  const head = groups.find((g) => g.header === "head")?.lines ?? [];

  // The first meaningful head line is the name; the second is the headline.
  const meaningfulHead = head.filter((l) => l.trim().length > 0);
  const name = meaningfulHead[0]?.trim() ?? "";
  const headline =
    meaningfulHead
      .slice(1)
      .find((l) => !EMAIL_RE.test(l) && !PHONE_RE.test(l) && l.length < 90)
      ?.trim() ?? "";

  const sectionLines = (name: SectionName): string[] =>
    groups.filter((g) => g.header === name).flatMap((g) => g.lines);

  const summary = sectionLines("summary").join(" ").trim();

  return {
    name,
    headline,
    contact: parseContact(head),
    summary,
    experiences: parseExperiences(sectionLines("experience")),
    education: parseEducation(sectionLines("education")),
    skills: parseSkills(sectionLines("skills")),
  };
}
